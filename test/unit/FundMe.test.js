const { assert, expect } = require("chai");
const { deployments, getNamedAccounts, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name) ?
describe("FundMe", async function () {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    let sendValue;

    beforeEach(async function () {
        // deploy our fundme contract
        // using hardhat deploy
        // const accounts = await ethers.getSigners()
        deployer = await ethers.provider.getSigner();
        await deployments.fixture(["all"]); // deploy with tags
        fundMe = await ethers.getContractAt(
            "FundMe",
            (
                await deployments.get("FundMe")
            ).address,
            deployer
        ); // most recently deployed fundme contract
        mockV3Aggregator = await ethers.getContractAt(
            "MockV3Aggregator",
            (
                await deployments.get("MockV3Aggregator")
            ).address,
            deployer
        );
        sendValue = ethers.parseEther("1");
    });

    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.getPriceFeed();
            assert.equal(response, await mockV3Aggregator.getAddress());
        });
    });

    describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.reverted;
        });

        it("updated the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.getAddressToAmountRefunded(deployer);

            assert.equal(response.toString(), sendValue.toString());
        });

        it("Add funder to array of funders", async function () {
            await fundMe.fund({ value: sendValue });
            const funder = await fundMe.getFunder(0);
            assert.equal(funder, await deployer.getAddress());
        });
    });

    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue });
        });

        it("Withdraw ETH from a single founder", async function () {
            // Arrange
            const startingFundMeBalance = await ethers.provider.getBalance(
                await fundMe.getAddress()
            );

            const startingDeployerBalance = await ethers.provider.getBalance(
                await deployer.getAddress()
            );

            // Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            const endFundMeBalance = await ethers.provider.getBalance(
                await fundMe.getAddress()
            );

            const endDeployerBalance = await ethers.provider.getBalance(
                await deployer.getAddress()
            );

            const { gasUsed, gasPrice } = transactionReceipt;

            const gasCost = gasPrice * gasUsed;

            // assert
            assert.equal(endFundMeBalance, 0);
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endDeployerBalance + gasCost).toString()
            );
        });

        it("cheaperWithdraw ETH from a single founder", async function () {
            // Arrange
            const startingFundMeBalance = await ethers.provider.getBalance(
                await fundMe.getAddress()
            );

            const startingDeployerBalance = await ethers.provider.getBalance(
                await deployer.getAddress()
            );

            // Act
            const transactionResponse = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            const endFundMeBalance = await ethers.provider.getBalance(
                await fundMe.getAddress()
            );

            const endDeployerBalance = await ethers.provider.getBalance(
                await deployer.getAddress()
            );

            const { gasUsed, gasPrice } = transactionReceipt;

            const gasCost = gasPrice * gasUsed;

            // assert
            assert.equal(endFundMeBalance, 0);
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endDeployerBalance + gasCost).toString()
            );
        });

        it("Allow us to withdraw with multiple getFunder", async function () {
            // Arrange
            const accounts = await ethers.getSigners();
            for (let i = 0; i < accounts.length; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                );
                await fundMeConnectedContract.fund({ value: sendValue });
            }

            const startingFundMeBalance = await ethers.provider.getBalance(
                await fundMe.getAddress()
            );

            const startingDeployerBalance = await ethers.provider.getBalance(
                await deployer.getAddress()
            );

            // Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            const endFundMeBalance = await ethers.provider.getBalance(
                await fundMe.getAddress()
            );

            const endDeployerBalance = await ethers.provider.getBalance(
                await deployer.getAddress()
            );

            const { gasUsed, gasPrice } = transactionReceipt;

            const gasCost = gasPrice * gasUsed;

            // assert
            assert.equal(endFundMeBalance, 0);
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endDeployerBalance + gasCost).toString()
            );

            await expect(fundMe.getFunder(0)).to.be.reverted;

            for (let i = 0; i < accounts.length; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountRefunded(
                        await accounts[i].getAddress()
                    ),
                    0
                );
            }
        });

        it("only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const attackerConnectedContract = await fundMe.connect(attacker);
            await expect(attackerConnectedContract.withdraw()).to.be.reverted;
        });

        it("cheaper withdraw testing ...", async function () {
            // Arrange
            const accounts = await ethers.getSigners();
            for (let i = 0; i < accounts.length; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                );
                await fundMeConnectedContract.fund({ value: sendValue });
            }

            const startingFundMeBalance = await ethers.provider.getBalance(
                await fundMe.getAddress()
            );

            const startingDeployerBalance = await ethers.provider.getBalance(
                await deployer.getAddress()
            );

            // Act
            const transactionResponse = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            const endFundMeBalance = await ethers.provider.getBalance(
                await fundMe.getAddress()
            );

            const endDeployerBalance = await ethers.provider.getBalance(
                await deployer.getAddress()
            );

            const { gasUsed, gasPrice } = transactionReceipt;

            const gasCost = gasPrice * gasUsed;

            // assert
            assert.equal(endFundMeBalance, 0);
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endDeployerBalance + gasCost).toString()
            );

            await expect(fundMe.getFunder(0)).to.be.reverted;

            for (let i = 0; i < accounts.length; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountRefunded(
                        await accounts[i].getAddress()
                    ),
                    0
                );
            }
        });
    });
}) : describe.skip;
