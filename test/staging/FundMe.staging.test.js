const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe;
          let deployer;
          let sendValue;

          beforeEach(async function () {
              // deploy our fundme contract
              // using hardhat deploy
              // const accounts = await ethers.getSigners()
              deployer = await ethers.provider.getSigner();
              fundMe = await ethers.getContractAt(
                  "FundMe",
                  (
                      await deployments.get("FundMe")
                  ).address,
                  deployer
              ); // most recently deployed fundme contract
              sendValue = ethers.parseEther("0.05");
          });

          it("allows people to fund and withdraw", async function() {
            await fundMe.fund({ value: sendValue })
            await fundMe.withdraw()
            const endingBalance = await ethers.provider.getBalance(await fundMe.getAddress())
            assert.equal(endingBalance.toString(), 0)
          })
      });
