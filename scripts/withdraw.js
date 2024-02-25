const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const { deployer } = await ethers.provider.getSigner();
    const fundMe = await ethers.getContractAt(
        "FundMe",
        (
            await deployments.get("FundMe")
        ).address,
        deployer
    );
    console.log("Withdraw Contract...");
    const transactionResponse = await fundMe.withdraw();
    await transactionResponse.wait(1);
    console.log("Withdrawed!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
