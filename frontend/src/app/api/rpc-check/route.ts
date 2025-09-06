import { NextResponse } from 'next/server';

// Define type for RPC check results
interface RPCResult {
  url: string;
  status: 'online' | 'offline' | 'error';
  latency?: number;
  blockNumber?: number;
  message?: string;
}

/**
 * API endpoint to check the health of multiple RPC endpoints
 */
export async function GET() {
  // List of RPC endpoints to check
  const rpcEndpoints = [
    'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    'https://zetachain-athens-evm.public.blastapi.io',
    'https://zetachain-athens-evm-rpc.publicnode.com',
    'https://zetachain-athens-evm.gateway.tenderly.co',
    'https://rpc.ankr.com/zetachain_athens'
  ];

  const results: Record<string, RPCResult> = {};
  
  // Check each RPC endpoint
  for (const url of rpcEndpoints) {
    try {
      const name = new URL(url).hostname.split('.')[0]; // Extract provider name from URL
      const startTime = Date.now();
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_blockNumber',
          params: []
        }),
        // Short timeout to quickly identify slow endpoints
        signal: AbortSignal.timeout(3000)
      });

      const endTime = Date.now();
      const data = await response.json();
      
      if (data.result) {
        results[name] = {
          url,
          status: 'online',
          latency: endTime - startTime,
          blockNumber: parseInt(data.result, 16)
        };
      } else {
        results[name] = {
          url,
          status: 'error',
          latency: endTime - startTime,
          message: data.error?.message || 'Unknown error'
        };
      }
    } catch (error: unknown) {
      // Extract provider name from URL
      const name = new URL(url).hostname.split('.')[0];
      results[name] = {
        url,
        status: 'offline',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Find best RPC (online with lowest latency)
  const bestRPC = Object.values(results)
    .filter(rpc => rpc.status === 'online')
    .sort((a, b) => (a.latency || Infinity) - (b.latency || Infinity))[0]?.url || null;
  
  // Return the results
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    rpcs: results,
    bestRPC
  });
}

/**
 * API endpoint to check specific RPC endpoints provided by the client
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoints } = body;
    
    if (!endpoints || !Array.isArray(endpoints)) {
      return NextResponse.json(
        { error: "Invalid request. 'endpoints' array is required." }, 
        { status: 400 }
      );
    }
    
    const results: Record<string, RPCResult> = {};
    
    // Check each RPC endpoint
    for (const url of endpoints) {
      try {
        const name = new URL(url).hostname.split('.')[0]; // Extract provider name from URL
        const startTime = Date.now();
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_blockNumber',
            params: []
          }),
          // Short timeout to quickly identify slow endpoints
          signal: AbortSignal.timeout(3000)
        });

        const endTime = Date.now();
        const data = await response.json();
        
        if (data.result) {
          results[name] = {
            url,
            status: 'online',
            latency: endTime - startTime,
            blockNumber: parseInt(data.result, 16)
          };
        } else {
          results[name] = {
            url,
            status: 'error',
            latency: endTime - startTime,
            message: data.error?.message || 'Unknown error'
          };
        }
      } catch (error: unknown) {
        // Extract provider name from URL
        const name = new URL(url).hostname.split('.')[0];
        results[name] = {
          url,
          status: 'offline',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      rpcs: results
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" }, 
      { status: 500 }
    );
  }
}
