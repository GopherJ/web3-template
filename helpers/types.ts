import {BigNumberish, BytesLike, Signer} from "ethers";

export type iParamsPerNetwork<T> = iEthereumParamsPerNetwork<T>;

export type tEthereumAddress = string;

export interface SignerWithAddress {
  signer: Signer;
  address: tEthereumAddress;
}

export type Libraries = {[libraryName: string]: tEthereumAddress};

export interface iFunctionSignature {
  name: string;
  signature: string;
}

export enum EtherscanVerificationProvider {
  hardhat = "hardhat",
  foundry = "foundry",
}

export enum DryRunExecutor {
  TimeLock = "TimeLock",
  Safe = "Safe",
  SafeWithTimeLock = "SafeWithTimeLock",
  Run = "Run",
  None = "",
}

export interface iEthereumParamsPerNetwork<T> {
  [eEthereumNetwork.goerli]: T;
  [eEthereumNetwork.sepolia]: T;
  [eEthereumNetwork.mainnet]: T;
  [eEthereumNetwork.hardhat]: T;
  [eEthereumNetwork.anvil]: T;
  [eEthereumNetwork.ganache]: T;
  [eEthereumNetwork.parallel]: T;
  [eEthereumNetwork.moonbeam]: T;
  [eEthereumNetwork.moonbase]: T;
  [eEthereumNetwork.arbitrum]: T;
  [eEthereumNetwork.arbitrumGoerli]: T;
  [eEthereumNetwork.arbitrumSepolia]: T;
  [eEthereumNetwork.polygon]: T;
  [eEthereumNetwork.polygonMumbai]: T;
  [eEthereumNetwork.polygonZkevm]: T;
  [eEthereumNetwork.polygonZkevmGoerli]: T;
  [eEthereumNetwork.zksync]: T;
  [eEthereumNetwork.zksyncGoerli]: T;
  [eEthereumNetwork.linea]: T;
  [eEthereumNetwork.lineaGoerli]: T;
  [eEthereumNetwork.avalanche]: T;
  [eEthereumNetwork.optimism]: T;
  [eEthereumNetwork.scroll]: T;
  [eEthereumNetwork.base]: T;
  [eEthereumNetwork.manta]: T;
  [eEthereumNetwork.bsc]: T;
  [eEthereumNetwork.zkfair]: T;
  [eEthereumNetwork.metis]: T;
  [eEthereumNetwork.neon]: T;
}

export enum eContractid {
  MultiSendCallOnly = "MultiSendCallOnly",
  InitializableImmutableAdminUpgradeabilityProxy = "InitializableImmutableAdminUpgradeabilityProxy",
  ExecutorWithTimelock = "ExecutorWithTimelock",
}

export enum eEthereumNetwork {
  ropsten = "ropsten",
  goerli = "goerli",
  sepolia = "sepolia",
  mainnet = "mainnet",
  hardhat = "hardhat",
  ganache = "ganache",
  parallel = "parallel",
  localhost = "localhost",
  anvil = "anvil",
  moonbeam = "moonbeam",
  moonbase = "moonbase",
  arbitrum = "arbitrum",
  arbitrumGoerli = "arbitrumGoerli",
  arbitrumSepolia = "arbitrumSepolia",
  polygon = "polygon",
  polygonMumbai = "polygonMumbai",
  polygonZkevm = "polygonZkevm",
  polygonZkevmGoerli = "polygonZkevmGoerli",
  zksync = "zksync",
  zksyncGoerli = "zksyncGoerli",
  linea = "linea",
  lineaGoerli = "lineaGoerli",
  avalanche = "avalanche",
  optimism = "optimism",
  scroll = "scroll",
  base = "base",
  manta = "manta",
  bsc = "bsc",
  zkfair = "zkfair",
  metis = "metis",
  neon = "neon",
}

export type ConstructorArgs = (
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[]
)[];

export interface DbEntry {
  deployer: string;
  address: string;
  constructorArgs: ConstructorArgs;
  verified: boolean;
}

export type TimeLockData = {
  action: Action;
  actionHash: string;
  queueData: string;
  executeData: string;
  cancelData: string;
  executeTime: string;
  queueExpireTime: string;
  executeExpireTime: string;
};

export enum TimeLockOperation {
  Queue = "queue",
  Execute = "execute",
  Cancel = "cancel",
}

export type Action = [
  string, // target
  BigNumberish, // value
  string, // signature
  BytesLike, // data
  BigNumberish, // executeTime
  boolean // withDelegatecall
];
