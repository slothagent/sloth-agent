// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface ISlothNursery {
    function withdraw(uint256 amount) external;
    function deposit(uint256 amount) external;
    function claimRewards() external;
    function emergencyWithdrawal() external;
    function getCurrentEpoch() external view returns (uint256);
    function getUnpaidEarnings(address owner) external view returns (uint256);
}