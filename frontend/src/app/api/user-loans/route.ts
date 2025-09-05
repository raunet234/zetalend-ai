import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, parseEther } from 'viem';
import { ZETALEND_ABI, ZETALEND_ADDRESS } from '@/utils/contracts';
import { SUPPORTED_CHAINS } from '@/utils/chains';

// Create a client for the ZetaChain testnet
const client = createPublicClient({
  chain: {
    id: SUPPORTED_CHAINS.zetachainAthens,
    name: 'ZetaChain Athens',
    network: 'zetachain-athens',
    nativeCurrency: { name: 'ZETA', symbol: 'ZETA', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] },
      public: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] },
    }
  },
  transport: http('https://zetachain-athens-evm.blockpi.network/v1/rpc/public')
});

/**
 * API Route to fetch user's loans from the ZetaLend contract
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    console.log("Checking loans for address:", address);
    console.log("Using contract address:", ZETALEND_ADDRESS);
    
    // Call the getUserLoans function on the contract
    const loans = await client.readContract({
      address: ZETALEND_ADDRESS,
      abi: ZETALEND_ABI,
      functionName: 'getUserLoans',
      args: [address],
    });

    // Don't try to stringify loans directly (BigInt serialization error)
    console.log("Loans data received - processing...");
    
    // Enhanced logging - examine each loan entry in detail
    if (Array.isArray(loans)) {
      console.log(`Found ${loans.length} loan entries`);
      loans.forEach((loan: any, index: number) => {
        console.log(`Loan #${index} details:`);
        console.log(`- Active: ${loan.active}`);
        console.log(`- Collateral Amount: ${loan.collateralAmount.toString()}`);
        console.log(`- Collateral Token: ${loan.collateralToken}`);
        console.log(`- Borrowed Amount: ${loan.borrowedAmount.toString()}`);
        console.log(`- Borrowed Token: ${loan.borrowedToken}`);
        console.log(`- Timestamp: ${loan.timestamp.toString()}`);
      });
    } else {
      console.log("No loans found or unexpected data format");
    }
    
    // Check if any active loans exist with collateral - use toString() for BigInt comparison
    const activeLoans = Array.isArray(loans) ? loans.filter((loan: any) => {
      try {
        console.log(`Checking loan: active=${loan.active}, collateral=${loan.collateralAmount.toString()}`);
        // Use string comparison to avoid BigInt serialization issues
        return loan.active && loan.collateralAmount.toString() !== '0';
      } catch (e) {
        console.error("Error checking loan:", e);
        return false;
      }
    }) : [];
    
    const hasCollateral = activeLoans.length > 0;
    console.log("Has collateral:", hasCollateral, "Number of active loans:", activeLoans.length);

    // Convert BigInts to strings for JSON serialization
    const serializedLoans = Array.isArray(loans) ? loans.map(loan => ({
      active: loan.active,
      collateralAmount: loan.collateralAmount.toString(),
      collateralToken: loan.collateralToken,
      borrowedAmount: loan.borrowedAmount.toString(),
      borrowedToken: loan.borrowedToken,
      timestamp: loan.timestamp.toString()
    })) : [];
    
    return NextResponse.json({ 
      loans: serializedLoans, 
      hasCollateral, 
      activeLoansCount: activeLoans.length,
      contractAddress: ZETALEND_ADDRESS
    });
  } catch (error: any) {
    console.error('Error fetching user loans:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user loans' },
      { status: 500 }
    );
  }
}
