import {isZeroAddress} from "ethereumjs-util";
import {BigNumber, ContractTransaction, Wallet, utils} from "ethers";
import {isAddress} from "ethers/lib/utils";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import low from "lowdb";
import {getAdapter} from "./db-adapter";
import {ConstructorArgs, eEthereumNetwork} from "../helpers/types";
import {
  ARBITRUM_GOERLI_CHAINID,
  ARBITRUM_ONE_CHAINID,
  DB_PATH,
  FORK,
  FORK_CHAINID,
  GOERLI_CHAINID,
  HARDHAT_CHAINID,
  MAINNET_CHAINID,
  MOONBEAM_CHAINID,
  POLYGON_MUMBAI_CHAINID,
  POLYGON_CHAINID,
  POLYGON_ZKEVM_CHAINID,
  POLYGON_ZKEVM_GOERLI_CHAINID,
  ZKSYNC_CHAINID,
  ZKSYNC_GOERLI_CHAINID,
  ETHERSCAN_NETWORKS,
  ETHERSCAN_KEY,
  MOONBASE_CHAINID,
  LINEA_CHAINID,
  LINEA_GOERLI_CHAINID,
  ARBITRUM_SEPOLIA_CHAINID,
  SEPOLIA_CHAINID,
  SCROLL_CHAINID,
  AVALANCHE_CHAINID,
  OPTIMISM_CHAINID,
  BASE_CHAINID,
  MANTA_CHAINID,
  BSC_CHAINID,
} from "../helpers/constants";
import dotenv from "dotenv";
import minimatch from "minimatch";

dotenv.config();

export let DRE: HardhatRuntimeEnvironment;

export const setDRE = (_DRE: HardhatRuntimeEnvironment) => {
  DRE = _DRE;
};

export const isLocalTestnet = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return [HARDHAT_CHAINID].includes(DRE.network.config.chainId!);
};

export const isPublicTestnet = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [
      GOERLI_CHAINID,
      SEPOLIA_CHAINID,
      ARBITRUM_GOERLI_CHAINID,
      ARBITRUM_SEPOLIA_CHAINID,
      ZKSYNC_GOERLI_CHAINID,
      POLYGON_ZKEVM_GOERLI_CHAINID,
      POLYGON_MUMBAI_CHAINID,
      MOONBASE_CHAINID,
      LINEA_GOERLI_CHAINID,
    ].includes(DRE.network.config.chainId!) ||
    [
      eEthereumNetwork.goerli,
      eEthereumNetwork.sepolia,
      eEthereumNetwork.arbitrumGoerli,
      eEthereumNetwork.arbitrumSepolia,
      eEthereumNetwork.zksyncGoerli,
      eEthereumNetwork.polygonZkevmGoerli,
      eEthereumNetwork.polygonMumbai,
      eEthereumNetwork.moonbase,
      eEthereumNetwork.lineaGoerli,
    ].includes(FORK as eEthereumNetwork)
  );
};

export const isFork = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return [FORK_CHAINID].includes(DRE.network.config.chainId!);
};

export const isMoonbeam = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [MOONBEAM_CHAINID].includes(DRE.network.config.chainId!) ||
    [eEthereumNetwork.moonbeam].includes(FORK as eEthereumNetwork)
  );
};

export const isArbitrum = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [ARBITRUM_ONE_CHAINID].includes(DRE.network.config.chainId!) ||
    [eEthereumNetwork.arbitrum].includes(FORK as eEthereumNetwork)
  );
};

export const isEthereum = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [MAINNET_CHAINID].includes(DRE.network.config.chainId!) ||
    [eEthereumNetwork.mainnet].includes(FORK as eEthereumNetwork)
  );
};

export const isPolygon = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [POLYGON_CHAINID].includes(DRE.network.config.chainId!) ||
    [eEthereumNetwork.polygon].includes(FORK as eEthereumNetwork)
  );
};

export const isPolygonZkEVM = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [POLYGON_ZKEVM_CHAINID].includes(DRE.network.config.chainId!) ||
    [eEthereumNetwork.polygonZkevm].includes(FORK as eEthereumNetwork)
  );
};

export const isZkSync = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [ZKSYNC_CHAINID].includes(DRE.network.config.chainId!) ||
    [eEthereumNetwork.zksync].includes(FORK as eEthereumNetwork)
  );
};

