// Script to check a user's loans on ZetaChain
const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  // Get address from command line
  if (process.argv.length < 3) {
    console.error("Please provide your wallet address as an argument");
    console.error("Usage: npx hardhat run scripts/check-loans.js --network zetachain_testnet 0xYourWalletAddress");
    process.exit(1);
  }
  
  const address = process.argv[2];
  
  console.log("Checking loans for address:", address);
  
  // Connect to ZetaChain testnet
  const provider = new ethers.providers.JsonRpcProvider("https://zetachain-athens-evm.blockpi.network/v1/rpc/public");
  
  // Load contract ABI from artifacts
  const ZetaLendArtifact = require("../artifacts/contracts/ZetaLend.sol/ZetaLend.json");
  const contractAddress = "0x9cDD62eF8D13CE58826b2Ec49c227Fa23c8Ad92f";
  
  // Create contract instance
  const contract = new ethers.Contract(contractAddress, ZetaLendArtifact.abi, provider);
  
  try {
    // Get user loans
    const loans = await contract.getUserLoans(address);
    
    console.log(`Found ${loans.length} loan entries for ${address}`);
    
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
    
    if (activeLoans.length > 0) {
      console.log("User has deposited collateral and can borrow");
    } else {
      console.log("User has NOT deposited any collateral");
    }
    
  } catch (error) {
    console.error("Error fetching loans:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
