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
    console.log("Funding Contract...");
    const transactionResponse = await fundMe.fund({
        value: ethers.parseEther("1"),
    });
    await transactionResponse.wait(1);
    console.log("Funded!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
