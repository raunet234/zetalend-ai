'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useZetaLend } from '@/hooks/useZetaLend';
import toast from 'react-hot-toast';
import { SUPPORTED_CHAINS } from '@/utils/chains';

export default function LendingInterface() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [isClient, setIsClient] = useState(false);
  
  const {
    deposit,
    borrow,
    isLoading,
    
    // Chain and token selection
    depositChains,
    selectedDepositChain,
    setSelectedDepositChain,
    selectedDepositToken,
    setSelectedDepositToken,
    availableDepositTokens,
    
    borrowChains,
    selectedBorrowChain,
    setSelectedBorrowChain,
    selectedBorrowToken,
    setSelectedBorrowToken,
    availableBorrowTokens,
    
    getChainName,
    SUPPORTED_TOKENS
  } = useZetaLend();

  // This effect runs only on the client after hydration is complete
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDeposit = async () => {
    if (!depositAmount) return;
    
    try {
      await deposit(depositAmount);
      toast.success('Deposit successful!');
      setDepositAmount('');
    } catch (error: any) {
      console.error("Deposit error:", error);
      
      if (error.message?.includes('RPC timeout') || error.message?.includes('timed out') || error.message?.includes('network connection')) {
        // For RPC timeouts, show a special message with a retry button
        toast.error(
          <div className="flex flex-col gap-2">
            <span>Network connection timed out.</span>
            <button 
              className="bg-blue-600 text-white text-xs py-1 px-2 rounded-md hover:bg-blue-500"
              onClick={() => handleDeposit()}
            >
              Retry with new RPC endpoint
            </button>
          </div>,
          { duration: 10000 }
        );
      } else {
        toast.error(error.message || 'Failed to deposit');
      }
    }
  };

  const handleBorrow = async () => {
    if (!borrowAmount) return;
    
    try {
      // Display a reminder about deposit requirement
      if (selectedDepositChain !== SUPPORTED_CHAINS.zetachainAthens) {
        toast('Remember: You need to deposit collateral on ZetaChain Athens before borrowing.', {
          duration: 5000,
          icon: '🔔',
        });
      }
      
      await borrow(borrowAmount);
      toast.success('Borrow successful!');
      setBorrowAmount('');
    } catch (error: any) {
      console.error("Borrow error:", error);
      
      // Check for specific error types
      if (error.message?.includes('No collateral') || error.message?.includes('no collateral deposited')) {
        toast.error('You must deposit collateral on ZetaChain Athens before borrowing.', {
          duration: 6000,
          icon: '⚠️',
        });
      } else if (error.message?.includes('RPC timeout') || error.message?.includes('timed out') || error.message?.includes('network connection')) {
        // For RPC timeouts, show a special message with a retry button
        toast.error(
          <div className="flex flex-col gap-2">
            <span>Network connection timed out.</span>
            <button 
              className="bg-blue-600 text-white text-xs py-1 px-2 rounded-md hover:bg-blue-500"
              onClick={() => handleBorrow()}
            >
              Retry with new RPC endpoint
            </button>
          </div>,
          { duration: 10000 }
        );
      } else {
        toast.error(error.message || 'Failed to borrow');
      }
    }
  };

  // For initial server-side render, show minimal content to avoid hydration errors
  if (!isClient) {
    return (
      <div className="card space-y-6">
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>
    );
  }

  // For client-side, show the appropriate content based on connection status
  if (!isConnected) {
    return (
      <div className="card">
        <p className="text-center text-gray-400">
          Please connect your wallet to use the lending interface
        </p>
      </div>
    );
  }

  // Main component content - only rendered on client after hydration is complete
  return (
    <div className="card space-y-6">
      <h2 className="text-xl font-semibold">Lending Interface</h2>
      
      <div className="bg-blue-900/30 border border-blue-800 rounded-md p-3 text-sm text-blue-200 mb-4">
        <p className="font-medium mb-1">📌 Multi-Chain Testnet Mode</p>
        <p>You need testnet tokens to test this interface:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Get ZetaChain Athens testnet ZETA from <a href="https://labs.zetachain.com/get-zeta" target="_blank" rel="noopener noreferrer" className="underline">labs.zetachain.com/get-zeta</a></li>
          <li>Get BSC Testnet BNB from <a href="https://testnet.bnbchain.org/faucet-smart" target="_blank" rel="noopener noreferrer" className="underline">BNB Testnet Faucet</a></li>
          <li>Get Mumbai MATIC from <a href="https://mumbaifaucet.com/" target="_blank" rel="noopener noreferrer" className="underline">Mumbai Faucet</a></li>
          <li>Get Arbitrum Goerli ETH from <a href="https://goerlifaucet.com/" target="_blank" rel="noopener noreferrer" className="underline">Goerli Faucet</a></li>
          <li>Get Avalanche Fuji AVAX from <a href="https://faucet.avax.network/" target="_blank" rel="noopener noreferrer" className="underline">Avalanche Faucet</a></li>
        </ul>
        <p className="mt-2 text-xs italic">Note: Currently deposits are only supported on ZetaChain Athens testnet, while borrowing is available on multiple chains.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
            <label className="block text-sm font-medium text-gray-300">
              Deposit on
            </label>
            <div className="flex gap-2">
              <select 
                className="select select-sm select-bordered bg-gray-800 text-gray-200 border-gray-600"
                value={selectedDepositChain}
                onChange={(e) => setSelectedDepositChain(Number(e.target.value))}
                disabled={isLoading || depositChains.length <= 1}
              >
                {depositChains.map((chainId) => (
                  <option key={chainId} value={chainId}>
                    {getChainName(chainId)}
                  </option>
                ))}
              </select>
              
              <select 
                className="select select-sm select-bordered bg-gray-800 text-gray-200 border-gray-600"
                value={selectedDepositToken?.symbol || ''}
                onChange={(e) => {
                  const token = availableDepositTokens.find(t => t.symbol === e.target.value);
                  if (token) setSelectedDepositToken(token);
                }}
                disabled={isLoading || availableDepositTokens.length <= 1}
              >
                {availableDepositTokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.name || token.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <input
              type="number"
              className="input flex-1"
              placeholder="0.0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={isLoading}
            />
            <button
              className="btn btn-primary"
              onClick={handleDeposit}
              disabled={!depositAmount || isLoading}
            >
              Deposit {selectedDepositToken?.symbol || 'ZETA'}
            </button>
          </div>
        </div>

        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
            <label className="block text-sm font-medium text-gray-300">
              Borrow on
            </label>
            <div className="flex gap-2">
              <select 
                className="select select-sm select-bordered bg-gray-800 text-gray-200 border-gray-600"
                value={selectedBorrowChain}
                onChange={(e) => setSelectedBorrowChain(Number(e.target.value))}
                disabled={isLoading}
              >
                {borrowChains.map((chainId) => (
                  <option key={chainId} value={chainId}>
                    {getChainName(chainId)}
                  </option>
                ))}
              </select>
              
              <select 
                className="select select-sm select-bordered bg-gray-800 text-gray-200 border-gray-600"
                value={selectedBorrowToken?.symbol || ''}
                onChange={(e) => {
                  const token = availableBorrowTokens.find(t => t.symbol === e.target.value);
                  if (token) setSelectedBorrowToken(token);
                }}
                disabled={isLoading || availableBorrowTokens.length <= 1}
              >
                {availableBorrowTokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.name || token.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <input
              type="number"
              className="input flex-1"
              placeholder="0.0"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              disabled={isLoading}
            />
            <button
              className="btn btn-secondary"
              onClick={handleBorrow}
              disabled={!borrowAmount || isLoading}
            >
              Borrow {selectedBorrowToken?.symbol || 'Token'}
            </button>
          </div>
        </div>
        
        {/* Add a feature list */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-md border border-gray-700">
          <h3 className="text-base font-medium mb-2">Features Coming Soon</h3>
          <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
            <li>Cross-chain transfers via ZetaChain</li>
            <li>Interest earning on deposits</li>
            <li>Additional supported tokens and chains</li>
            <li>Liquidation protection features</li>
            <li>Analytics dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