export const isLinea = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [LINEA_CHAINID].includes(DRE.network.config.chainId!) ||
    [eEthereumNetwork.linea].includes(FORK as eEthereumNetwork)
  );
};

export const isScroll = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [SCROLL_CHAINID].includes(DRE.network.config.chainId!) ||
    [eEthereumNetwork.scroll].includes(FORK as eEthereumNetwork)
  );
};

export const isAvalanche = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [AVALANCHE_CHAINID].includes(DRE.network.config.chainId!) ||
    [eEthereumNetwork.avalanche].includes(FORK as eEthereumNetwork)
  );
};

export const isOptimism = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [OPTIMISM_CHAINID].includes(DRE.network.config.chainId!) ||
    [eEthereumNetwork.optimism].includes(FORK as eEthereumNetwork)
  );
};

export const isBase = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [BASE_CHAINID].includes(DRE.network.config.chainId!) ||
    [eEthereumNetwork.base].includes(FORK as eEthereumNetwork)
  );
};

export const isManta = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [MANTA_CHAINID].includes(DRE.network.config.chainId!) ||
    [eEthereumNetwork.manta].includes(FORK as eEthereumNetwork)
  );
};

export const isBsc = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    [BSC_CHAINID].includes(DRE.network.config.chainId!) ||
    [eEthereumNetwork.bsc].includes(FORK as eEthereumNetwork)
  );
};

export const isMainnet = (): boolean =>
  isEthereum() ||
  isMoonbeam() ||
  isArbitrum() ||
  isZkSync() ||
  isPolygon() ||
  isPolygonZkEVM() ||
  isLinea() ||
  isScroll() ||
  isAvalanche() ||
  isOptimism() ||
  isBase() ||
  isManta() ||
  isBsc();

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const createRandomAddress = () => Wallet.createRandom().address;

export const setAutomineEvm = async (activate: boolean) => {
  await DRE.network.provider.send("evm_setAutomine", [activate]);
};

export const evmSnapshot = async () =>
  await DRE.ethers.provider.send("evm_snapshot", []);

export const evmRevert = async (id: string) =>
  DRE.ethers.provider.send("evm_revert", [id]);

export const timeLatest = async () => {
  const block = await DRE.ethers.provider.getBlock("latest");
  return BigNumber.from(block.timestamp);
};

export const advanceBlock = async (timestamp: number) =>
  await DRE.ethers.provider.send("evm_mine", [timestamp]);

export const increaseTime = async (secondsToIncrease: number) => {
  await DRE.ethers.provider.send("evm_increaseTime", [secondsToIncrease]);
  await DRE.ethers.provider.send("evm_mine", []);
};

export const setBlocktime = async (time: number) => {
  await DRE.ethers.provider.send("evm_setNextBlockTimestamp", [time]);
};

// Workaround for time travel tests bug: https://github.com/Tonyhaenn/hh-time-travel/blob/0161d993065a0b7585ec5a043af2eb4b654498b8/test/test.js#L12
export const advanceTimeAndBlock = async function (forwardTime: number) {
  const currentBlockNumber = await DRE.ethers.provider.getBlockNumber();
  const currentBlock = await DRE.ethers.provider.getBlock(currentBlockNumber);

  if (currentBlock === null) {
    /* Workaround for https://github.com/nomiclabs/hardhat/issues/1183
     */
    await DRE.ethers.provider.send("evm_increaseTime", [forwardTime]);
    await DRE.ethers.provider.send("evm_mine", []);
    //Set the next blocktime back to 15 seconds
    await DRE.ethers.provider.send("evm_increaseTime", [15]);
    return;
  }
  const currentTime = currentBlock.timestamp;
  const futureTime = currentTime + forwardTime;
  await DRE.ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
  await DRE.ethers.provider.send("evm_mine", []);
};

export const setAutomine = async (activate: boolean) => {
  await DRE.network.provider.send("evm_setAutomine", [activate]);
  if (activate) await DRE.network.provider.send("evm_mine", []);
};

export const mine = async () => {
  await DRE.network.provider.send("evm_mine", []);
};

export const getDb = () => low(getAdapter(DB_PATH));

export const waitForTx = async (tx: ContractTransaction) => await tx.wait(1);
