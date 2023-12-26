import {eEthereumNetwork, iParamsPerNetwork} from "./helpers/types";
import dotenv from "dotenv";
import {
  ALCHEMY_KEY,
  ARBITRUM_GOERLI_CHAINID,
  ARBITRUM_ONE_CHAINID,
  ARBITRUM_SEPOLIA_CHAINID,
  FORK,
  FORK_BLOCK_NUMBER,
  FORK_CHAINID,
  GOERLI_CHAINID,
  HARDHAT_CHAINID,
  INFURA_KEY,
  LINEA_CHAINID,
  LINEA_GOERLI_CHAINID,
  MAINNET_CHAINID,
  MOONBASE_CHAINID,
  MOONBEAM_CHAINID,
  PARALLEL_CHAINID,
  POLYGON_CHAINID,
  POLYGON_MUMBAI_CHAINID,
  POLYGON_ZKEVM_CHAINID,
  POLYGON_ZKEVM_GOERLI_CHAINID,
  RPC_URL,
  ZKSYNC_CHAINID,
  ZKSYNC_GOERLI_CHAINID,
  AVALANCHE_CHAINID,
  OPTIMISM_CHAINID,
  SCROLL_CHAINID,
  BASE_CHAINID,
  MANTA_CHAINID,
  BSC_CHAINID,
  ZKFAIR_CHAINID,
  METIS_CHAINID,
  NEON_CHAINID,
} from "./helpers/constants";
import {HardhatNetworkForkingUserConfig} from "hardhat/types";

dotenv.config();

// const GWEI = 1000 * 1000 * 1000;

export const buildForkConfig = ():
  | HardhatNetworkForkingUserConfig
  | undefined => {
  let forkMode: HardhatNetworkForkingUserConfig | undefined;
  if (FORK) {
    forkMode = {
      url: NETWORKS_RPC_URL[FORK],
    };
    if (FORK_BLOCK_NUMBER || BLOCK_TO_FORK[FORK]) {
      forkMode.blockNumber = FORK_BLOCK_NUMBER || BLOCK_TO_FORK[FORK];
    }
  }
  return forkMode;
};

export const NETWORKS_RPC_URL: iParamsPerNetwork<string> = {
  [eEthereumNetwork.goerli]:
    RPC_URL ||
    (ALCHEMY_KEY
      ? `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_KEY}`
      : `https://goerli.infura.io/v3/${INFURA_KEY}`),
  [eEthereumNetwork.sepolia]:
    RPC_URL ||
    (ALCHEMY_KEY
      ? `https://eth-sepolia.alchemyapi.io/v2/${ALCHEMY_KEY}`
      : `https://sepolia.infura.io/v3/${INFURA_KEY}`),
  [eEthereumNetwork.mainnet]:
    RPC_URL ||
    (ALCHEMY_KEY
      ? `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`
      : `https://mainnet.infura.io/v3/${INFURA_KEY}`),
  [eEthereumNetwork.hardhat]: RPC_URL || "http://localhost:8545",
  [eEthereumNetwork.anvil]: RPC_URL || "http://localhost:8545",
  [eEthereumNetwork.ganache]: RPC_URL || "http://localhost:8545",
  [eEthereumNetwork.parallel]: RPC_URL || "http://localhost:29933",
  [eEthereumNetwork.moonbeam]: "https://rpc.api.moonbeam.network",
  [eEthereumNetwork.moonbase]: "https://rpc.testnet.moonbeam.network",
  [eEthereumNetwork.arbitrum]:
    RPC_URL || `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [eEthereumNetwork.arbitrumGoerli]:
    RPC_URL || `https://arb-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [eEthereumNetwork.arbitrumSepolia]:
    RPC_URL || `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [eEthereumNetwork.polygon]:
    RPC_URL || `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [eEthereumNetwork.polygonMumbai]:
    RPC_URL || `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [eEthereumNetwork.polygonZkevm]:
    RPC_URL || `https://polygonzkevm-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [eEthereumNetwork.polygonZkevmGoerli]:
    RPC_URL || `https://polygonzkevm-testnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [eEthereumNetwork.zksync]: RPC_URL || `https://mainnet.era.zksync.io`,
  [eEthereumNetwork.zksyncGoerli]: RPC_URL || `https://testnet.era.zksync.dev`,
  [eEthereumNetwork.linea]:
    RPC_URL ||
    (INFURA_KEY
      ? `https://linea-mainnet.infura.io/v3/${INFURA_KEY}`
      : "https://rpc.linea.build"),
  [eEthereumNetwork.lineaGoerli]:
    RPC_URL ||
    (INFURA_KEY
      ? `https://linea-goerli.infura.io/v3/${INFURA_KEY}`
      : `https://rpc.goerli.linea.build`),
  [eEthereumNetwork.avalanche]: RPC_URL || "https://rpc.ankr.com/avalanche",
  [eEthereumNetwork.optimism]:
    RPC_URL || `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [eEthereumNetwork.scroll]: RPC_URL || `https://rpc.scroll.io`,
  [eEthereumNetwork.base]: RPC_URL || `https://mainnet.base.org`,
  [eEthereumNetwork.manta]: RPC_URL || `https://pacific-rpc.manta.network/http`,
  [eEthereumNetwork.bsc]: RPC_URL || `https://bsc.publicnode.com`,
  [eEthereumNetwork.zkfair]: RPC_URL || `https://rpc.zkfair.io`,
  [eEthereumNetwork.metis]: RPC_URL || `https://metis.api.onfinality.io/public`,
  [eEthereumNetwork.neon]:
    RPC_URL || `https://neon-proxy-mainnet.solana.p2p.org`,
};

