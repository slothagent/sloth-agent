// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface ISlothMetaTransaction {
    struct MetaTransaction {
        uint256 nonce;
        address from;
        bytes functionSignature;
        uint256 deadline;
    }

    struct BuyParams {
        uint256 nativeAmount;
        address to;
        uint256 deadline;
    }

    struct SellParams {
        uint256 tokenAmount;
        address to;
        uint256 deadline;
    }

    event MetaTransactionExecuted(
        address indexed from,
        address indexed to,
        bytes functionSignature,
        bytes result
    );

    function executeMetaTransaction(
        address userAddress,
        bytes memory functionSignature,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV,
        uint256 deadline
    ) external payable returns (bytes memory);

    function getNonce(address user) external view returns (uint256 nonce);
    
    function getDomainSeparator() external view returns (bytes32);
    
    function getChainId() external view returns (uint256);
} 