'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNetwork } from 'wagmi';
import { useState, useEffect } from 'react';
import { SUPPORTED_CHAINS } from '@/utils/chains';

export default function WalletConnect() {
  const { chain } = useNetwork();
  const [showRpcTip, setShowRpcTip] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Fix hydration error by setting client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // For initial server-side render, show minimal content to avoid hydration errors
  if (!isClient) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
      </div>
    );
  }
  
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
      
      {chain && chain.id !== SUPPORTED_CHAINS.zetachainAthens && (
        <div className="bg-yellow-800/30 border border-yellow-700 rounded p-2 mb-4 text-sm text-yellow-200">
          <p>Please connect to the <strong>ZetaChain Athens Testnet</strong> for deposits and <strong>BSC Testnet</strong> for borrowing.</p>
        </div>
      )}
      
      {showRpcTip && (
        <div className="bg-blue-800/30 border border-blue-700 rounded p-2 mb-4 text-sm text-blue-200">
          <p className="mb-1">If you're experiencing RPC timeouts with ZetaChain Athens testnet, try adding these RPC URLs in MetaMask:</p>
          <ul className="list-disc pl-5 text-xs">
            <li>https://zetachain-athens-evm.blockpi.network/v1/rpc/public</li>
            <li>https://zetachain-athens-evm.blockpi.network/v1/rpc/public</li>
            <li>https://zetachain-athens-evm.public.blastapi.io</li>
          </ul>
          <button 
            onClick={() => setShowRpcTip(false)} 
            className="text-xs text-blue-400 mt-2 hover:text-blue-300"
          >
            Hide this tip
          </button>
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <ConnectButton />
        
        {!showRpcTip && (
          <button 
            onClick={() => setShowRpcTip(true)} 
            className="text-xs text-gray-400 mt-2 hover:text-gray-300"
          >
            Having connection issues?
          </button>
        )}
      </div>
    </div>
  );
}
