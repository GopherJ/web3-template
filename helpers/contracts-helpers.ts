import {
  Artifact,
  HardhatRuntimeEnvironment,
  HttpNetworkConfig,
} from "hardhat/types";
import {
  DRE,
  getDb,
  isFork,
  isLocalTestnet,
  isMoonbeam,
  sleep,
  waitForTx,
} from "./misc-utils";
import {
  ConstructorArgs,
  DbEntry,
  DryRunExecutor,
  EtherscanVerificationProvider,
  Libraries,
  SignerWithAddress,
  eContractid,
  iFunctionSignature,
  tEthereumAddress,
} from "./types";
import {
  Contract,
  ContractFactory,
  ContractTransaction,
  ethers,
  utils,
} from "ethers";
import {isAddress, solidityKeccak256} from "ethers/lib/utils";
import InputDataDecoder from "ethereum-input-data-decoder";
import {isZeroAddress} from "ethereumjs-util";
import {
  COMPILER_OPTIMIZER_RUNS,
  COMPILER_VERSION,
  DEPLOY_INCREMENTAL,
  DEPLOY_MAX_RETRIES,
  DEPLOY_RETRY_INTERVAL,
  DRY_RUN,
  ETHERSCAN_APIS,
  ETHERSCAN_KEY,
  ETHERSCAN_NETWORKS,
  ETHERSCAN_VERIFICATION_CONTRACTS,
  ETHERSCAN_VERIFICATION_PROVIDER,
  FORK,
  GLOBAL_OVERRIDES,
  MULTI_SEND,
  MULTI_SEND_CHUNK_SIZE,
  MULTI_SIG,
  MULTI_SIG_NONCE,
  PKG_DATA,
  VERSION,
} from "./constants";
import {chunk, first} from "lodash";
import minimatch from "minimatch";
import {verifyEtherscanContract} from "./etherscan";
import shell from "shelljs";
import {
  getExecutionTime,
  getFirstSigner,
  getTimeLockData,
  getTimeLockDataInDb,
  insertTimeLockDataInDb,
} from "./contracts-getters";
import EthersAdapter from "@safe-global/safe-ethers-lib";
import Safe from "@safe-global/safe-core-sdk";
import SafeServiceClient from "@safe-global/safe-service-client";
import {
  OperationType,
  SafeTransactionDataPartial,
} from "@safe-global/safe-core-sdk-types";
import {encodeMulti, MetaTransaction} from "ethers-multisend";
import {mapLimit} from "async";

export const impersonateAddress = async (
  address: tEthereumAddress
): Promise<SignerWithAddress> => {
  const forkednetProvider = new ethers.providers.JsonRpcProvider(
    (DRE.network.config as HttpNetworkConfig).url
  );

  const signer = isLocalTestnet()
    ? (DRE as HardhatRuntimeEnvironment).ethers.provider.getSigner(address)
    : forkednetProvider.getSigner(address);

  return {
    signer,
    address,
  };
};

export const getProxyAdmin = async (proxyAddress: string) => {
  const EIP1967_ADMIN_SLOT =
    "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
  const adminStorageSlot = await DRE.ethers.provider.getStorageAt(
    proxyAddress,
    EIP1967_ADMIN_SLOT,
    "latest"
  );
  const adminAddress = utils.defaultAbiCoder
    .decode(["address"], adminStorageSlot)
    .toString();
  return utils.getAddress(adminAddress);
};

export const getProxyImplementation = async (proxyAddress: string) => {
  const EIP1967_IMPL_SLOT =
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  const implStorageSlot = await DRE.ethers.provider.getStorageAt(
    proxyAddress,
    EIP1967_IMPL_SLOT,
    "latest"
  );
  const implAddress = utils.defaultAbiCoder
    .decode(["address"], implStorageSlot)
    .toString();
  return utils.getAddress(implAddress);
};

