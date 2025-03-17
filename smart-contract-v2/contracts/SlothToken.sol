// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SlothToken is ERC20, Ownable {
    constructor(string memory _name, string memory _symbol, uint112 _totalSupply) ERC20(_name, _symbol) Ownable(msg.sender) {
        _mint(msg.sender, _totalSupply);
    }

    // To prevent LP pricing manipulations
    function _update(address from, address to, uint256 amount) internal virtual override {
        super._update(from, to, amount);
        address sloth = owner();
        if (sloth != address(0)) {
            require(from == sloth || to == sloth || from == address(0), "Sloth: CANNOT_TRANSFER_YET");
        }
    }
}