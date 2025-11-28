import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const SkillWager = await hre.ethers.getContractFactory("SkillWager");
  const skillWager = await SkillWager.deploy();

  await skillWager.waitForDeployment();

  console.log("SkillWager deployed to:", await skillWager.getAddress());
  
  // Add deployer as mock juror for testing
  await skillWager.addMockJuror(deployer.address);
  console.log("Added deployer as mock juror");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