export const withSaveAndVerify = async (
  {
    artifact,
    factory,
    customData,
  }: {
    artifact: Artifact;
    factory: ContractFactory;
    customData: any;
  },
  id: string,
  args: ConstructorArgs,
  verify = true,
  proxy = false,
  libraries?: Libraries,
  signatures?: iFunctionSignature[]
) =>
  await retry(async () => {
    const addressInDb = await getContractAddressInDb(id);
    if (DEPLOY_INCREMENTAL && isNotFalsyOrZeroAddress(addressInDb)) {
      console.log("contract address is already in db", id);
      return await factory.attach(addressInDb);
    }

    const normalizedLibraries = normalizeLibraryAddresses(libraries);
    const deployArgs = proxy ? args.slice(0, args.length - 2) : args;
    const [impl, initData] = (
      proxy ? args.slice(args.length - 2) : []
    ) as string[];

    if (customData) {
      GLOBAL_OVERRIDES.customData = customData;
    }
    const instance = await factory.deploy(...deployArgs, GLOBAL_OVERRIDES);
    delete GLOBAL_OVERRIDES.customData;
    await waitForTx(instance.deployTransaction);
    await registerContractInDb(
      id,
      instance,
      deployArgs,
      normalizedLibraries,
      signatures
    );

    if (proxy) {
      await waitForTx(
        await (instance as any).initialize(impl, initData, GLOBAL_OVERRIDES)
      );
    }

    if (verify) {
      await verifyContract(
        id,
        instance.address,
        artifact,
        deployArgs,
        normalizedLibraries
      );
    }

    return instance;
  });

export const printContracts = () => {
  const network = DRE.network.name;
  const db = getDb();
  console.log("Contracts deployed at", network);
  console.log("---------------------------------");

  const entries = Object.entries<DbEntry>(db.getState()).filter(
    ([key, value]) => {
      return !!value;
    }
  );

  const contractsPrint = entries.map(
    ([key, value]: [string, DbEntry]) => `${key}: ${value.address}`
  );

  console.log("N# Contracts:", entries.length);
  console.log(contractsPrint.join("\n"));
};

export const verifyContracts = async (limit = 1) => {
  const db = getDb();
  const network = DRE.network.name;
  const entries = Object.entries<DbEntry>(db.getState()).filter(
    ([key, value]) => {
      // constructorArgs must be Array to make the contract verifiable
      return isVerifiable(key) && Array.isArray(value.constructorArgs);
    }
  );

  await mapLimit(entries, limit, async ([key, value]) => {
    const {address, constructorArgs = [], libraries} = value;
    let artifact: Artifact | undefined = undefined;
    try {
      artifact = await DRE.artifacts.readArtifact(key);
    } catch (e) {
      //
    }
    await verifyContract(key, address, artifact, constructorArgs, libraries);
  });
};

export const verifyContract = async (
  id: string,
  address: tEthereumAddress,
  artifact: Artifact | undefined,
  constructorArgs: ConstructorArgs,
  libraries?: Libraries
) => {
  let contractFQN: string | undefined = undefined;
  if (artifact) {
    contractFQN = artifact.sourceName + ":" + artifact.contractName;
  }

  if (
    ETHERSCAN_VERIFICATION_PROVIDER == EtherscanVerificationProvider.hardhat
  ) {
    await verifyEtherscanContract(
      id,
      address,
      contractFQN,
      constructorArgs,
      libraries
    );
  } else if (
    ETHERSCAN_VERIFICATION_PROVIDER == EtherscanVerificationProvider.foundry &&
    artifact
  ) {
    const forgeVerifyContractCmd = `ETHERSCAN_API_KEY=${ETHERSCAN_KEY} ETH_RPC_URL=${
      (DRE.network.config as HttpNetworkConfig).url
    } VERIFIER_URL=${
      ETHERSCAN_APIS[DRE.network.name || FORK]
    } forge verify-contract ${address} \
  --chain-id ${DRE.network.config.chainId} \
  --num-of-optimizations ${COMPILER_OPTIMIZER_RUNS} \
  --watch \
  ${contractFQN} \
${
  constructorArgs.length
    ? `--constructor-args \
  $(cast abi-encode "constructor(${first(artifact.abi)
    .inputs.map((x) => x.type)
    .join(",")})" ${constructorArgs
        .map((x) => (Array.isArray(x) ? `"[${x}"]` : `"${x}"`))
        .join(" ")})`
    : ""
} \
${
  libraries
    ? (
        await Promise.all(
          Object.entries(libraries).map(async ([k, v]) => {
            const sourceName =
              (await DRE.artifacts.readArtifact(k))?.sourceName || "";
            return `--libraries ${sourceName}:${k}:${v}`;
          })
        )
      ).join(" ")
    : ""
} \
  --compiler-version v${COMPILER_VERSION}`;
    console.log(forgeVerifyContractCmd);
    shell.exec(forgeVerifyContractCmd);
  }
};

