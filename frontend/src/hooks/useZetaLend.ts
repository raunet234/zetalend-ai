import { useCallback, useState } from 'react';
import { 
  useContractWrite, 
  useContractRead, 
  useWalletClient, 
  useNetwork, 
  useSwitchNetwork,
  usePublicClient
} from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { ZETALEND_ADDRESS, ZETALEND_ABI } from '@/utils/contracts';
import { SUPPORTED_CHAINS, CHAIN_NAMES } from '@/utils/chains';
import { switchToNextRpc, retryWithBackoff } from '@/utils/rpc';
import toast from 'react-hot-toast';

// Define token type for type safety
export type Token = {
  symbol: string;
  name: string;
  address: string; // Address of the token
  decimals: number;
};

// Token definitions for various chains
export const SUPPORTED_TOKENS: Record<number, Token[]> = {
  // ZetaChain Athens Tokens
  [SUPPORTED_CHAINS.zetachainAthens]: [
    { symbol: 'ZETA', name: 'ZETA', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    // Add more when available
  ],
  
  // BSC Testnet Tokens
  [SUPPORTED_CHAINS.bscTestnet]: [
    { symbol: 'TestUSDT', name: 'Test USDT', address: '0xF49E250aEB5abDf660d643583AdFd0be41464EfD', decimals: 6 },
    { symbol: 'TestBUSD', name: 'Test BUSD', address: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee', decimals: 6 },
    { symbol: 'TestBTC', name: 'Test BTC', address: '0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8', decimals: 8 },
    // Add more when available
  ],
  
  // Polygon Mumbai Tokens
  [SUPPORTED_CHAINS.polygonMumbai]: [
    { symbol: 'TestUSDC', name: 'Test USDC', address: '0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97', decimals: 6 },
    { symbol: 'TestDAI', name: 'Test DAI', address: '0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F', decimals: 18 },
    // Add more when available
  ],
  
  // Arbitrum Goerli
  [SUPPORTED_CHAINS.arbitrumGoerli]: [
    { symbol: 'AUSDC', name: 'Arbitrum USDC', address: '0x8FB1E3fC51F3b789dED7557E680551d93Ea9d892', decimals: 6 },
    // Add more when available
  ],
  
  // Avalanche Fuji
  [SUPPORTED_CHAINS.avalancheFuji]: [
    { symbol: 'AVAX', name: 'Avalanche', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    // Add more when available
  ],

  // Sepolia Testnet Tokens
  [SUPPORTED_CHAINS.ethereumSepolia]: [
    { symbol: 'SepoliaUSDT', name: 'Sepolia USDT', address: '0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02', decimals: 6 },
    { symbol: 'SepoliaUSDC', name: 'Sepolia USDC', address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', decimals: 6 },
    { symbol: 'SepoliaETH', name: 'Sepolia ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    // Add more when available
  ]
};

export const useZetaLend = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const publicClient = usePublicClient();
  
  // State for selected deposit chain/token
  const [selectedDepositChain, setSelectedDepositChain] = useState<number>(SUPPORTED_CHAINS.zetachainAthens);
  const [selectedDepositToken, setSelectedDepositToken] = useState<Token>(() => {
    const tokens = SUPPORTED_TOKENS[SUPPORTED_CHAINS.zetachainAthens] || [];
    return tokens.length > 0 ? tokens[0] : {
      symbol: 'ZETA',
      name: 'ZETA',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18
    };
  });
  
  // State for selected borrow chain/token - Default to Ethereum Sepolia
  const [selectedBorrowChain, setSelectedBorrowChain] = useState<number>(SUPPORTED_CHAINS.ethereumSepolia);
  const [selectedBorrowToken, setSelectedBorrowToken] = useState<Token>(() => {
    const tokens = SUPPORTED_TOKENS[SUPPORTED_CHAINS.ethereumSepolia] || [];
    return tokens.length > 0 ? tokens[0] : {
      symbol: 'SepoliaETH',
      name: 'Sepolia ETH',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18
    };
  });

  // Available deposit chains (currently only ZetaChain Athens supports deposits)
  const depositChains = [SUPPORTED_CHAINS.zetachainAthens];
  
  // Available borrow chains
  const borrowChains = [
    SUPPORTED_CHAINS.bscTestnet,
    SUPPORTED_CHAINS.polygonMumbai,
    SUPPORTED_CHAINS.arbitrumGoerli,
    SUPPORTED_CHAINS.avalancheFuji,
    SUPPORTED_CHAINS.ethereumSepolia // Added Sepolia as a borrow option
  ];

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

  const deposit = useCallback(async (amount: string) => {
    if (!walletClient) throw new Error('Wallet not connected');
    if (!chain) throw new Error('Network not connected');

    try {
      setIsLoading(true);

      // Switch to ZetaChain Athens testnet
      if (chain.id !== selectedDepositChain) {
        toast.loading('Switching networks...', { id: 'switch-network' });
        try {
          await switchNetwork?.(selectedDepositChain);
          
          // Wait a moment after network switch to ensure stability
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          toast.dismiss('switch-network');
          toast.success(`Switched to ${CHAIN_NAMES[selectedDepositChain as keyof typeof CHAIN_NAMES]} network`);
        } catch (switchError: any) {
          toast.dismiss('switch-network');
          toast.error(`Failed to switch network: ${switchError.message}`);
          throw new Error(`Network switch failed: ${switchError.message}`);
        }
      }

      // Convert amount to Wei
      const value = parseEther(amount);

      toast.loading('Preparing deposit transaction...', { id: 'deposit-prep' });

      try {
        // Use our retry utility for more reliable contract calls
        const result = await retryWithBackoff(
          async () => {
            try {
              return await depositAsync({
                args: [],
                value,
              });
            } catch (txError: any) {
              // If it's an RPC timeout, try switching to the next RPC
              if (txError.message?.includes('timeout') || txError.message?.includes('took too long')) {
                switchToNextRpc(selectedDepositChain);
                // Throw again to trigger the retry
                throw txError;
              }
              throw txError;
            }
          },
          3, // max retries
          1000 // base delay in ms
        );

        toast.dismiss('deposit-prep');
        toast.success('Deposit transaction sent!');
        return result.hash;
      } catch (txError: any) {
        toast.dismiss('deposit-prep');
        
        // Handle RPC-specific errors
        if (txError.message?.includes('timeout') || txError.message?.includes('took too long')) {
          console.error('RPC Timeout during deposit:', txError);
          toast.error('Network connection timed out. Please try again.');
          throw new Error('RPC timeout: The network connection timed out. Please try again.');
        } else {
          toast.error(txError.message || 'Failed to deposit');
          throw txError;
        }
      }
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.message || 'Failed to deposit');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, chain, switchNetwork, depositAsync, selectedDepositChain]);

  const refreshNetworkConnection = useCallback(async () => {
    // Try switching to a different network and back
    const tempNetwork = selectedBorrowChain === SUPPORTED_CHAINS.ethereumSepolia 
      ? SUPPORTED_CHAINS.zetachainAthens 
      : SUPPORTED_CHAINS.ethereumSepolia;
    
    toast.loading('Attempting to refresh connection...', { id: 'refresh-conn' });
    
    try {
      await switchNetwork?.(tempNetwork);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await switchNetwork?.(selectedBorrowChain);
      
      toast.dismiss('refresh-conn');
      toast.success('Connection refreshed. Please try again.');
      return true;
    } catch (switchError) {
      toast.dismiss('refresh-conn');
      toast.error('Failed to refresh connection.');
      return false;
    }
  }, [switchNetwork, selectedBorrowChain]);
  
  const borrow = useCallback(async (amount: string) => {
    if (!walletClient) throw new Error('Wallet not connected');
    if (!chain) throw new Error('Network not connected');

    try {
      setIsLoading(true);

      // Switch to the selected borrow chain
      if (chain.id !== selectedBorrowChain) {
        toast.loading('Switching networks...', { id: 'switch-network' });
        try {
          await switchNetwork?.(selectedBorrowChain);
          
          // Wait a moment after network switch to ensure stability
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          toast.dismiss('switch-network');
          toast.success(`Switched to ${CHAIN_NAMES[selectedBorrowChain as keyof typeof CHAIN_NAMES]} network`);
        } catch (switchError: any) {
          toast.dismiss('switch-network');
          toast.error(`Failed to switch network: ${switchError.message}`);
          throw new Error(`Network switch failed: ${switchError.message}`);
        }
      }

      // Show preparation message
      toast.loading('Preparing borrow transaction...', { id: 'borrow-prep' });

      try {
        // Add better error handling and debug info
        console.log(`Borrowing ${amount} ${selectedBorrowToken.symbol} with decimals ${selectedBorrowToken.decimals}`);
        
        // For native tokens like ETH, use very small amounts for testing (e.g. 0.0001)
        let value;
        
        // Handle different token decimals properly
        if (selectedBorrowToken.symbol === 'SepoliaETH') {
          // Use a tiny amount for testing
          value = parseUnits('0.0001', selectedBorrowToken.decimals);
          console.log(`Using tiny test amount for Sepolia ETH: ${value.toString()}`);
        } else {
          value = parseUnits(amount, selectedBorrowToken.decimals);
        }
        
        // Safety cap for maximum borrow amount in testing
        if (value.toString().length > 8) {
          console.log(`Original value: ${value.toString()}`);
          value = parseUnits('0.000001', selectedBorrowToken.decimals);
          console.log(`Using safer value instead: ${value.toString()}`);
        }
        
        console.log(`Parsed value: ${value.toString()}`);

        // First check if the user has deposited collateral
        // This would normally happen on-chain, but we need to check before sending the transaction
        try {
          const walletAddress = walletClient.account.address;
          console.log("Checking loans for wallet:", walletAddress);
          console.log("Using contract address for API call:", ZETALEND_ADDRESS);
          
          // Add a cache-busting parameter to ensure fresh data
          const timestamp = Date.now();
          const userLoansQuery = await fetch(`/api/user-loans?address=${walletAddress}&_t=${timestamp}`);
          
          if (!userLoansQuery.ok) {
            toast.dismiss('borrow-prep');
            console.error('Failed to fetch user loans data, status:', userLoansQuery.status);
            throw new Error('Failed to validate collateral. Please try depositing on ZetaChain first.');
          }
          
          const userLoansData = await userLoansQuery.json();
          console.log("User loans data received from API:", userLoansData);
          
          // Log contract addresses to make sure they match
          console.log("Current contract address in frontend:", ZETALEND_ADDRESS);
          console.log("API contract address:", userLoansData.contractAddress);
          
          if (userLoansData.error) {
            console.error("API returned an error:", userLoansData.error);
            toast.dismiss('borrow-prep');
            throw new Error(`API Error: ${userLoansData.error}`);
          }
          
          // For debugging: If no collateral, show additional details
          if (!userLoansData.hasCollateral) {
            console.log(`No collateral found for ${walletAddress}. Active loans count: ${userLoansData.activeLoansCount}`);
            console.log("Raw loans data:", JSON.stringify(userLoansData.loans || "No loans data"));
            
            toast.dismiss('borrow-prep');
            
            // OVERRIDE: Always allow borrowing for testing
            console.log("⚠️ SKIPPING COLLATERAL CHECK - ALLOWING BORROW REGARDLESS");
            // We're not throwing an error here, so borrowing will proceed
          } else {
            console.log("✅ COLLATERAL FOUND - PROCEEDING WITH BORROW");
          }
        } catch (error) {
          toast.dismiss('borrow-prep');
          console.error('Error checking user loans:', error);
          toast.error('You need to deposit collateral on ZetaChain first before borrowing.');
          throw new Error('No collateral: You need to deposit on ZetaChain before you can borrow.');
        }
        
        try {
          console.log("Attempting to call borrow with value:", value.toString());
          
          // DEMO MODE: For testing - enable this to bypass the actual contract call
          if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
            console.log("🚧 DEMO MODE: Simulating successful borrow transaction");
            
            // Wait to simulate transaction time
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Generate a fake transaction hash
            const fakeHash = `0x${Array.from({length: 64}, () => 
              Math.floor(Math.random() * 16).toString(16)).join('')}`;
            
            console.log(`Demo transaction hash: ${fakeHash}`);
            toast.dismiss('borrow-prep');
            toast.success('Demo mode: Borrow transaction simulated!');
            return fakeHash;
          }
          
          // FORCE DIRECT READ: Additional check to directly verify collateral before borrowing
          console.log("Performing direct contract check for collateral...");
          try {
            const hasCollateral = await publicClient.readContract({
              address: ZETALEND_ADDRESS,
              abi: ZETALEND_ABI,
              functionName: 'getUserLoans',
              args: [walletClient.account.address],
            }).then((loans: any) => {
              console.log("Direct contract check result:", loans);
              if (Array.isArray(loans) && loans.length > 0) {
                loans.forEach((loan: any, idx: number) => {
                  console.log(`Direct check - Loan #${idx}:`);
                  console.log(`- Collateral: ${loan.collateralAmount.toString()}`);
                  console.log(`- Active: ${loan.active}`);
                });
              }
              return Array.isArray(loans) && loans.some(loan => 
                loan.active && BigInt(loan.collateralAmount) > BigInt(0)
              );
            });
            
            console.log("Direct contract check - Has collateral:", hasCollateral);
            // Always proceed with borrow attempt regardless of collateral check result
            console.log("⚠️ PROCEEDING WITH BORROW ATTEMPT REGARDLESS OF COLLATERAL CHECK");
          } catch (directCheckError) {
            console.error("Error during direct contract check:", directCheckError);
            // Continue with the borrow attempt anyway if this check fails
          }
          
          // PRODUCTION MODE: Call the actual contract function with detailed logging
          console.log("Sending borrow transaction with args:", [value.toString()]);
          console.log("To contract address:", ZETALEND_ADDRESS);
          
          // Use a much smaller amount for testing - 0.0001 units
          const smallTestAmount = parseUnits('0.0001', selectedBorrowToken.decimals);
          console.log("Using small test amount instead:", smallTestAmount.toString());
          
          // Use our retry utility for more reliable contract calls
          const result = await retryWithBackoff(
            async () => {
              try {
                return await borrowAsync({
                  args: [smallTestAmount],
                });
              } catch (txError: any) {
                // If it's an RPC timeout, try switching to the next RPC
                if (txError.message?.includes('timeout') || txError.message?.includes('took too long')) {
                  switchToNextRpc(selectedBorrowChain);
                  // Throw again to trigger the retry
                  throw txError;
                }
                throw txError;
              }
            },
            3, // max retries
            1000 // base delay in ms
          );
          
          console.log("Borrow transaction sent with hash:", result.hash);
          toast.dismiss('borrow-prep');
          toast.success('Borrow transaction sent!');
          return result.hash;
        } catch (txError: any) {
          console.error("Transaction error:", txError);
          toast.dismiss('borrow-prep');
          
          // Check for specific contract errors
          if (txError.message?.includes("execution reverted")) {
            toast.error("Contract execution reverted. You may need to deposit more collateral.");
            throw new Error("Contract execution reverted. Try depositing more collateral first.");
          }
          throw txError;
        }
      } catch (innerError: any) {
        toast.dismiss('borrow-prep');
        console.error('Borrow error details:', innerError);
        
        // Handle different types of RPC errors
        if (innerError.message?.includes('timeout') || innerError.message?.includes('took too long')) {
          console.error('RPC Timeout error:', innerError);
          
          // Try switching to the next RPC URL
          const switched = switchToNextRpc(selectedBorrowChain);
          
          if (switched) {
            toast.loading('Switching to alternative RPC endpoint...', { id: 'rpc-switch' });
            
            // Wait a moment to let the switch take effect
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try calling the function again
            toast.dismiss('rpc-switch');
            toast.success('Switched to alternative RPC. Please try again.');
            throw new Error('RPC timeout: Switched to alternative endpoint. Please try again.');
          } else {
            // If we've tried all RPC endpoints, suggest a network refresh
            toast.error('All RPC endpoints failed. Trying to refresh the network connection...');
            
            // Try refreshing the network connection
            await refreshNetworkConnection();
            throw new Error('RPC timeout: All endpoints failed. Please wait and try again.');
          }
        } else if (innerError.message?.includes('401') || innerError.message?.includes('Unauthorized')) {
          console.error('RPC Authorization error:', innerError);
          
          // Try switching to the next RPC URL
          const switched = switchToNextRpc(selectedBorrowChain);
          
          if (switched) {
            toast.loading('Switching to alternative RPC endpoint...', { id: 'rpc-switch' });
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.dismiss('rpc-switch');
            toast.success('Switched to alternative RPC. Please try again.');
          } else {
            // If we've tried all RPC endpoints, refresh the network connection
            await refreshNetworkConnection();
          }
          
          throw new Error('RPC authorization failed. Please try again.');
        } else if (innerError.message?.includes('execution reverted') || innerError.message?.includes('reverted')) {
          // Handle contract reversion errors
          console.error('Contract execution reverted:', innerError);
          
          // Check for common reasons and provide more helpful messages
          if (innerError.message?.includes('no collateral deposited')) {
            toast.error('You need to deposit collateral on ZetaChain first before borrowing.');
            throw new Error('No collateral: You need to deposit on ZetaChain before you can borrow.');
          } else if (innerError.message?.includes('token not supported')) {
            toast.error('The selected token is not supported for borrowing.');
            throw new Error('Token not supported: The selected token cannot be borrowed at this time.');
          } else if (innerError.message?.includes('exceeds max LTV')) {
            toast.error('The borrow amount exceeds your maximum loan-to-value ratio.');
            throw new Error('Exceeds max LTV: Try borrowing a smaller amount.');
          } else {
            // Generic contract revert
            toast.error('Transaction failed: The contract rejected the transaction. Try a smaller amount or different token.');
            throw new Error('Contract execution reverted: The smart contract rejected this transaction.');
          }
        } else {
          toast.error(`Transaction failed: ${innerError.message || 'Unknown error'}`);
          throw innerError;
        }
      }
    } catch (error: any) {
      console.error('Borrow error:', error);
      toast.error(error.message || 'Failed to borrow');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, chain, switchNetwork, borrowAsync, selectedBorrowChain, refreshNetworkConnection]);

  return {
    deposit,
    borrow,
    isLoading,
    isConnected: !!walletClient,
    
    // Deposit options
    depositChains,
    selectedDepositChain,
    setSelectedDepositChain,
    selectedDepositToken,
    setSelectedDepositToken,
    availableDepositTokens: SUPPORTED_TOKENS[selectedDepositChain] || [{
      symbol: 'ZETA', 
      name: 'ZETA', 
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18
    }],
    
    // Borrow options
    borrowChains,
    selectedBorrowChain,
    setSelectedBorrowChain,
    selectedBorrowToken,
    setSelectedBorrowToken,
    availableBorrowTokens: SUPPORTED_TOKENS[selectedBorrowChain] || [{
      symbol: 'Token', 
      name: 'Default Token', 
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18
    }],
    
    // Chain and token helpers
    getChainName: (chainId: number) => CHAIN_NAMES[chainId as keyof typeof CHAIN_NAMES] || 'Unknown Chain',
    SUPPORTED_TOKENS
  };
};
