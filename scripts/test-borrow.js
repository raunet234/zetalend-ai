// Script to test borrowing on ZetaChain
const { ethers } = require("hardhat");
require('dotenv').config();

// Helper function to handle BigInts for console output
const formatBigNumberOutput = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(formatBigNumberOutput);
  if (typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      result[key] = formatBigNumberOutput(obj[key]);
    }
    return result;
  }
  return obj;
};

async function main() {
  // Get address from command line
  if (process.argv.length < 3) {
    console.error("Please provide your wallet address as an argument");
    console.error("Usage: npx hardhat run scripts/test-borrow.js --network zetachain_testnet 0xYourWalletAddress");
    process.exit(1);
  }

  const walletAddress = process.argv[2];
  console.log("Testing borrow function for address:", walletAddress);
  
  // Load private key from .env file
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("Please set PRIVATE_KEY in .env file");
    process.exit(1);
  }
  
  // Connect to ZetaChain testnet with signer
  const provider = new ethers.providers.JsonRpcProvider("https://zetachain-athens-evm.blockpi.network/v1/rpc/public");
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Load contract ABI and address
  const ZetaLendArtifact = require("../artifacts/contracts/ZetaLend.sol/ZetaLend.json");
  const contractAddress = "0x9cDD62eF8D13CE58826b2Ec49c227Fa23c8Ad92f";
  
  // Create contract instance with signer
  const contract = new ethers.Contract(contractAddress, ZetaLendArtifact.abi, wallet);
  
  try {
    // First check if the user has any loans
    const loans = await contract.getUserLoans(walletAddress);
    
    console.log(`Found ${loans.length} loan entries for ${walletAddress}`);
    
    // Display each loan
    loans.forEach((loan, index) => {
      console.log(`\nLoan #${index} details:`);
      console.log(`- Active: ${loan.active}`);
      console.log(`- Collateral Amount: ${ethers.utils.formatEther(loan.collateralAmount)} ETH`);
      console.log(`- Collateral Token: ${loan.collateralToken}`);
      console.log(`- Borrowed Amount: ${ethers.utils.formatEther(loan.borrowedAmount)} ETH`);
      console.log(`- Borrowed Token: ${loan.borrowedToken}`);
      console.log(`- Timestamp: ${new Date(loan.timestamp.toNumber() * 1000).toISOString()}`);
    });
    
    // Calculate collateral
    const activeLoans = loans.filter(loan => 
      loan.active && loan.collateralAmount.gt(0)
    );
    
    console.log(`\nActive loans with collateral: ${activeLoans.length}`);
    
    if (activeLoans.length === 0) {
      console.log("No active loans with collateral found. Attempting to deposit 0.01 ETH first...");
      
      // Make a deposit first
      const tx1 = await contract.deposit({ value: ethers.utils.parseEther("0.01") });
      console.log("Deposit transaction sent:", tx1.hash);
      await tx1.wait();
      console.log("Deposit confirmed!");
    }
    
    // Now try to borrow a very small amount (0.0001 ETH)
    console.log("\nAttempting to borrow 0.0001 ETH...");
    const borrowAmount = ethers.utils.parseEther("0.0001");
    const tx2 = await contract.borrow(borrowAmount);
    
    console.log("Borrow transaction sent:", tx2.hash);
    await tx2.wait();
    console.log("Borrow transaction confirmed!");
    
    // Verify the loan was updated
    const updatedLoans = await contract.getUserLoans(walletAddress);
    const lastLoan = updatedLoans[updatedLoans.length - 1];
    
    console.log("\nUpdated loan details:");
    console.log(`- Active: ${lastLoan.active}`);
    console.log(`- Collateral Amount: ${ethers.utils.formatEther(lastLoan.collateralAmount)} ETH`);
    console.log(`- Borrowed Amount: ${ethers.utils.formatEther(lastLoan.borrowedAmount)} ETH`);
    
  } catch (error) {
    console.error("Error during borrow test:", error);
    // Print more detailed error information
    if (error.error) {
      console.error("Contract error details:", error.error);
    }
    if (error.transaction) {
      console.error("Transaction data:", error.transaction);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