export const retry = async (fn: any, retries = 0) => {
  try {
    return await fn();
  } catch (e: any) {
    if (++retries < DEPLOY_MAX_RETRIES) {
      console.log("retrying..., error code:", e?.code);
      await sleep(DEPLOY_RETRY_INTERVAL);
      return await retry(fn, retries);
    } else {
      throw e;
    }
  }
};

export const registerContractInDb = async (
  id: string,
  instance: Contract,
  constructorArgs: ConstructorArgs = [],
  libraries?: Libraries,
  signatures?: iFunctionSignature[]
) => {
  const currentNetwork = DRE.network.name;
  const key = `${id}`;

  if (isFork() || !isLocalTestnet()) {
    console.log(`*** ${id} ***\n`);
    console.log(`Network: ${currentNetwork}`);
    console.log(`tx: ${instance.deployTransaction?.hash}`);
    console.log(`contract address: ${instance.address}`);
    console.log(`deployer address: ${instance.deployTransaction?.from}`);
    console.log(`gas price: ${instance.deployTransaction?.gasPrice}`);
    console.log(`gas used: ${instance.deployTransaction?.gasLimit}`);
    console.log(`\n******`);
    console.log();
  }

  const value = {
    address: instance.address,
    deployer: instance.deployTransaction?.from,
    constructorArgs,
    verified: false,
    package: PKG_DATA,
  };

  if (libraries) value["libraries"] = libraries;
  if (signatures?.length) value["signatures"] = signatures;

  await getDb().set(key, value).write();
};

export const insertContractAddressInDb = async (
  id: eContractid | string,
  address: tEthereumAddress,
  verifiable = true
) => {
  const key = `${id}`;
  const old = (await getDb().get(key).value()) || {};
  const newValue = {
    ...old,
    address,
    version: VERSION,
    package: PKG_DATA,
  };
  if (!Array.isArray(newValue.constructorArgs) && verifiable) {
    newValue["constructorArgs"] = [];
  }
  await getDb().set(key, newValue).write();
};

export const getContractAddressInDb = async (id: eContractid | string) => {
  return ((await getDb().get(`${id}`).value()) || {}).address;
};

export const normalizeLibraryAddresses = (
  libraries?: Libraries
): Libraries | undefined => {
  if (libraries) {
    return Object.keys(libraries).reduce((ite, cur) => {
      const parts = cur.split(":");
      ite[parts[parts.length - 1]] = libraries[cur];
      return ite;
    }, {});
  }
};

export const linkLibraries = (
  artifact: {
    bytecode: string;
    linkReferences?: {
      [libraryFileName: string]: {
        [libraryName: string]: Array<{length: number; start: number}>;
      };
    };
  },
  libraries?: Libraries
) => {
  let bytecode = artifact.bytecode;

  if (libraries) {
    if (artifact.linkReferences) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [, fileReferences] of Object.entries(
        artifact.linkReferences
      )) {
        for (const [libName, fixups] of Object.entries(fileReferences)) {
          const addr = libraries[libName];
          if (addr === undefined) {
            continue;
          }

          for (const fixup of fixups) {
            bytecode =
              bytecode.substr(0, 2 + fixup.start * 2) +
              addr.substr(2) +
              bytecode.substr(2 + (fixup.start + fixup.length) * 2);
          }
        }
      }
    } else {
      bytecode = linkRawLibraries(bytecode, libraries);
    }
  }

  // TODO return libraries object with path name <filepath.sol>:<name> for names

  return bytecode;
};

