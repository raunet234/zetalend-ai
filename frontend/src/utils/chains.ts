export const SUPPORTED_CHAINS = {
  ethereum: 1, // Ethereum Mainnet
  bsc: 56, // BSC Mainnet
  zetachain: 7000, // ZetaChain Mainnet
  // Testnets
  ethereumGoerli: 5,
  ethereumSepolia: 11155111, // Ethereum Sepolia Testnet
  bscTestnet: 97,
  zetachainAthens: 7001,
  arbitrumGoerli: 421613, // Arbitrum Goerli Testnet
  avalancheFuji: 43113, // Avalanche Fuji Testnet
  polygonMumbai: 80001 // Polygon Mumbai Testnet
} as const;

export const CHAIN_NAMES = {
  [SUPPORTED_CHAINS.ethereum]: 'Ethereum',
  [SUPPORTED_CHAINS.bsc]: 'BSC',
  [SUPPORTED_CHAINS.zetachain]: 'ZetaChain',
  [SUPPORTED_CHAINS.ethereumGoerli]: 'Goerli',
  [SUPPORTED_CHAINS.ethereumSepolia]: 'Sepolia',
  [SUPPORTED_CHAINS.bscTestnet]: 'BSC Testnet',
  [SUPPORTED_CHAINS.zetachainAthens]: 'ZetaChain Athens',
  [SUPPORTED_CHAINS.arbitrumGoerli]: 'Arbitrum Goerli',
  [SUPPORTED_CHAINS.avalancheFuji]: 'Avalanche Fuji',
  [SUPPORTED_CHAINS.polygonMumbai]: 'Polygon Mumbai',
} as const;
