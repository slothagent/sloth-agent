require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    'ancient8-celestia-testnet': {
      url: 'https://rpcv2-testnet.ancient8.gg',
      accounts: [process.env.PRIVATE_KEY],
      chainId: 28122024
    },
  },
  etherscan: {
    apiKey: {
      'ancient8-celestia-testnet': 'empty'
    },
    customChains: [
      {
        network: "ancient8-celestia-testnet",
        chainId: 28122024,
        urls: {
          apiURL: "https://explorer-ancient-8-celestia-wib77nnwsq.t.conduit.xyz/api",
          browserURL: "https://explorer-ancient-8-celestia-wib77nnwsq.t.conduit.xyz:443"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};