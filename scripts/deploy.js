const hre = require("hardhat");

async function main() {
  // ZetaChain system contract address on Athens testnet
  const SYSTEM_CONTRACT = "0x239e96c8f17C85c30100AC26F635Ea15f23E9c67";

  console.log("Deploying ZetaLend contract...");

  const ZetaLend = await hre.ethers.getContractFactory("ZetaLend");
  const zetaLend = await ZetaLend.deploy(SYSTEM_CONTRACT);

  await zetaLend.waitForDeployment();

  const contractAddress = await zetaLend.getAddress();
  console.log(`ZetaLend deployed to: ${contractAddress}`);

  // Wait for a few block confirmations to ensure the contract is deployed
  console.log("Waiting for confirmations...");

  // Verify the contract on ZetaChain Explorer
  console.log("Verifying contract on ZetaChain Explorer...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [SYSTEM_CONTRACT],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
