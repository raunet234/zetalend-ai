'use client';

import React from 'react';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, sepolia, goerli, bsc, bscTestnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ZetaChain testnet configuration
const zetaChainTestnet = {
  id: 7001,
  name: 'ZetaChain Athens Testnet',
  network: 'zetachain-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ZETA',
    symbol: 'ZETA',
  },
  rpcUrls: {
    public: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] },
    default: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] },
  },
  blockExplorers: {
    default: { name: 'ZetaChain Explorer', url: 'https://explorer.zetachain.com' },
  },
};

// Using the built-in Sepolia chain from wagmi/chains

const { chains, publicClient } = configureChains(
  [zetaChainTestnet, mainnet, sepolia, goerli, bsc, bscTestnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'ZetaLend',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '2f5a2b1d8e3c4a5b6c7d8e9f0a1b2c3d', // Default fallback projectId
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} initialChain={sepolia.id}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
