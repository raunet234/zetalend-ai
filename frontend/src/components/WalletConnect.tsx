'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalletConnect() {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
      <div className="flex justify-center">
        <ConnectButton />
      </div>
    </div>
  );
}
