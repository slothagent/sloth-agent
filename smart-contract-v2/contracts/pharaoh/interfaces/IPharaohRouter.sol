// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IPharaohRouter {  
   function pairFor(
      address tokenA,
      address tokenB,
      bool stable
    ) external view returns (address pair);
   function factory() external pure returns (address);
   function WETH() external pure returns (address);
   function addLiquidityETH(
      address token,
      bool stable,
      uint256 amountTokenDesired,
      uint256 amountTokenMin,
      uint256 amountETHMin,
      address to,
      uint256 deadline
   )
      external
      payable
      returns (
         uint256 amountToken,
         uint256 amountETH,
         uint256 liquidity
      );
}