import { useCallback, useState } from 'react';
import { 
  useContractWrite, 
  useContractRead, 
  useWalletClient, 
  useNetwork, 
  useSwitchNetwork 
} from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { ZETALEND_ADDRESS, ZETALEND_ABI } from '@/utils/contracts';
import { SUPPORTED_CHAINS } from '@/utils/chains';
import toast from 'react-hot-toast';

export const useZetaLend = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const { writeAsync: depositAsync } = useContractWrite({
    address: ZETALEND_ADDRESS,
    abi: ZETALEND_ABI,
    functionName: 'deposit',
  });

  const { writeAsync: borrowAsync } = useContractWrite({
    address: ZETALEND_ADDRESS,
    abi: ZETALEND_ABI,
    functionName: 'borrow',
  });

  const depositToken = {
    symbol: 'ZETA',
    decimals: 18,
  };

  const borrowToken = {
    symbol: 'TestUSDT',
    decimals: 6,
  };

  const deposit = useCallback(async (amount: string) => {
    if (!walletClient) throw new Error('Wallet not connected');
    if (!chain) throw new Error('Network not connected');

    try {
      setIsLoading(true);

      // Switch to ZetaChain Athens testnet
      if (chain.id !== SUPPORTED_CHAINS.zetachainAthens) {
        await switchNetwork?.(SUPPORTED_CHAINS.zetachainAthens);
      }

      // Convert amount to Wei
      const value = parseEther(amount);

      // Send transaction
      const { hash } = await depositAsync({
        args: [],
        value,
      });

      toast.success('Deposit transaction sent!');
      return hash;
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.message || 'Failed to deposit');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, chain, switchNetwork, depositAsync]);

  const borrow = useCallback(async (amount: string) => {
    if (!walletClient) throw new Error('Wallet not connected');
    if (!chain) throw new Error('Network not connected');

    try {
      setIsLoading(true);

      // Switch to BSC Testnet instead of mainnet
      if (chain.id !== SUPPORTED_CHAINS.bscTestnet) {
        await switchNetwork?.(SUPPORTED_CHAINS.bscTestnet);
      }

      // Convert amount to smallest unit (USDT uses 6 decimals)
      const value = parseUnits(amount, 6);

      // Send transaction
      const { hash } = await borrowAsync({
        args: [value],
      });

      toast.success('Borrow transaction sent!');
      return hash;
    } catch (error: any) {
      console.error('Borrow error:', error);
      toast.error(error.message || 'Failed to borrow');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, chain, switchNetwork, borrowAsync]);

  return {
    deposit,
    borrow,
    isLoading,
    depositToken,
    borrowToken,
    isConnected: !!walletClient,
  };
};
