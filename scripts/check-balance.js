const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deployer address:", deployer.address);
  console.log("Current balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ZETA");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
