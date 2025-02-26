// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BondingCurve.sol";
import "./ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Factory
 * @dev Factory contract for creating Continuous Token and Bonding Curve pairs
 * Implements Continuous Organization model with Automated Market Maker
 */
contract Factory is Ownable {
    // Constants
    uint256 public constant DEFAULT_RESERVE_WEIGHT = 500000; // 50% in ppm
    uint256 public constant FIXED_INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant CURVE_ALLOCATION = 800000; // 80% for bonding curve
    uint256 public constant CREATOR_ALLOCATION = 200000; // 20% for creator
    uint256 public constant CREATION_FEE = 1 ether; // Fixed creation fee

    // Mappings for token tracking
    mapping(address => address) public tokenToCurve;
    mapping(address => address) public curveToToken;
    mapping(address => bool) public isTokenRegistered;
    
    // Arrays to store all created tokens and curves
    address[] public allTokens;
    address[] public allCurves;
    
    // Events
    event TokenAndCurveCreated(
        address indexed token,
        address indexed bondingCurve,
        string name,
        string symbol,
        uint256 initialSupply,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create new Continuous Token and its Bonding Curve
     * @param name Token name
     * @param symbol Token symbol
     */
    function createTokenAndCurve(
        string memory name,
        string memory symbol
    ) external payable {
        require(msg.value >= CREATION_FEE, "Insufficient creation fee");

        // Calculate allocations
        uint256 bondingCurveAllocation = (FIXED_INITIAL_SUPPLY * CURVE_ALLOCATION) / 1000000;
        uint256 creatorAllocation = (FIXED_INITIAL_SUPPLY * CREATOR_ALLOCATION) / 1000000;

        // Deploy Continuous Token
        ContractErc20 newToken = new ContractErc20(
            name, 
            symbol,
            FIXED_INITIAL_SUPPLY
        );
        
        // Deploy Bonding Curve (Automated Market Maker)
        BondingCurve newCurve = new BondingCurve(
            address(newToken),
            DEFAULT_RESERVE_WEIGHT,
            bondingCurveAllocation
        );

        // Setup initial allocations
        newToken.approve(address(newCurve), bondingCurveAllocation);
        
        // Transfer 80% to bonding curve
        newToken.transfer(address(newCurve), bondingCurveAllocation);
        
        // Transfer 20% to creator
        newToken.transfer(msg.sender, creatorAllocation);

        // Register token-curve pair
        tokenToCurve[address(newToken)] = address(newCurve);
        curveToToken[address(newCurve)] = address(newToken);
        isTokenRegistered[address(newToken)] = true;

        // Add to tracking arrays
        allTokens.push(address(newToken));
        allCurves.push(address(newCurve));

        // Transfer ownership
        newToken.transferOwnership(msg.sender);
        newCurve.transferOwnership(msg.sender);

        emit TokenAndCurveCreated(
            address(newToken),
            address(newCurve),
            name,
            symbol,
            FIXED_INITIAL_SUPPLY,
            block.timestamp
        );

        // Refund excess ETH
        uint256 excess = msg.value - CREATION_FEE;
        if (excess > 0) {
            (bool success, ) = msg.sender.call{value: excess}("");
            require(success, "ETH refund failed");
        }
    }

    /**
     * @dev Get total number of tokens created
     */
    function getTotalTokens() external view returns (uint256) {
        return allTokens.length;
    }

    /**
     * @dev Get latest created token and curve
     */
    function getLatestToken() external view returns (address token, address curve) {
        require(allTokens.length > 0, "No tokens created");
        token = allTokens[allTokens.length - 1];
        curve = allCurves[allCurves.length - 1];
    }

    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Fee withdrawal failed");
    }

    // Function to receive ETH
    receive() external payable {}
} 