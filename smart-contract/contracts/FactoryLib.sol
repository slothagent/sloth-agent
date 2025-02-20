// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library FactoryLib {
    struct TokenInfo {
        string name;
        string symbol;
        address tokenAddress;
        address curveAddress;
        uint256 initialSupply;
        uint256 creationTime;
    }

    function getTokensByRange(
        address[] storage allTokens,
        address[] storage allCurves,
        uint256 start,
        uint256 end
    ) external view returns (address[] memory tokens, address[] memory curves) {
        require(start < end && end <= allTokens.length, "Invalid range");
        
        uint256 size = end - start;
        tokens = new address[](size);
        curves = new address[](size);
        
        for (uint256 i = 0; i < size; i++) {
            tokens[i] = allTokens[start + i];
            curves[i] = allCurves[start + i];
        }
        
        return (tokens, curves);
    }
} 