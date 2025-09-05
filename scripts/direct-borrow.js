// Direct borrowing test script
const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const walletAddress = "0x6D5EE220E17C9cF3c48b9eaDefC17Bc5449365D9";
  
  // Get the wallet from the private key in .env
  if (!process.env.PRIVATE_KEY) {
    console.error("PRIVATE_KEY not found in .env file");
    return;
  }
  
  // Connect to ZetaChain testnet using Hardhat's ethers
  const { ethers } = hre;
  // Get the default provider from the Hardhat config
  const [signer] = await ethers.getSigners();
  const wallet = signer;
  
  console.log("Connected with wallet:", wallet.address);
  
  // Check wallet balance
  const balance = await ethers.provider.getBalance(wallet.address);
  console.log(`Wallet balance: ${balance.toString()} wei (${ethers.utils.formatUnits(balance, 18)} ZETA)`);
  
  // Load contract - use the ZetaLend contract from the Hardhat deployment
  const contractAddress = "0x9cDD62eF8D13CE58826b2Ec49c227Fa23c8Ad92f";
  // Get the contract factory
  const ZetaLend = await ethers.getContractFactory("ZetaLend");
  // Connect to the existing contract
  const contract = ZetaLend.attach(contractAddress);
  
  try {
    // First make a deposit to ensure we have collateral
    console.log("\nMaking a deposit of 0.01 ZETA...");
    const depositTx = await contract.deposit({ value: ethers.utils.parseUnits("0.01", 18) });
    console.log("Deposit transaction sent:", depositTx.hash);
    await depositTx.wait();
    console.log("Deposit confirmed!");
    
    // Now try to borrow
    console.log("\nAttempting to borrow 0.0001 ZETA...");
    const borrowAmount = ethers.utils.parseUnits("0.0001", 18);
    const borrowTx = await contract.borrow(borrowAmount);
    console.log("Borrow transaction sent:", borrowTx.hash);
    await borrowTx.wait();
    console.log("Borrow transaction confirmed!");
    
    // Check the updated loans
    console.log("\nChecking updated loans...");
    const loans = await contract.getUserLoans(wallet.address);
    console.log(`Found ${loans.length} loans`);
    
    const lastLoan = loans[loans.length - 1];
    console.log("\nLatest loan details:");
    console.log(`- Active: ${lastLoan.active}`);
    console.log(`- Collateral Amount: ${ethers.utils.formatUnits(lastLoan.collateralAmount, 18)} ZETA`);
    console.log(`- Borrowed Amount: ${ethers.utils.formatUnits(lastLoan.borrowedAmount, 18)} ZETA`);
    
    console.log("\n✅ SUCCESS: Borrow operation completed successfully");
    
  } catch (error) {
    console.error("\n❌ ERROR during operation:", error.message);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.transaction) {
      console.error("Transaction details:", {
        from: error.transaction.from,
        to: error.transaction.to,
        data: error.transaction.data.substring(0, 66) + "..." // Just show the beginning
      });
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Top-level error:", error);
    process.exit(1);
  });
