'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useZetaLend } from '@/hooks/useZetaLend';
import toast from 'react-hot-toast';

export default function LendingInterface() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  
  const {
    deposit,
    borrow,
    isLoading,
    depositToken,
    borrowToken,
  } = useZetaLend();

  const handleDeposit = async () => {
    if (!depositAmount) return;
    
    try {
      await deposit(depositAmount);
      toast.success('Deposit successful!');
      setDepositAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to deposit');
    }
  };

  const handleBorrow = async () => {
    if (!borrowAmount) return;
    
    try {
      await borrow(borrowAmount);
      toast.success('Borrow successful!');
      setBorrowAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to borrow');
    }
  };

  if (!isConnected) {
    return (
      <div className="card">
        <p className="text-center text-gray-400">
          Please connect your wallet to use the lending interface
        </p>
      </div>
    );
  }

  return (
    <div className="card space-y-6">
      <h2 className="text-xl font-semibold">{typeof window !== 'undefined' ? 'Lending Interface' : 'Loading...'}</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Deposit {depositToken?.symbol} (on Ethereum)
          </label>
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
              Deposit
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Borrow {borrowToken?.symbol} (on BSC)
          </label>
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
              Borrow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
