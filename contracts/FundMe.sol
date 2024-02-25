// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error FundMe__NotOwner();

/**
 * @title A contract for crowd funding.
 * @author Partic Collins.
 * @notice This contract is to demo a sample funding contract.
 * @dev This implements price feeds as our library.
 */
contract FundMe {
    using PriceConverter for uint256;
    uint256 public constant MINMUM_USD = 50 * 1e18;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountRefunded;
    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable { 
        fund();
    }

    fallback() external payable { 
        fund();
    }

    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) > MINMUM_USD, "Didn't send enough!");
        s_funders.push(msg.sender);
        s_addressToAmountRefunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint funderIndex = 0; funderIndex < s_funders.length; funderIndex++) {
            address funder = s_funders[funderIndex];
            s_addressToAmountRefunded[funder] = 0;
        }

        s_funders = new address[](0);
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Failed!");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        for (uint funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            s_addressToAmountRefunded[funder] = 0;
        }

        s_funders = new address[](0);
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Failed!");
    }

    function getOwner() public view returns(address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns(address) {
        return s_funders[index];
    }

    function getAddressToAmountRefunded(address funder) public view returns(uint256) {
        return s_addressToAmountRefunded[funder];
    }

    function getPriceFeed() public view returns(AggregatorV3Interface) {
        return s_priceFeed;
    }
}