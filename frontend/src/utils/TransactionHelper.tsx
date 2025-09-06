
/**
 * TransactionHelper.tsx
 * Utility functions for handling blockchain transactions with improved reliability
 */

import { toast } from 'react-hot-toast'; // Using react-hot-toast instead of sonner
import { switchToNextRpc, retryWithBackoff } from './rpc';

/**
 * Execute a transaction with retry logic and user-friendly error handling
 * 
 * @param txFunction - The transaction function to execute
 * @param options - Configuration options
 * @returns Transaction result
 */
export async function executeTransaction<T>(
  txFunction: () => Promise<T>, 
  options: {
    maxRetries?: number;
    errorMessage?: string;
    successMessage?: string;
    onRetry?: () => void;
  } = {}
): Promise<T | null> {
  const {
    maxRetries = 3,
    errorMessage = 'Transaction failed',
    successMessage = 'Transaction successful',
    onRetry = () => {},
  } = options;

  try {
    // Use our retry with backoff utility
    // We'll handle custom retry logic here since our retryWithBackoff doesn't accept a callback
    let result: T | null = null;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Switch RPC endpoint before retry (except on first attempt)
        if (attempt > 0) {
          // Switch RPC for ZetaChain Athens (chain ID 7001)
          switchToNextRpc(7001); // Using the numeric chain ID
          
          // Call the onRetry callback
          onRetry();
          
          console.log(`Retry attempt ${attempt} after error:`, lastError);
        }
        
        result = await txFunction();
        return result; // Success, exit the loop
      } catch (error: any) {
        console.error(`Attempt ${attempt + 1}/${maxRetries} failed:`, error);
        lastError = error;
        
        // If this was our last attempt, don't wait
        if (attempt === maxRetries - 1) break;
        
        // Wait with exponential backoff
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // If we got here, all retries failed
    throw lastError || new Error("Transaction failed after multiple retries");

    // Show success message if provided
    if (successMessage) {
      toast.success(successMessage);
    }
    
    return result;
  } catch (error: any) {
    console.error('Transaction error:', error);

    // Different error handling based on error type
    if (error.message?.includes('user rejected') || error.message?.includes('rejected transaction')) {
      toast.error('Transaction cancelled by user');
    } 
    else if (error.message?.includes('RPC timeout') || error.message?.includes('timed out') || 
             error.message?.includes('network connection')) {
      // RPC timeout specific error
      toast.error(
        'Network connection timed out. Please try again in a moment.',
        { duration: 6000 }
      );
    } 
    else if (error.message?.includes('insufficient funds')) {
      toast.error(
        'Insufficient funds for transaction. Please check your balance.',
        { duration: 5000 }
      );
    }
    else {
      // Generic error message
      toast.error(error.message || errorMessage);
    }
    
    return null;
  }
}

/**
 * Creates a retry button component to show in error toasts
 */
export function RetryButton({ onClick, label = 'Retry with new RPC' }: { onClick: () => void, label?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span>Network connection timed out.</span>
      <button 
        className="bg-blue-600 text-white text-xs py-1 px-2 rounded-md hover:bg-blue-500"
        onClick={onClick}
      >
        {label}
      </button>
    </div>
  );
}
