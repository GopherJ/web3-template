import fs from "fs";
import {BigNumberish, ethers} from "ethers";
import promptSync from "prompt-sync";
import {HttpNetworkAccountsUserConfig} from "hardhat/types";
import {input} from "./wallet";
import {version} from "../package.json";
import git from "git-rev-sync";
import {AccessListish} from "ethers/lib/utils";
import {isUndefined} from "lodash";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ONE_ADDRESS = "0x0000000000000000000000000000000000000001";

export const HARDHAT_CHAINID = 31337;
export const GOERLI_CHAINID = 5;
export const SEPOLIA_CHAINID = 11155111;
export const FORK_CHAINID = 522;
export const MAINNET_CHAINID = 1;
export const PARALLEL_CHAINID = 1592;
export const MOONBEAM_CHAINID = 1284;
export const MOONBASE_CHAINID = 1287;
export const ARBITRUM_ONE_CHAINID = 42161;
export const ARBITRUM_GOERLI_CHAINID = 421613;
export const ARBITRUM_SEPOLIA_CHAINID = 421614;
export const POLYGON_CHAINID = 137;
export const POLYGON_ZKEVM_CHAINID = 1101;
export const POLYGON_ZKEVM_GOERLI_CHAINID = 1442;
export const POLYGON_MUMBAI_CHAINID = 80001;
export const ZKSYNC_CHAINID = 324;
export const ZKSYNC_GOERLI_CHAINID = 280;
export const LINEA_GOERLI_CHAINID = 59140;
export const LINEA_CHAINID = 59144;
export const AVALANCHE_CHAINID = 43114;
export const OPTIMISM_CHAINID = 10;
export const SCROLL_CHAINID = 534352;
export const BASE_CHAINID = 8453;
export const MANTA_CHAINID = 169;
export const BSC_CHAINID = 56;
export const ZKFAIR_CHAINID = 42766;

export const RPC_URL = process.env.RPC_URL || "";

export const INFURA_KEY = process.env.INFURA_KEY || "";
export const ALCHEMY_KEY = process.env.ALCHEMY_KEY || "";
export const FORK = process.env.FORK || "";
export const FORK_BLOCK_NUMBER = process.env.FORK_BLOCK_NUMBER
  ? parseInt(process.env.FORK_BLOCK_NUMBER)
  : 0;

const getPrivateKeyfromEncryptedJson = (
  keystorePath: string | undefined
): string =>
  keystorePath && fs.existsSync(keystorePath)
    ? ethers.Wallet.fromEncryptedJsonSync(
        fs.readFileSync(keystorePath, "utf8"),
        DEPLOYER_PASSWORD || input("password: ")
      ).privateKey
    : "";
export const KEYSTORE_PATH = "keystore";
export const DEPLOYER_PRIVATE_KEY = (
  process.env.DEPLOYER_PRIVATE_KEY ||
  getPrivateKeyfromEncryptedJson(process.env.DEPLOYER_KEYSTORE_PATH)
).trim();
export const DEPLOYER_MNEMONIC = (
  process.env.DEPLOYER_MNEMONIC ||
  "test test test test test test test test test test test junk"
).trim();
export const DEPLOYER_PASSWORD = process.env.DEPLOYER_PASSWORD || "";
export const DEPLOYER: HttpNetworkAccountsUserConfig = DEPLOYER_PRIVATE_KEY
  ? [DEPLOYER_PRIVATE_KEY]
  : {
      mnemonic: DEPLOYER_MNEMONIC,
    };
export const DEPLOY_START = parseInt(process.env.DEPLOY_START || "0");
export const DEPLOY_END = parseInt(process.env.DEPLOY_END || "1");
export const DEPLOY_INCREMENTAL =
  process.env.DEPLOY_INCREMENTAL == "true" ? true : false;
export const DEPLOY_MAX_RETRIES = parseInt(
  process.env.DEPLOY_MAX_RETRIES || "6"
);
export const DEPLOY_RETRY_INTERVAL = parseInt(
  process.env.DEPLOY_RETRY_INTERVAL || "1500"
);

