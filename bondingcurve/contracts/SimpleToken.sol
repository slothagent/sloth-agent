// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title SimpleToken
/// @dev ERC20 Token with metadata URI support
/// @notice simple fungible token as test reserve token
contract SimpleToken is ERC20, Ownable {
    string private _tokenURI;
    
    constructor(
        string memory name,
        string memory symbol,
        string memory tokenURI_
    ) ERC20(name, symbol) {
        _tokenURI = tokenURI_;
    }

    /// @notice Get token metadata URI
    function tokenURI() public view returns (string memory) {
        return _tokenURI;
    }

    /// @notice Set token metadata URI
    /// @param newTokenURI New URI for token metadata
    function setTokenURI(string memory newTokenURI) public onlyOwner {
        _tokenURI = newTokenURI;
    }

    /// @notice Mints given amount of tokens for msg.sender
    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}