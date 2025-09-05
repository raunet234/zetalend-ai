// Script to directly check a wallet's balance and deposit status on ZetaLend
const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  const walletAddress = "0x6D5EE220E17C9cF3c48b9eaDefC17Bc5449365D9";
  console.log("Checking wallet:", walletAddress);

  // Connect to ZetaChain testnet
  const provider = new ethers.providers.JsonRpcProvider("https://zetachain-athens-evm.blockpi.network/v1/rpc/public");
  
  // Get balance
  const balance = await provider.getBalance(walletAddress);
  console.log(`\nWallet balance: ${ethers.utils.formatEther(balance)} ZETA`);

  // Load contract
  const ZetaLendArtifact = require("../artifacts/contracts/ZetaLend.sol/ZetaLend.json");
  const contractAddress = "0x9cDD62eF8D13CE58826b2Ec49c227Fa23c8Ad92f"; 
  const contract = new ethers.Contract(contractAddress, ZetaLendArtifact.abi, provider);

  try {
    // Check user loans
    console.log("\nChecking loans data...");
    const loans = await contract.getUserLoans(walletAddress);
    
    console.log(`Found ${loans.length} loan entries`);
    
    // Display loan details safely
    for (let i = 0; i < loans.length; i++) {
      const loan = loans[i];
      console.log(`\nLoan #${i}:`);
      console.log(`- Active: ${loan.active}`);
      console.log(`- Collateral Amount: ${ethers.utils.formatEther(loan.collateralAmount)} ETH`);
      console.log(`- Borrowed Amount: ${ethers.utils.formatEther(loan.borrowedAmount)} ETH`);
      console.log(`- Timestamp: ${new Date(loan.timestamp.toNumber() * 1000).toLocaleString()}`);
    }
    
    // Check if there's valid collateral
    const hasCollateral = loans.some(loan => 
      loan.active && loan.collateralAmount.gt(ethers.BigNumber.from(0))
    );
    
    console.log(`\nHas valid collateral: ${hasCollateral}`);
    
    if (hasCollateral) {
      console.log("\n✅ USER HAS DEPOSITED COLLATERAL AND SHOULD BE ABLE TO BORROW");
      
      // Calculate max borrow amount (75% of collateral based on contract MAX_LTV)
      const activeLoans = loans.filter(loan => loan.active);
      if (activeLoans.length > 0) {
        const lastLoan = activeLoans[activeLoans.length - 1];
        const maxBorrow = lastLoan.collateralAmount.mul(75).div(100); // 75% LTV
        console.log(`Maximum borrowable amount: ${ethers.utils.formatEther(maxBorrow)} ETH`);
      }
    } else {
      console.log("\n❌ NO ACTIVE COLLATERAL FOUND");
    }
    
  } catch (error) {
    console.error("Error checking loans:", error);
  }
  
  // Check contract balance
  const contractBalance = await provider.getBalance(contractAddress);
  console.log(`\nContract balance: ${ethers.utils.formatEther(contractBalance)} ZETA`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