export const BLOCKSCOUT_DISABLE_INDEXER =
  process.env.BLOCKSCOUT_DISABLE_INDEXER == "false" ? false : true;

export const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY || "";
export const ETHERSCAN_VERIFICATION =
  process.env.ETHERSCAN_VERIFICATION === "true" ? true : false;
export const ETHERSCAN_VERIFICATION_PROVIDER =
  process.env.ETHERSCAN_VERIFICATION_PROVIDER || "foundry";
export const ETHERSCAN_VERIFICATION_CONTRACTS =
  process.env.ETHERSCAN_VERIFICATION_CONTRACTS?.trim().split(/\s?,\s?/);
export const ETHERSCAN_VERIFICATION_MAX_RETRIES = parseInt(
  process.env.ETHERSCAN_VERIFICATION_MAX_RETRIES || "3"
);
export const ETHERSCAN_VERIFICATION_JOBS = parseInt(
  process.env.ETHERSCAN_VERIFICATION_JOBS || "1"
);

export const GOERLI_ETHERSCAN_KEY =
  process.env.GOERLI_ETHERSCAN_KEY || ETHERSCAN_KEY;
export const SEPOLIA_ETHERSCAN_KEY =
  process.env.SEPOLIA_ETHERSCAN_KEY || ETHERSCAN_KEY;
export const ARBITRUM_ETHERSCAN_KEY =
  process.env.ARBITRUM_ETHERSCAN_KEY || ETHERSCAN_KEY;
export const ARBITRUM_GOERLI_ETHERSCAN_KEY =
  process.env.ARBITRUM_GOERLI_ETHERSCAN_KEY || ARBITRUM_ETHERSCAN_KEY;
export const ARBITRUM_SEPOLIA_ETHERSCAN_KEY =
  process.env.ARBITRUM_SEPOLIA_ETHERSCAN_KEY || ARBITRUM_ETHERSCAN_KEY;
export const POLYGON_ETHERSCAN_KEY =
  process.env.POLYGON_ETHERSCAN_KEY || ETHERSCAN_KEY;
export const POLYGON_MUMBAI_ETHERSCAN_KEY =
  process.env.POLYGON_MUMBAI_ETHERSCAN_KEY || POLYGON_ETHERSCAN_KEY;
export const POLYGON_ZKEVM_ETHERSCAN_KEY =
  process.env.POLYGON_ZKEVM_ETHERSCAN_KEY || POLYGON_ETHERSCAN_KEY;
export const POLYGON_ZKEVM_GOERLI_ETHERSCAN_KEY =
  process.env.POLYGON_ZKEVM_GOERLI_ETHERSCAN_KEY || POLYGON_ZKEVM_ETHERSCAN_KEY;
export const MOONBEAM_ETHERSCAN_KEY =
  process.env.MOONBEAM_ETHERSCAN_KEY || ETHERSCAN_KEY;
export const MOONBASE_ETHERSCAN_KEY =
  process.env.MOONBASE_ETHERSCAN_KEY || MOONBEAM_ETHERSCAN_KEY;
export const LINEA_ETHERSCAN_KEY =
  process.env.LINEA_ETHERSCAN_KEY || ETHERSCAN_KEY;
export const LINEA_GOERLI_ETHERSCAN_KEY =
  process.env.LINEA_GOERLI_ETHERSCAN_KEY || LINEA_ETHERSCAN_KEY;
export const AVALANCHE_ETHERSCAN_KEY =
  process.env.AVALANCHE_ETHERSCAN_KEY || ETHERSCAN_KEY;
export const OPTIMISM_ETHERSCAN_KEY =
  process.env.OPTIMISM_ETHERSCAN_KEY || ETHERSCAN_KEY;
export const SCROLL_ETHERSCAN_KEY =
  process.env.SCROLL_ETHERSCAN_KEY || ETHERSCAN_KEY;
export const BASE_ETHERSCAN_KEY =
  process.env.BASE_ETHERSCAN_KEY || ETHERSCAN_KEY;
