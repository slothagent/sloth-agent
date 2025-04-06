// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract SlothToken is ERC20, ERC20Permit, Ownable {
    bytes32 private constant PERMIT_TYPEHASH = keccak256(
        "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    );

    bytes32 private constant TRANSFER_TYPEHASH = keccak256(
        "Transfer(address from,address to,uint256 amount,uint256 nonce,uint256 deadline)"
    );

    mapping(address => uint256) private _nonces;

    constructor(string memory _name, string memory _symbol, uint112 _totalSupply) 
        ERC20(_name, _symbol) 
        ERC20Permit(_name)
        Ownable(msg.sender) 
    {
        _mint(msg.sender, _totalSupply);
    }

    function transferWithPermit(
        address from,
        address to,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(deadline >= block.timestamp, "Sloth: EXPIRED");
        
        bytes32 structHash = keccak256(abi.encode(
            TRANSFER_TYPEHASH,
            from,
            to,
            amount,
            _useNonce(from),
            deadline
        ));
        
        bytes32 hash = _hashTypedDataV4(structHash);
        
        address signer = ECDSA.recover(hash, v, r, s);
        require(signer == from, "Sloth: INVALID_SIGNATURE");
        
        _transfer(from, to, amount);
    }

    function nonces(address owner) public view virtual override returns (uint256) {
        return _nonces[owner];
    }

    function _useNonce(address owner) internal virtual override returns (uint256 current) {
        current = _nonces[owner];
        _nonces[owner] = current + 1;
    }

    // To prevent LP pricing manipulations
    function _update(address from, address to, uint256 amount) internal virtual override(ERC20) {
        super._update(from, to, amount);
        address sloth = owner();
        if (sloth != address(0)) {
            require(from == sloth || to == sloth || from == address(0), "Sloth: CANNOT_TRANSFER_YET");
        }
    }
}