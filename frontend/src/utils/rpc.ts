import { SUPPORTED_CHAINS, CHAIN_NAMES } from './chains';

/**
 * RPC URLs for various networks with fallback options
 */
export const RPC_URLS: Record<number, string[]> = {
  // Testnets
  [SUPPORTED_CHAINS.zetachainAthens]: [
    // Primary RPC URLs
    'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    // Fallback RPC URLs
    'https://zetachain-athens-evm.public.blastapi.io',
    'https://zetachain-athens-evm-rpc.publicnode.com',
    'https://zetachain-athens-evm.gateway.tenderly.co'
  ],
  [SUPPORTED_CHAINS.ethereumSepolia]: [
    'https://ethereum-sepolia.publicnode.com',
    'https://rpc.sepolia.org',
    'https://rpc2.sepolia.org'
  ],
  [SUPPORTED_CHAINS.bscTestnet]: [
    'https://bsc-testnet.publicnode.com',
    'https://data-seed-prebsc-1-s1.binance.org:8545',
    'https://data-seed-prebsc-2-s1.binance.org:8545'
  ],
  [SUPPORTED_CHAINS.arbitrumGoerli]: [
    'https://arbitrum-goerli.publicnode.com',
    'https://goerli-rollup.arbitrum.io/rpc'
  ],
  [SUPPORTED_CHAINS.avalancheFuji]: [
    'https://avalanche-fuji-c-chain.publicnode.com',
    'https://api.avax-test.network/ext/bc/C/rpc'
  ],
  [SUPPORTED_CHAINS.polygonMumbai]: [
    'https://polygon-mumbai.blockpi.network/v1/rpc/public',
    'https://polygon-mumbai-bor.publicnode.com'
  ]
};

/**
 * Current RPC index for each chain
 */
export const currentRpcIndexes: Record<number, number> = {};

/**
 * Get an RPC URL for the specified chain
 * @param chainId The chain ID
 * @returns A valid RPC URL
 */
export function getRpcUrl(chainId: number): string {
  const urls = RPC_URLS[chainId];
  if (!urls || urls.length === 0) {
    throw new Error(`No RPC URLs configured for chain ID ${chainId}`);
  }
  
  const index = currentRpcIndexes[chainId] || 0;
  return urls[index];
}

/**
 * Switch to the next RPC URL in the list for a chain
 * @param chainId The chain ID
 * @returns true if switched successfully, false if no more RPCs available
 */
export function switchToNextRpc(chainId: number): boolean {
  const urls = RPC_URLS[chainId];
  if (!urls) return false;
  
  const currentIndex = currentRpcIndexes[chainId] || 0;
  const nextIndex = currentIndex + 1;
  
  if (nextIndex < urls.length) {
    currentRpcIndexes[chainId] = nextIndex;
    console.log(`Switched to RPC #${nextIndex + 1} for ${CHAIN_NAMES[chainId as keyof typeof CHAIN_NAMES] || chainId}: ${urls[nextIndex]}`);
    return true;
  }
  
  // Reset to the first RPC if we've tried all of them
  currentRpcIndexes[chainId] = 0;
  return false;
}

/**
 * Retry a function with exponential backoff
 * @param fn The function to retry
 * @param maxRetries Maximum number of retries
 * @returns The function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      console.error(`Attempt ${attempt + 1}/${maxRetries} failed: ${error.message}`);
      lastError = error;
      
      // If this was our last attempt, don't wait
      if (attempt === maxRetries - 1) break;
      
      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error("Operation failed after multiple retries");
}
