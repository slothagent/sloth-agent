// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

interface IMetropolisFactory {
  function getPair(address tokenA, address tokenB)
    external
    view
    returns (address pair);

  function allPairs(uint256) external view returns (address pair);

  function allPairsLength() external view returns (uint256);

  function createPair(address tokenA, address tokenB)
    external
    returns (address pair);
}