export const SUPPORTED_CHAINS = {
  ethereum: 1, // Ethereum Mainnet
  bsc: 56, // BSC Mainnet
  zetachain: 7000, // ZetaChain Mainnet
  // Testnets
  ethereumGoerli: 5,
  bscTestnet: 97,
  zetachainAthens: 7001,
} as const;

export const CHAIN_NAMES = {
  [SUPPORTED_CHAINS.ethereum]: 'Ethereum',
  [SUPPORTED_CHAINS.bsc]: 'BSC',
  [SUPPORTED_CHAINS.zetachain]: 'ZetaChain',
  [SUPPORTED_CHAINS.ethereumGoerli]: 'Goerli',
  [SUPPORTED_CHAINS.bscTestnet]: 'BSC Testnet',
  [SUPPORTED_CHAINS.zetachainAthens]: 'ZetaChain Athens',
} as const;