export const CHAINS_ID: iParamsPerNetwork<number | undefined> = {
  [eEthereumNetwork.mainnet]: MAINNET_CHAINID,
  [eEthereumNetwork.goerli]: GOERLI_CHAINID,
  [eEthereumNetwork.sepolia]: GOERLI_CHAINID,
  [eEthereumNetwork.hardhat]: FORK ? FORK_CHAINID : HARDHAT_CHAINID,
  [eEthereumNetwork.anvil]: HARDHAT_CHAINID,
  [eEthereumNetwork.ganache]: undefined,
  [eEthereumNetwork.parallel]: PARALLEL_CHAINID,
  [eEthereumNetwork.moonbeam]: MOONBEAM_CHAINID,
  [eEthereumNetwork.moonbase]: MOONBASE_CHAINID,
  [eEthereumNetwork.arbitrum]: ARBITRUM_ONE_CHAINID,
  [eEthereumNetwork.arbitrumGoerli]: ARBITRUM_GOERLI_CHAINID,
  [eEthereumNetwork.arbitrumSepolia]: ARBITRUM_SEPOLIA_CHAINID,
  [eEthereumNetwork.polygon]: POLYGON_CHAINID,
  [eEthereumNetwork.polygonMumbai]: POLYGON_MUMBAI_CHAINID,
  [eEthereumNetwork.polygonZkevm]: POLYGON_ZKEVM_CHAINID,
  [eEthereumNetwork.polygonZkevmGoerli]: POLYGON_ZKEVM_GOERLI_CHAINID,
  [eEthereumNetwork.zksync]: ZKSYNC_CHAINID,
  [eEthereumNetwork.zksyncGoerli]: ZKSYNC_GOERLI_CHAINID,
  [eEthereumNetwork.linea]: LINEA_CHAINID,
  [eEthereumNetwork.lineaGoerli]: LINEA_GOERLI_CHAINID,
  [eEthereumNetwork.avalanche]: AVALANCHE_CHAINID,
  [eEthereumNetwork.optimism]: OPTIMISM_CHAINID,
  [eEthereumNetwork.scroll]: SCROLL_CHAINID,
  [eEthereumNetwork.base]: BASE_CHAINID,
  [eEthereumNetwork.manta]: MANTA_CHAINID,
  [eEthereumNetwork.bsc]: BSC_CHAINID,
  [eEthereumNetwork.zkfair]: ZKFAIR_CHAINID,
  [eEthereumNetwork.metis]: METIS_CHAINID,
  [eEthereumNetwork.neon]: NEON_CHAINID,
};

export const BLOCK_TO_FORK: iParamsPerNetwork<number | undefined> = {
  [eEthereumNetwork.mainnet]: undefined,
  [eEthereumNetwork.goerli]: undefined,
  [eEthereumNetwork.sepolia]: undefined,
  [eEthereumNetwork.hardhat]: undefined,
  [eEthereumNetwork.anvil]: undefined,
  [eEthereumNetwork.ganache]: undefined,
  [eEthereumNetwork.parallel]: undefined,
  [eEthereumNetwork.moonbeam]: undefined,
  [eEthereumNetwork.moonbase]: undefined,
  [eEthereumNetwork.arbitrum]: undefined,
  [eEthereumNetwork.arbitrumGoerli]: undefined,
  [eEthereumNetwork.arbitrumSepolia]: undefined,
  [eEthereumNetwork.polygon]: undefined,
  [eEthereumNetwork.polygonMumbai]: undefined,
  [eEthereumNetwork.polygonZkevm]: undefined,
  [eEthereumNetwork.polygonZkevmGoerli]: undefined,
  [eEthereumNetwork.zksync]: undefined,
  [eEthereumNetwork.zksyncGoerli]: undefined,
  [eEthereumNetwork.linea]: undefined,
  [eEthereumNetwork.lineaGoerli]: undefined,
  [eEthereumNetwork.avalanche]: undefined,
  [eEthereumNetwork.optimism]: undefined,
  [eEthereumNetwork.scroll]: undefined,
  [eEthereumNetwork.base]: undefined,
  [eEthereumNetwork.manta]: undefined,
  [eEthereumNetwork.bsc]: undefined,
  [eEthereumNetwork.zkfair]: undefined,
  [eEthereumNetwork.metis]: undefined,
  [eEthereumNetwork.neon]: undefined,
};
