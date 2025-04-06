// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ISlothMetaTransaction} from "../interfaces/ISlothMetaTransaction.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

abstract contract SlothMetaTransaction is ISlothMetaTransaction, EIP712 {
    using ECDSA for bytes32;

    bytes32 private constant META_TRANSACTION_TYPEHASH = keccak256(
        "MetaTransaction(uint256 nonce,address from,bytes functionSignature,uint256 deadline)"
    );

    bytes32 private constant BUY_TYPEHASH = keccak256(
        "BuyParams(uint256 nativeAmount,address to,uint256 deadline)"
    );

    bytes32 private constant SELL_TYPEHASH = keccak256(
        "SellParams(uint256 tokenAmount,address to,uint256 deadline)"
    );

    mapping(address => uint256) private nonces;

    constructor(string memory name, string memory version) EIP712(name, version) {}

    function executeMetaTransaction(
        address userAddress,
        bytes memory functionSignature,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV,
        uint256 deadline
    ) public payable virtual override returns (bytes memory) {
        require(block.timestamp <= deadline, "Meta transaction expired");

        MetaTransaction memory metaTx = MetaTransaction({
            nonce: nonces[userAddress]++,
            from: userAddress,
            functionSignature: functionSignature,
            deadline: deadline
        });

        require(
            verify(userAddress, metaTx, sigR, sigS, sigV),
            "Signer and signature do not match"
        );

        (bool success, bytes memory returnData) = address(this).call(
            abi.encodePacked(functionSignature, userAddress)
        );

        require(success, "Function call not successful");

        emit MetaTransactionExecuted(
            userAddress,
            address(this),
            functionSignature,
            returnData
        );

        return returnData;
    }

    function getNonce(address user) public view override returns (uint256) {
        return nonces[user];
    }

    function verify(
        address signer,
        MetaTransaction memory metaTx,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) internal view returns (bool) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    META_TRANSACTION_TYPEHASH,
                    metaTx.nonce,
                    metaTx.from,
                    keccak256(metaTx.functionSignature),
                    metaTx.deadline
                )
            )
        );
        return signer == ECDSA.recover(digest, sigV, sigR, sigS);
    }

    function hashBuyParams(BuyParams memory params) internal view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    BUY_TYPEHASH,
                    params.nativeAmount,
                    params.to,
                    params.deadline
                )
            )
        );
    }

    function hashSellParams(SellParams memory params) internal view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    SELL_TYPEHASH,
                    params.tokenAmount,
                    params.to,
                    params.deadline
                )
            )
        );
    }

    function getDomainSeparator() public view override returns (bytes32) {
        return _domainSeparatorV4();
    }

    function getChainId() public view override returns (uint256) {
        return block.chainid;
    }
} 