export const linkRawLibraries = (
  bytecode: string,
  libraries: Libraries
): string => {
  for (const libName of Object.keys(libraries)) {
    const libAddress = libraries[libName];
    bytecode = linkRawLibrary(bytecode, libName, libAddress);
  }
  return bytecode;
};

export const linkRawLibrary = (
  bytecode: string,
  libraryName: string,
  libraryAddress: string
): string => {
  const address = libraryAddress.replace("0x", "");
  let encodedLibraryName;
  if (libraryName.startsWith("$") && libraryName.endsWith("$")) {
    encodedLibraryName = libraryName.slice(1, libraryName.length - 1);
  } else {
    encodedLibraryName = solidityKeccak256(["string"], [libraryName]).slice(
      2,
      36
    );
  }
  const pattern = new RegExp(`_+\\$${encodedLibraryName}\\$_+`, "g");
  if (!pattern.exec(bytecode)) {
    throw new Error(
      `Can't link '${libraryName}' (${encodedLibraryName}) in \n----\n ${bytecode}\n----\n`
    );
  }
  return bytecode.replace(pattern, address);
};

export const decodeInputData = (data: string) => {
  const ABI = [];

  const decoder = new InputDataDecoder(ABI);
  const inputData = decoder.decodeData(data.toString());
  const normalized = JSON.stringify(inputData, (k, v) => {
    return v ? (v.type === "BigNumber" ? +v.hex.toString(10) : v) : v;
  });
  return JSON.parse(normalized);
};

export const isNotFalsyOrZeroAddress = (
  address: tEthereumAddress | null | undefined
): boolean => {
  if (!address) {
    return false;
  }
  return isAddress(address) && !isZeroAddress(address);
};

export const isVerifiable = (contractId: string): boolean => {
  if (!ETHERSCAN_NETWORKS.includes(DRE.network.name)) {
    return false;
  }

  if (
    ETHERSCAN_VERIFICATION_CONTRACTS?.every((p) => !minimatch(contractId, p))
  ) {
    return false;
  }

  if (!ETHERSCAN_KEY) {
    throw Error("Missing ETHERSCAN_KEY.");
  }

  return true;
};

export const safeTransactionServiceUrl = (): string => {
  return isMoonbeam()
    ? "https://transaction.multisig.moonbeam.network"
    : `https://safe-transaction-${FORK || DRE.network.name}.safe.global`;
};

export const getSafeSdkAndService = async (safeAddress: string) => {
  const signer = await getFirstSigner();
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  });

  const safeSdk: Safe = await Safe.create({
    ethAdapter,
    safeAddress,
  });
  const safeService = new SafeServiceClient({
    txServiceUrl: safeTransactionServiceUrl(),
    ethAdapter,
  });
  return {
    safeSdk,
    safeService,
  };
};

export const proposeSafeTransaction = async (
  target: tEthereumAddress,
  data: string,
  nonce?: number,
  idx = 0,
  operation = OperationType.Call,
  withTimeLock = false
) => {
  const signer = await getFirstSigner();
  const {safeSdk, safeService} = await getSafeSdkAndService(MULTI_SIG);

  const staticNonce = nonce || MULTI_SIG_NONCE;

  const safeTransactionData: SafeTransactionDataPartial = {
    to: target,
    value: "0",
    nonce:
      staticNonce != undefined
        ? staticNonce + idx
        : await safeService.getNextNonce(MULTI_SIG),
    operation,
    data,
  };
  const safeTransaction = await safeSdk.createTransaction({
    safeTransactionData,
  });

  const signature = await safeSdk.signTypedData(safeTransaction);
  safeTransaction.addSignature(signature);

  const safeHash = await safeSdk.getTransactionHash(safeTransaction);
  console.log(safeHash);

  try {
    await safeService.estimateSafeTransaction(MULTI_SIG, {
      ...safeTransactionData,
      operation: safeTransactionData.operation as number,
    });
  } catch (e) {
    console.log(e);
  }

  await safeService.proposeTransaction({
    safeAddress: MULTI_SIG,
    safeTransactionData: safeTransaction.data,
    safeTxHash: safeHash,
    senderAddress: await signer.getAddress(),
    senderSignature: signature.data,
  });
};

