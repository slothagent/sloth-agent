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
    event PreTransferCheck(address buyer, uint256 amount, uint256 contractBalance);
    event TransferAttempt(address buyer, uint256 amount);
    event TransferSuccess(address buyer, uint256 amount);

    constructor(
        address _token,
        uint256 _slope,
        uint256 _basePrice
    ) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        require(_slope > 0, "Slope must be positive");
        require(_basePrice > 0, "Base price must be positive");
        
        token = IERC20(_token);
        // Slope determines how quickly price increases with supply
        slope = _slope;
        // Base price is the minimum price of the token
        basePrice = _basePrice;
    }

    /**
     * @dev Calculate the price for a given amount of tokens
     * @param amount Amount of tokens
     * @return price Price in wei
     */
    function calculatePrice(uint256 amount) public view returns (uint256) {
        uint256 supply = totalSupply;
        
        // For initial purchases or when supply is very low, use base price
        if (supply == 0 || (slope * supply) / PRECISION < basePrice / 100) {
            // Simple multiplication of amount with base price
            return (amount * basePrice) / PRECISION;
        }
        
        // Calculate price using square root formula for more gradual increase
        // Total price = amount * (basePrice + slope * sqrt(current_supply))
        uint256 sqrtSupply = Math.sqrt(supply * PRECISION);
        uint256 currentPrice = basePrice + (slope * sqrtSupply) / PRECISION;
        return (amount * currentPrice) / PRECISION;
    }

    /**
     * @dev Buy tokens using ETH
     * @param minTokens Minimum amount of tokens to receive
     * @param buyer Address of the token buyer
     */
    function buy(uint256 minTokens, address buyer) external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        require(minTokens > 0, "Amount must be positive");
        require(buyer != address(0), "Invalid buyer address");
        
        uint256 price = calculatePrice(minTokens);
        require(msg.value >= price, "Insufficient payment");
        
        // Check token balance before transfer
        uint256 contractBalance = token.balanceOf(address(this));
        require(contractBalance >= minTokens, "Insufficient token balance");

        // Emit pre-transfer check event
        emit PreTransferCheck(buyer, minTokens, contractBalance);

        // Emit transfer attempt event
        emit TransferAttempt(buyer, minTokens);

        // Transfer tokens to buyer using safeTransfer
        token.safeTransfer(buyer, minTokens);
        
        // Emit transfer success event
        emit TransferSuccess(buyer, minTokens);
        
        // Update total supply after transfer
        totalSupply += minTokens;
        
        // Emit event before refund to ensure correct payment amount
        emit Buy(buyer, minTokens, price);
        
        // Refund excess ETH if any
        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool success, ) = msg.sender.call{value: excess}("");
            require(success, "ETH refund failed");
        }
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
        // P = slope * totalSupply + basePrice
        return (slope * totalSupply) / PRECISION + basePrice;
    }

    /**
     * @dev Calculate how many tokens can be bought with a specific amount of ETH
     * @param ethAmount Amount of ETH in wei
     * @return tokenAmount Approximate number of tokens that can be bought
     */
    function calculateTokensForEth(uint256 ethAmount) public view returns (uint256) {
        uint256 supply = totalSupply;
        
        // For initial purchases or when supply is very low, use simple division
        if (supply == 0 || (slope * supply) / PRECISION < basePrice / 100) {
            // Simple division of ETH amount by base price
            return (ethAmount * PRECISION) / basePrice;
        }
        
        // Calculate current price per token
        uint256 currentPrice = basePrice + (slope * supply) / PRECISION;
        
        // Calculate tokens = ETH amount / current price
        return (ethAmount * PRECISION) / currentPrice;
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
     * @return Total market cap in wei
     */
    function getTotalMarketCap() external view returns (uint256) {
        if (totalSupply == 0) return 0;
        
        // Market cap = current price * total supply
        uint256 currentPrice = (slope * totalSupply) / PRECISION + basePrice;
        return (currentPrice * totalSupply) / PRECISION;
    }

    /**
     * @dev Test function to simulate price changes after multiple buys
     * @param amount Amount of tokens for each buy
     * @param numBuys Number of buys to simulate
     * @return prices Array of prices for each buy
     */
    function simulatePrices(uint256 amount, uint256 numBuys) external view returns (uint256[] memory) {
        uint256[] memory prices = new uint256[](numBuys);
        uint256 simulatedSupply = totalSupply;
        
        for(uint256 i = 0; i < numBuys; i++) {
            if (simulatedSupply == 0 || (slope * simulatedSupply) / PRECISION < basePrice / 100) {
                prices[i] = (amount * basePrice) / PRECISION;
            } else {
                uint256 currentPrice = basePrice + (slope * simulatedSupply) / PRECISION;
                prices[i] = (amount * currentPrice) / PRECISION;
            }
            simulatedSupply += amount;
        }
        
        return prices;
    }

    // Function to receive ETH
    receive() external payable {}
} 