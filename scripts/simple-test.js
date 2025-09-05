// Simple script to check wallet loans
const hre = require("hardhat");

async function main() {
  try {
    console.log("Checking loans for wallet...");
    
    // Get the wallet
    const [wallet] = await hre.ethers.getSigners();
    console.log("Using wallet address:", wallet.address);
    
    // Get ZetaLend contract factory
    const ZetaLend = await hre.ethers.getContractFactory("ZetaLend");
    
    // Connect to existing contract
    const contractAddress = "0x9cDD62eF8D13CE58826b2Ec49c227Fa23c8Ad92f";
    const zetaLend = ZetaLend.attach(contractAddress);
    
    // Get user loans
    const loans = await zetaLend.getUserLoans(wallet.address);
    console.log("Loans retrieved:", loans.length);
    
    // Check each loan
    for (let i = 0; i < loans.length; i++) {
      console.log(`\nLoan #${i}:`);
      console.log("- Active:", loans[i].active);
      console.log("- Collateral Amount:", loans[i].collateralAmount.toString());
      console.log("- Borrowed Amount:", loans[i].borrowedAmount.toString());
    }
    
    // Check if any active loans with collateral
    const hasCollateral = loans.some(loan => 
      loan.active && loan.collateralAmount.toString() !== '0'
    );
    
    console.log("\nHas active collateral:", hasCollateral);
    
    if (hasCollateral) {
      console.log("\nTrying to borrow 0.0001 tokens...");
      const tx = await zetaLend.borrow('100000000000000');
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed!");
    } else {
      console.log("\nDepositing 0.01 tokens first...");
      const tx = await zetaLend.deposit({ value: '10000000000000000' });
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("Deposit confirmed!");
      
      console.log("\nNow trying to borrow 0.0001 tokens...");
      const borrowTx = await zetaLend.borrow('100000000000000');
      console.log("Transaction hash:", borrowTx.hash);
      await borrowTx.wait();
      console.log("Borrow transaction confirmed!");
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Script error:", error);
    process.exit(1);
  });