export const proposeMultiSafeTransactions = async (
  transactions: MetaTransaction[],
  operation = OperationType.DelegateCall,
  nonce?: number
) => {
  const newTarget = MULTI_SEND;
  const chunks = chunk(transactions, MULTI_SEND_CHUNK_SIZE);
  for (const [i, c] of chunks.entries()) {
    const {data: newData} = encodeMulti(c);
    await proposeSafeTransaction(newTarget, newData, nonce, i, operation);
  }
};

export const dryRunEncodedData = async (
  target: tEthereumAddress,
  data: string,
  executionTime?: string
) => {
  if (
    DRY_RUN == DryRunExecutor.TimeLock &&
    (await getContractAddressInDb(eContractid.ExecutorWithTimelock))
  ) {
    const timeLockData = await getTimeLockData(target, data, executionTime);
    await insertTimeLockDataInDb(timeLockData);
  } else if (DRY_RUN === DryRunExecutor.SafeWithTimeLock) {
    const {newTarget, newData} = await getTimeLockData(
      target,
      data,
      executionTime
    );
    await proposeSafeTransaction(newTarget, newData);
  } else if (DRY_RUN === DryRunExecutor.Safe) {
    await proposeSafeTransaction(target, data);
  } else if (DRY_RUN === DryRunExecutor.Run) {
    const signer = await getFirstSigner();
    await waitForTx(
      await signer.sendTransaction({
        to: target,
        data,
        ...GLOBAL_OVERRIDES,
      })
    );
  } else {
    console.log(`target: ${target}, data: ${data}`);
  }
};

export const dryRunMultipleEncodedData = async (
  target: tEthereumAddress[],
  data: string[],
  executionTime: (string | undefined)[]
) => {
  if (
    DRY_RUN == DryRunExecutor.TimeLock &&
    (await getContractAddressInDb(eContractid.ExecutorWithTimelock))
  ) {
    for (let i = 0; i < target.length; i++) {
      const timeLockData = await getTimeLockData(
        target[i],
        data[i],
        executionTime[i] || (await getExecutionTime())
      );
      await insertTimeLockDataInDb(timeLockData);
    }
  } else if (DRY_RUN === DryRunExecutor.SafeWithTimeLock) {
    const metaTransactions: MetaTransaction[] = [];
    for (let i = 0; i < target.length; i++) {
      const {newTarget, newData} = await getTimeLockData(
        target[i],
        data[i],
        executionTime[i] || (await getExecutionTime())
      );
      metaTransactions.push({
        to: newTarget,
        data: newData,
        value: "0",
      });
    }
    await proposeMultiSafeTransactions(metaTransactions);
  } else if (DRY_RUN === DryRunExecutor.Safe) {
    const metaTransactions: MetaTransaction[] = [];
    for (let i = 0; i < target.length; i++) {
      metaTransactions.push({
        to: target[i],
        data: data[i],
        value: "0",
      });
    }
    await proposeMultiSafeTransactions(metaTransactions);
  } else if (DRY_RUN === DryRunExecutor.Run) {
    const signer = await getFirstSigner();
    for (let i = 0; i < target.length; i++) {
      await waitForTx(
        await signer.sendTransaction({
          to: target[i],
          data: data[i],
          ...GLOBAL_OVERRIDES,
        })
      );
    }
  } else {
    console.log(`target: ${target}, data: ${data}`);
  }
};
