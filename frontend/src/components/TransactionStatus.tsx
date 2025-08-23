'use client';

import { useEffect, useState } from 'react';
import { useWaitForTransaction } from 'wagmi';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

interface Transaction {
  hash: string;
  description: string;
  status: 'pending' | 'success' | 'error';
}

export default function TransactionStatus() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  const { data, isError, isLoading } = useWaitForTransaction({
    hash: selectedTx as `0x${string}`,
    enabled: !!selectedTx,
  });

  useEffect(() => {
    if (data) {
      setTransactions(prev =>
        prev.map(tx =>
          tx.hash === selectedTx
            ? { ...tx, status: 'success' }
            : tx
        )
      );
      setSelectedTx(null);
    }
  }, [data, selectedTx]);

  useEffect(() => {
    if (isError) {
      setTransactions(prev =>
        prev.map(tx =>
          tx.hash === selectedTx
            ? { ...tx, status: 'error' }
            : tx
        )
      );
      setSelectedTx(null);
    }
  }, [isError, selectedTx]);

  if (transactions.length === 0) return null;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <div
            key={tx.hash}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50"
          >
            <div>
              <p className="text-sm font-medium">{tx.description}</p>
              <a
                href={`https://explorer.zetachain.com/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-400 hover:text-primary-300"
              >
                {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm ${
                  tx.status === 'pending'
                    ? 'text-yellow-400'
                    : tx.status === 'success'
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {tx.status}
              </span>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
