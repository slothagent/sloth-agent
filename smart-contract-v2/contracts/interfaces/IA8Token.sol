// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IA8Token is IERC20 {
    function decimals() external view returns (uint8);
} 