export const MANTA_ETHERSCAN_KEY =
  process.env.MANTA_ETHERSCAN_KEY || ETHERSCAN_KEY;
export const BSC_ETHERSCAN_KEY = process.env.BSC_ETHERSCAN_KEY || ETHERSCAN_KEY;
export const ZKFAIR_ETHERSCAN_KEY =
  process.env.ZKFAIR_ETHERSCAN_KEY || ETHERSCAN_KEY;

export const ETHERSCAN_NETWORKS = [
  "localhost",
  "mainnet",
  "goerli",
  "sepolia",
  "arbitrum",
  "arbitrumGoerli",
  "arbitrumSepolia",
  "polygon",
  "matic",
  "polygonMumbai",
  "polygonZkevm",
  "polygonZkevmGoerli",
  "zksync",
  "zksyncGoerli",
  "linea",
  "lineaGoerli",
  "moonbeam",
  "moonbase",
  "avalanche",
  "optimism",
  "scroll",
  "base",
  "manta",
  "bsc",
  "zkfair",
];
export const ETHERSCAN_APIS = {
  localhost: "http://localhost:4000/api",
  mainnet: "https://api.etherscan.io/api",
  goerli: "https://api-goerli.etherscan.io/api",
  sepolia: "https://api-sepolia.etherscan.io/api",
  arbitrum: "https://api.arbiscan.io/api",
  arbitrumGoerli: "https://api-goerli.arbiscan.io/api",
  arbitrumSepolia: "https://api-sepolia.arbiscan.io/api",
  polygon: "https://api.polygonscan.com/api",
  matic: "https://api.polygonscan.com/api",
  polygonMumbai: "https://api-mumbai.polygonscan.com/api",
  polygonZkevm: "https://api-zkevm.polygonscan.com/api",
  polygonZkevmGoerli: "https://api-testnet-zkevm.polygonscan.com/api",
  zksync: "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
  zksyncGoerli:
    "https://zksync2-testnet-explorer.zksync.dev/contract_verification",
  moonbeam: "https://api-moonbeam.moonscan.io/api",
  moonbase: "https://api-moonbase.moonscan.io/api",
  linea: "http://explorer.linea.build/api",
  lineaGoerli: "https://explorer.goerli.linea.build/api",
  avalanche: "https://api.avascan.info/v2",
  optimism: "https://api-optimistic.etherscan.io/api",
  scroll: "https://api-scrollscan.com/api",
  base: "https://api-basescan.org/api",
  manta: "https://pacific-explorer.manta.network/api",
  bsc: "https://bscscan.com/api",
  zkfair: "https://scan.zkfair.io/api",
};
export const BROWSER_URLS = {
  localhost: "http://localhost:4000",
  mainnet: "https://etherscan.io",
  goerli: "https://goerli.etherscan.io",
  sepolia: "https://sepolia.etherscan.io",
  arbitrum: "https://arbiscan.io",
  arbitrumGoerli: "https://goerli.arbiscan.io",
  arbitrumSepolia: "https://sepolia.arbiscan.io",
  polygonZkevm: "https://zkevm.polygonscan.com",
  polygonZkevmGoerli: "https://testnet-zkevm.polygonscan.com",
  polygon: "https://polygonscan.com",
  matic: "https://polygonscan.com",
  polygonMumbai: "https://mumbai.polygonscan.com",
  zksync: "https://zksync2-mainnet-explorer.zksync.io",
  zksyncGoerli: "https://zksync2-testnet-explorer.zksync.dev",
  moonbeam: "https://moonscan.io",
  moonbase: "https://moonbase.moonscan.io",
  linea: "https://explorer.linea.build",
  lineaGoerli: "https://explorer.goerli.linea.build",
  avalanche: "https://avascan.info/blockchain/c",
  optimism: "https://optimistic.etherscan.io",
  scroll: "https://scrollscan.com",
  base: "https://basescan.org",
  manta: "https://pacific-explorer.manta.network",
  bsc: "https://bscscan.com",
  zkfair: "https://scan.zkfair.io",
};

