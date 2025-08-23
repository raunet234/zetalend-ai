'use client';

import React from 'react';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, goerli, bsc, bscTestnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { chains, publicClient } = configureChains(
  [mainnet, goerli, bsc, bscTestnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'ZetaLend',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
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
      <RainbowKitProvider chains={chains}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
