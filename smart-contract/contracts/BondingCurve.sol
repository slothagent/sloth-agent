// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title BondingCurve
 * @dev Implementation of a bonding curve for token pricing and liquidity
 * Modified to handle very small initial prices
 */
contract BondingCurve is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // State variables
    IERC20 public token;  // Token being traded
    uint256 public constant PRECISION = 1e18;  // Standard precision
    uint256 public slope;  // Slope of the bonding curve
    uint256 public basePrice;  // Base price for the token
    uint256 public totalSupply;  // Current supply in the bonding curve
    
    // Events
    event Buy(address indexed buyer, uint256 tokenAmount, uint256 paymentAmount);
    event Sell(address indexed seller, uint256 tokenAmount, uint256 paymentAmount);
    event SlopeUpdated(uint256 newSlope);
    event BasePriceUpdated(uint256 newBasePrice);

    constructor(
        address _token,
        uint256 _slope,
        uint256 _basePrice
    ) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        require(_slope > 0, "Slope must be positive");
        require(_basePrice > 0, "Base price must be positive");
        
        token = IERC20(_token);
        // Slope determines how quickly price changes with supply
        slope = 1e15;  // 0.001 * PRECISION - gentle slope
        // Base price 0.000000001 ETH (1 Gwei)
        basePrice = 1e9;
    }

    /**
     * @dev Calculate the price for a given amount of tokens
     * @param amount Amount of tokens
     * @return price Price in wei
     */
    function calculatePrice(uint256 amount) public view returns (uint256) {
        uint256 supply = totalSupply;
        
        // Price increases quadratically with supply
        // P(s) = slope * s^2 + basePrice
        uint256 startPrice = (slope * supply * supply) / PRECISION + basePrice;
        uint256 endPrice = (slope * (supply + amount) * (supply + amount)) / PRECISION + basePrice;
        
        // Average price over the range
        uint256 averagePrice = (startPrice + endPrice) / 2;
        
        // Total cost is average price * amount
        return (averagePrice * amount) / PRECISION;
    }

    /**
     * @dev Buy tokens using ETH
     * @param minTokens Minimum amount of tokens to receive
     */
    function buy(uint256 minTokens) external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        require(minTokens > 0, "Amount must be positive");
        
        uint256 price = calculatePrice(minTokens);
        require(msg.value >= price, "Insufficient payment");
        
        // Transfer tokens to buyer
        token.safeTransfer(msg.sender, minTokens);
        totalSupply += minTokens;
        
        // Refund excess ETH if any
        if (msg.value > price) {
            (bool success, ) = msg.sender.call{value: msg.value - price}("");
            require(success, "ETH refund failed");
        }
        
        emit Buy(msg.sender, minTokens, price);
    }

    /**
     * @dev Sell tokens back to the contract
     * @param tokenAmount Amount of tokens to sell
     * @param minEth Minimum ETH to receive
     */
    function sell(uint256 tokenAmount, uint256 minEth) external nonReentrant {
        require(tokenAmount > 0, "Amount must be positive");
        
        uint256 price = calculatePrice(tokenAmount);
        require(price >= minEth, "Price below minimum");
        require(address(this).balance >= price, "Insufficient contract balance");
        
        // Transfer tokens from seller
        token.safeTransferFrom(msg.sender, address(this), tokenAmount);
        totalSupply -= tokenAmount;
        
        // Transfer ETH to seller
        (bool success, ) = msg.sender.call{value: price}("");
        require(success, "ETH transfer failed");
        
        emit Sell(msg.sender, tokenAmount, price);
    }

    /**
     * @dev Get current token price per unit
     * @return Current price in wei
     */
    function getCurrentPrice() external view returns (uint256) {
        // P = slope * totalSupply^2 + basePrice
        uint256 quadraticComponent = (slope * totalSupply * totalSupply) / PRECISION;
        return quadraticComponent + basePrice;
    }

    /**
     * @dev Update the slope of the bonding curve
     * @param newSlope New slope value
     */
    function updateSlope(uint256 newSlope) external onlyOwner {
        require(newSlope > 0, "Slope must be positive");
        slope = newSlope;
        emit SlopeUpdated(newSlope);
    }

    /**
     * @dev Update the base price
     * @param newBasePrice New base price value
     */
    function updateBasePrice(uint256 newBasePrice) external onlyOwner {
        require(newBasePrice > 0, "Base price must be positive");
        basePrice = newBasePrice;
        emit BasePriceUpdated(newBasePrice);
    }

    /**
     * @dev Get total market capitalization in ETH
     * @return Total market cap in wei (current_price * total_supply)
     */
    function getTotalMarketCap() external view returns (uint256) {
        if (totalSupply == 0) return 0;
        
        // Current price = slope * totalSupply^2 + basePrice
        uint256 currentPrice = (slope * totalSupply * totalSupply) / PRECISION + basePrice;
        
        // Market cap = current price * total supply
        return (currentPrice * totalSupply) / PRECISION;
    }

    // Function to receive ETH
    receive() external payable {}
} 