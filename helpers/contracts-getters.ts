import {DRE, getDb, isLocalTestnet} from "./misc-utils";
import * as zk from "zksync-web3";
import {accounts} from "../wallets";
import {BigNumber, ContractFactory, Signer, ethers} from "ethers";
import {first, last, pick} from "lodash";
import {
  HardhatRuntimeEnvironment,
  HttpNetworkConfig,
  Libraries,
} from "hardhat/types";
import {
  IMPERSONATE_ADDRESS,
  RPC_URL,
  TIME_LOCK_BUFFERING_TIME,
  TIME_LOCK_DEFAULT_OPERATION,
  VERBOSE,
} from "./constants";
import {
  Action,
  TimeLockData,
  TimeLockOperation,
  eContractid,
  tEthereumAddress,
} from "./types";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {
  impersonateAddress,
  linkLibraries,
  normalizeLibraryAddresses,
} from "./contracts-helpers";
import {Deployer} from "@matterlabs/hardhat-zksync-deploy";
import {
  MultiSendCallOnly__factory,
  ExecutorWithTimelock__factory,
} from "../types";
import {defaultAbiCoder, solidityKeccak256} from "ethers/lib/utils";

export const getFirstSigner = async () => {
  if (DRE.network.zksync) {
    return new zk.Wallet(
      last(accounts)!.privateKey,
      new zk.Provider((DRE.network.config as HttpNetworkConfig).url),
      new ethers.providers.JsonRpcProvider(
        (DRE.network.config as HttpNetworkConfig).ethNetwork
      )
    );
  } else {
    if (!RPC_URL) {
      return first(await getEthersSigners())!;
    }

    return (await impersonateAddress(IMPERSONATE_ADDRESS)).signer;
  }
};

export const getEthersSigners = async (): Promise<Signer[]> => {
  const ethersSigners = await Promise.all(await DRE.ethers.getSigners());
  return ethersSigners;
};

export const getContractFactory = async (
  name: string,
  libraries?: Libraries
) => {
  const signer = await getFirstSigner();
  if (DRE.network.zksync) {
    const deployer = new Deployer(DRE, signer as zk.Wallet);
    const artifact = await deployer.loadArtifact(name);
    const factoryDeps = await deployer.extractFactoryDeps(artifact);
    return {
      artifact,
      factory: new zk.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        signer as zk.Signer
      ),
      customData: {
        factoryDeps,
        feeToken: zk.utils.ETH_ADDRESS,
      },
    };
  } else {
    const artifact = await DRE.artifacts.readArtifact(name);
    if (libraries) {
      artifact.bytecode = linkLibraries(
        artifact,
        normalizeLibraryAddresses(libraries)
      );
    }
    return {
      artifact,
      factory: new ContractFactory(artifact.abi, artifact.bytecode, signer),
      customData: undefined,
    };
  }
};

export const getMultiSendCallOnly = async (address?: tEthereumAddress) =>
  await MultiSendCallOnly__factory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.MultiSendCallOnly}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getExecutorWithTimelock = async (address?: tEthereumAddress) =>
  await ExecutorWithTimelock__factory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.ExecutorWithTimelock}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const insertTimeLockDataInDb = async ({
  action,
  actionHash,
  queueData,
  executeData,
  cancelData,
  executeTime,
  queueExpireTime,
  executeExpireTime,
}: TimeLockData) => {
  const key = `${eContractid.MultiSendCallOnly}.${DRE.network.name}`;
  const oldValue = (await getDb().get(key).value()) || {};
  const queue = oldValue.queue || [];
  queue.push({
    action,
    actionHash,
    queueData,
    executeData,
    cancelData,
    executeTime: new Date(+executeTime * 1000).toLocaleString(),
    queueExpireTime: new Date(+queueExpireTime * 1000).toLocaleString(),
    executeExpireTime: new Date(+executeExpireTime * 1000).toLocaleString(),
  });
  const newValue = {
    ...oldValue,
    queue,
  };
  await getDb().set(key, newValue).write();
};

export const getTimeLockDataInDb = async (): Promise<
  {
    action: Action;
    actionHash: string;
    queueData: string;
    executeData: string;
    cancelData: string;
  }[]
> => {
  const key = `${eContractid.MultiSendCallOnly}.${DRE.network.name}`;
  const oldValue = (await getDb().get(key).value()) || {};
  const queue = oldValue.queue || [];
  return queue.map((x) =>
    pick(x, ["action", "actionHash", "queueData", "executeData", "cancelData"])
  );
};

export const getCurrentTime = async () => {
  const blockNumber = await DRE.ethers.provider.getBlockNumber();
  const timestamp = (await DRE.ethers.provider.getBlock(blockNumber)).timestamp;
  return BigNumber.from(timestamp);
};

export const getExecutionTime = async () => {
  return (await getCurrentTime()).add(TIME_LOCK_BUFFERING_TIME).toString();
};

export const getTimeLockData = async (
  target: string,
  data: string,
  executionTime?: string
) => {
  const timeLock = await getExecutorWithTimelock();
  executionTime = executionTime || (await getExecutionTime());
  const action: Action = [target, 0, "", data, executionTime, false];
  const actionHash = solidityKeccak256(
    ["bytes"],
    [
      defaultAbiCoder.encode(
        ["address", "uint256", "string", "bytes", "uint256", "bool"],
        action
      ),
    ]
  );
  const isActionQueued = await timeLock.isActionQueued(actionHash);
  const gracePeriod = await timeLock.GRACE_PERIOD();
  const delay = await timeLock.getDelay();
  const executeTime = BigNumber.from(executionTime).add(delay).toString();
  const queueExpireTime = BigNumber.from(executionTime).sub(delay).toString();
  const executeExpireTime = BigNumber.from(executionTime)
    .add(gracePeriod)
    .toString();
  const queueData = timeLock.interface.encodeFunctionData(
    "queueTransaction",
    action
  );
  const executeData = timeLock.interface.encodeFunctionData(
    "executeTransaction",
    action
  );
  const cancelData = timeLock.interface.encodeFunctionData(
    "cancelTransaction",
    action
  );
  if (VERBOSE) {
    console.log();
    console.log("isActionQueued:", isActionQueued);
    console.log("timeLock:", timeLock.address);
    console.log("target:", target);
    console.log("data:", data);
    console.log("executionTime:", executionTime);
    console.log("action:", action.toString());
    console.log("actionHash:", actionHash);
    console.log("queueData:", queueData);
    console.log("executeData:", executeData);
    console.log("cancelData:", cancelData);
    console.log();
  }
  const newTarget = timeLock.address;
  const newData =
    TIME_LOCK_DEFAULT_OPERATION == TimeLockOperation.Execute
      ? executeData
      : TIME_LOCK_DEFAULT_OPERATION == TimeLockOperation.Cancel
      ? cancelData
      : queueData;
  return {
    timeLock,
    action,
    actionHash,
    queueData,
    executeData,
    cancelData,
    executeTime,
    queueExpireTime,
    executeExpireTime,
    newTarget,
    newData,
  };
};
