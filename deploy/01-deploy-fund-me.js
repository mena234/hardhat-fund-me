const { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config");
const { network } = require('hardhat');
const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;

    console.log(ethUsdPriceFeedAddress, chainId, network.name)

    if (developmentChains.includes(network.name)) {
        console.log('run here.')
        const mockV3Aggregator = await get('MockV3Aggregator');
        ethUsdPriceFeedAddress = mockV3Aggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        contract: "FundMe",
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name)) {
        await verify(fundMe.address, args)
    }
};

module.exports.tags = ["all", "fundme"]
