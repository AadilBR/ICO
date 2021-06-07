//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IToken.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title InitialCoinOffering ICO for Token "TT"
 * @author Aadil
 * @notice This contract is deployed with an ERC20 contract.
 * Tokens and Ethers are blocked in the contract during 2 weeks.
 * */
contract ICO is Ownable {
    using Address for address payable;

    IToken private _token;
    uint256 private _endOfIco;
    uint256 private _supplyInSale;

    constructor(address tokenAddress) {
        _token = IToken(tokenAddress);
        require(_token.balanceOf(_token.owner()) == 1000000 * 10**18, "ICO: The owner must have token TT to exchange");
        _endOfIco = block.timestamp + 2 weeks;
    }

    event Bought(address indexed buyer, uint256 amount);
    event Withdrew(address indexed owner_, uint256 amount);

    /**
     * @dev Used to receive ether directly send from a transaction
     * */
    receive() external payable {
        _buyToken(msg.sender, msg.value);
    }

    /**
     * @dev Used by the owner of the Token contract, the owner can withdraw
     * all the ethers sent by the buyers in the ICO contract.
     * But, he have to wait the end of the ICO period (2 weeks)
     */

    function withdraw() public onlyOwner {
        require(
            block.timestamp > _endOfIco,
            "ICO : you have to wait 2 weeks from the deployement of this smartContract the ICO is still running."
        );
        uint256 gain = address(this).balance;
        payable(msg.sender).sendValue(address(this).balance);
        emit Withdrew(msg.sender, gain);
    }

    /**
     * @dev Used to buy erc20 Token "TT" using ether
     */
    function buyTokens() public payable {
        _buyToken(msg.sender, msg.value);
    }

    /**
     * @return Address of Token "TT" contract
     */
    function tokenContract() public view returns (address) {
        return address(_token);
    }

    /**
     * @return Total of the supply in sale
     */
    function supplyInSale() public view returns (uint256) {
        return _supplyInSale;
    }

    /**
     * @return Total Ether value in this ICO contract
     */
    function ICOBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @return Number of token "TT" sold by this ICO
     */
    function tokenSold() public view returns (uint256) {
        return ConvertGweiToToken(ICOBalance()) / 10**18;
    }

    /**
     * @dev Exchange rate 1 gwei = 1 token "TT"
     * @param amount in Ether
     * @return Value in "TT"
     */
    function ConvertGweiToToken(uint256 amount) public pure returns (uint256) {
        return amount * 10**9;
    }

    /**
     * @dev This function allows the ICO contract to give in exchange of ethers TokenToken TT to buyers
     * If the last buyer send more ethers than this contract can sell, he got the difference refund.
     * @param sender the buyer
     * @param amount in ether
     */
    function _buyToken(address sender, uint256 amount) private {
        require(msg.sender != _token.owner(), "ICO: owner cannot buy his tokens");
        require(block.timestamp < _endOfIco, "ICO: Sorry ! The ICO is over, you can no longer buy token");
        uint256 allowance = _token.allowance(_token.owner(), address(this));
        require(allowance > 0, "ICO: has not been approved yet or all token are already sold");
        uint256 token = ConvertGweiToToken(amount);
        if (token > allowance) {
            uint256 rest = token - allowance;
            token -= rest;
            payable(sender).sendValue(rest / 10**9);
        }
        _token.transferFrom(_token.owner(), sender, token);
        emit Bought(sender, amount);
    }
}