export const DEFAULT_BLOCK_GAS_LIMIT = 40000000;
export const HARDFORK = "london";
export const MOCHA_JOBS = parseInt(process.env.MOCHA_JOBS || "4");

export const DRY_RUN = process.env.DRY_RUN || "";
export const VERBOSE = process.env.VERBOSE == "true" ? true : false;

export const REPORT_GAS = process.env.REPORT_GAS == "true" ? true : false;

export const TIME_LOCK_SIGS = {
  "0xc1a287e2": "GRACE_PERIOD()",
  "0x7d645fab": "MAXIMUM_DELAY()",
  "0xb1b43ae5": "MINIMUM_DELAY()",
  "0x0e18b681": "acceptAdmin()",
  "0x1dc40b51": "cancelTransaction(address,uint256,string,bytes,uint256,bool)",
  "0x8902ab65": "executeTransaction(address,uint256,string,bytes,uint256,bool)",
  "0x6e9960c3": "getAdmin()",
  "0xcebc9a82": "getDelay()",
  "0xd0468156": "getPendingAdmin()",
  "0xb1fc8796": "isActionQueued(bytes32)",
  "0x8d8fe2e3": "queueTransaction(address,uint256,string,bytes,uint256,bool)",
  "0xe177246e": "setDelay(uint256)",
  "0x4dd18bf5": "setPendingAdmin(address)",
};

export const ZK_LIBRARIES_PATH = "zk-libraries.json";
export const ZK_LIBRARIES = fs.existsSync(ZK_LIBRARIES_PATH)
  ? JSON.parse(fs.readFileSync(ZK_LIBRARIES_PATH, "utf8"))
  : {};

export const DB_PATH = process.env.DB_PATH ?? ":memory:";

export interface Overrides {
  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
  maxFeePerGas?: BigNumberish;
  maxPriorityFeePerGas?: BigNumberish;
  nonce?: BigNumberish;
  type?: number;
  accessList?: AccessListish;
  customData?: Record<string, any>;
  ccipReadEnabled?: boolean;
}
export const GLOBAL_OVERRIDES: Overrides = {
  // maxFeePerGas: ethers.utils.parseUnits("30", "gwei"),
  // maxPriorityFeePerGas: ethers.utils.parseUnits("3", "gwei"),
  type: 2,
  // gasLimit: 30_000_000,
};

export const hasFeeData = (overrides: Overrides): boolean => {
  const {maxFeePerGas, maxPriorityFeePerGas, type, gasPrice} = overrides;
  return (
    (!isUndefined(maxFeePerGas) &&
      !isUndefined(maxPriorityFeePerGas) &&
      type === 2) ||
    (!isUndefined(gasPrice) && type === 1)
  );
};

export const JSONRPC_VARIANT = process.env.JSONRPC_VARIANT || "hardhat";

export const TIME_LOCK_BUFFERING_TIME = parseInt(
  process.env.TIME_LOCK_BUFFERING_TIME || "14400"
);
export const TIME_LOCK_DEFAULT_OPERATION =
  process.env.TIME_LOCK_DEFAULT_OPERATION || "queue";

export const IMPERSONATE_ADDRESS = process.env.IMPERSONATE_ADDRESS || "";

export const MULTI_SIG = process.env.MULTI_SIG || "";
export const MULTI_SEND = process.env.MULTI_SEND || "";
export const MULTI_SIG_NONCE = process.env.MULTI_SIG_NONCE
  ? parseInt(process.env.MULTI_SIG_NONCE)
  : undefined;
export const MULTI_SEND_CHUNK_SIZE = parseInt(
  process.env.MULTI_SEND_CHUNK_SIZE || "45"
);

export const VERSION = version;
export const COMMIT = git.short();
export const COMPILER_OPTIMIZER_RUNS = 200;
export const COMPILER_VERSION = "0.8.17+commit.8df45f5f";
export const PKG_DATA = {
  version: VERSION,
  git: {
    commit: COMMIT,
  },
  compiler: {
    version: "v" + COMPILER_VERSION,
    optimizer: {
      runs: COMPILER_OPTIMIZER_RUNS,
    },
  },
};
