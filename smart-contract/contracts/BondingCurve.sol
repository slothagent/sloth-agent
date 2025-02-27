// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title BondingCurve
 * @dev Implementation of Bancor Formula bonding curve for token pricing and liquidity
 */
contract BondingCurve is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // State variables
    IERC20 public token;  // Token being traded
    uint256 public constant PRECISION = 1e18;  // Standard precision
    uint256 public constant MAX_RESERVE_RATIO = 1000000; // 100% in ppm
    uint256 public constant FUNDING_GOAL = 400000 ether; // 400,000 ETH funding goal
    uint256 public constant INITIAL_PRICE = 0.0001 ether; // Initial price: 0.0001 ETH per token
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 1e18; // 1 billion tokens
    uint256 public constant INITIAL_RESERVE = 100000 ether; // Initial reserve of 100,000 ETH
    
    uint256 public reserveWeight; // Reserve weight in ppm (1-1000000)
    uint256 public initialSupply; // Initial token supply (S₀)
    uint256 public totalSupply;  // Current supply in the bonding curve
    uint256 public fundingRaised; // Total funding raised in ETH
    uint256 public reserveBalance; // Current ETH reserve balance
    bool public fundingGoalReached; // Flag to track if funding goal is reached
    uint256 public fundingEndTime; // Timestamp when funding goal was reached

    // Events
    event Buy(address indexed buyer, uint256 tokenAmount, uint256 paymentAmount);
    event Sell(address indexed seller, uint256 tokenAmount, uint256 paymentAmount);
    event FundingRaised(uint256 amount);
    event FundingGoalReached(uint256 timestamp);

    constructor(
        address _token,
        uint256 _reserveWeight,
        uint256 _initialSupply
    ) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        require(_reserveWeight > 0 && _reserveWeight <= MAX_RESERVE_RATIO, "Invalid reserve weight");
        require(_initialSupply > 0, "Initial supply must be positive");
        
        token = IERC20(_token);
        reserveWeight = _reserveWeight;
        initialSupply = _initialSupply;
        totalSupply = 0;
        fundingRaised = 0;
        reserveBalance = INITIAL_RESERVE;
    }

    /**
     * @dev Power function for calculating token price
     * @param base Base number
     * @param exp Exponent in PRECISION
     * @return result Result of base^exp
     */
    function pow(uint256 base, uint256 exp) internal pure returns (uint256) {
        require(base > 0, "Base must be positive");
        
        if (base == PRECISION) {
            return PRECISION;
        }
        if (exp == 0) {
            return PRECISION;
        }
        if (exp == PRECISION) {
            return base;
        }

        // Use logarithmic properties for the calculation
        uint256 logBase = _ln(base);
        uint256 logResult = (logBase * exp) / PRECISION;
        return _exp(logResult);
    }

    /**
     * @dev Natural logarithm function
     * @param x Value to calculate ln(x)
     * @return Natural logarithm result
     */
    function _ln(uint256 x) internal pure returns (uint256) {
        require(x > 0, "Cannot calculate ln of 0");
        
        uint256 result = 0;
        uint256 y = x;

        while (y < PRECISION) {
            y = (y * 10) / 1;
            result -= PRECISION / 10;
        }

        y = y / 10;

        for (uint8 i = 0; i < 10; i++) {
            y = (y * y) / PRECISION;
            if (y >= 10 * PRECISION) {
                result += PRECISION;
                y = y / 10;
            }
        }

        return result;
    }

    /**
     * @dev Exponential function
     * @param x Value to calculate e^x
     * @return Exponential result
     */
    function _exp(uint256 x) internal pure returns (uint256) {
        require(x <= 2 ** 255 - 1, "Overflow");
        
        uint256 result = PRECISION;
        uint256 xi = x;
        uint256 term = PRECISION;

        for (uint8 i = 1; i <= 8; i++) {
            term = (term * xi) / (i * PRECISION);
            result += term;
        }

        return result;
    }

    /**
     * @dev Get current token price using Bancor Formula
     * P = R₀ * (S/S₀)^((1-F)/F)
     * @return Current price in wei
     */
    function getCurrentPrice() public view returns (uint256) {
        if (totalSupply == 0) {
            return INITIAL_PRICE;
        }

        // Calculate (S/S₀)
        uint256 supplyRatio = (totalSupply * PRECISION) / initialSupply;
        
        // Calculate (1-F)/F where F is reserveWeight/MAX_RESERVE_RATIO
        uint256 exponent = ((MAX_RESERVE_RATIO - reserveWeight) * PRECISION) / reserveWeight;
        
        // Calculate (S/S₀)^((1-F)/F)
        uint256 priceRatio = pow(supplyRatio, exponent);
        
        // Calculate final price: R₀ * priceRatio / PRECISION
        return (INITIAL_RESERVE * priceRatio) / PRECISION;
    }

    /**
     * @dev Calculate tokens to receive for ETH amount
     * @param ethAmount Amount of ETH in wei
     * @return tokenAmount Number of tokens that can be bought
     */
    function calculateTokensForEth(uint256 ethAmount) public view returns (uint256) {
        require(ethAmount > 0, "ETH amount must be positive");

        // For initial purchase
        if (totalSupply == 0) {
            return (ethAmount * PRECISION) / INITIAL_PRICE;
        }

        // Using Bancor Formula:
        // T = S * ((1 + E/R)^(W/MAX_WEIGHT) - 1)
        // Where:
        // T = Tokens to receive
        // S = Current total supply
        // E = ETH being paid
        // R = Current reserve balance
        // W = Reserve weight

        // First calculate the effective price based on current supply
        uint256 currentPrice = getCurrentPrice();
        
        // Base token amount at current price
        uint256 baseTokens = (ethAmount * PRECISION) / currentPrice;
        
        // Apply bonding curve effect
        // Calculate percentage of reserve being added
        uint256 reserveRatio = (ethAmount * PRECISION) / reserveBalance;
        
        // Apply reserve weight effect
        uint256 weight = (reserveWeight * PRECISION) / MAX_RESERVE_RATIO;
        
        // Calculate price impact
        uint256 priceImpact = (reserveRatio * weight) / PRECISION;
        
        // Adjust tokens based on price impact
        uint256 tokensToReceive = (baseTokens * (PRECISION - priceImpact)) / PRECISION;

        // Ensure we don't exceed available supply
        uint256 availableSupply = initialSupply - totalSupply;
        if (tokensToReceive > availableSupply) {
            tokensToReceive = availableSupply;
        }

        require(tokensToReceive > 0, "Token calculation resulted in zero");
        return tokensToReceive;
    }

    /**
     * @dev Calculate ETH to receive for token amount
     * @param tokenAmount Amount of tokens
     * @return ethAmount Amount of ETH in wei
     */
    function calculateEthForTokens(uint256 tokenAmount) public view returns (uint256) {
        require(tokenAmount > 0, "Token amount must be positive");
        require(tokenAmount <= totalSupply, "Insufficient supply");

        // Get current price
        uint256 currentPrice = getCurrentPrice();
        
        // Base ETH amount at current price
        uint256 baseEth = (tokenAmount * currentPrice) / PRECISION;
        
        // Calculate percentage of supply being sold
        uint256 supplyRatio = (tokenAmount * PRECISION) / totalSupply;
        
        // Apply reserve weight effect
        uint256 weight = (reserveWeight * PRECISION) / MAX_RESERVE_RATIO;
        
        // Calculate price impact
        uint256 priceImpact = (supplyRatio * weight) / PRECISION;
        
        // Adjust ETH based on price impact
        return (baseEth * (PRECISION - priceImpact)) / PRECISION;
    }

    /**
     * @dev Buy tokens using ETH
     * @param minTokens Minimum amount of tokens to receive
     * @param buyer Address of the token buyer
     */
    function buy(uint256 minTokens, address buyer) external payable nonReentrant {
        // Check funding goal status first
        require(!fundingGoalReached, "Funding goal already reached");
        require(fundingRaised < FUNDING_GOAL, "Funding goal exceeded");
        
        require(msg.value > 0, "Must send ETH");
        require(buyer != address(0), "Invalid buyer address");
        
        // Calculate tokens to receive
        uint256 tokensToReceive = calculateTokensForEth(msg.value);
        require(tokensToReceive > 0, "No tokens to receive");
        require(tokensToReceive >= minTokens, "Slippage too high");
        
        // Check contract balance
        uint256 contractBalance = token.balanceOf(address(this));
        require(contractBalance >= tokensToReceive, "Insufficient token balance");
        
        // Check if this purchase would exceed funding goal
        require(fundingRaised + msg.value <= FUNDING_GOAL, "Purchase would exceed funding goal");

        // Update state before transfer
        totalSupply += tokensToReceive;
        fundingRaised += msg.value;
        reserveBalance += msg.value;

        // Transfer tokens to buyer
        token.safeTransfer(buyer, tokensToReceive);

        // Check if funding goal is reached
        if (fundingRaised >= FUNDING_GOAL && !fundingGoalReached) {
            fundingGoalReached = true;
            fundingEndTime = block.timestamp;
            emit FundingGoalReached(block.timestamp);
        }

        emit Buy(buyer, tokensToReceive, msg.value);
        emit FundingRaised(msg.value);
    }

    /**
     * @dev Sell tokens back to the contract
     * @param tokenAmount Amount of tokens to sell
     * @param minEth Minimum ETH to receive
     */
    function sell(uint256 tokenAmount, uint256 minEth) external nonReentrant {
        require(tokenAmount > 0, "Amount must be positive");
        require(totalSupply >= tokenAmount, "Cannot sell more than supply");
        
        uint256 ethToReceive = calculateEthForTokens(tokenAmount);
        require(ethToReceive >= minEth, "Below min return");
        require(reserveBalance >= ethToReceive, "Insufficient reserve");
        
        // Transfer tokens from seller
        token.safeTransferFrom(msg.sender, address(this), tokenAmount);
        
        // Update state
        totalSupply -= tokenAmount;
        reserveBalance -= ethToReceive;
        
        // Transfer ETH to seller
        (bool success, ) = msg.sender.call{value: ethToReceive}("");
        require(success, "ETH transfer failed");
        
        emit Sell(msg.sender, tokenAmount, ethToReceive);
    }

    /**
     * @dev Get total market capitalization in ETH
     * @return Total market cap in wei
     */
    function getTotalMarketCap() external view returns (uint256) {
        if (totalSupply == 0) return 0;
        return getCurrentPrice() * totalSupply / PRECISION;
    }

    /**
     * @dev Get total funding raised
     * @return Total funding in wei
     */
    function getTotalFundingRaised() external view returns (uint256) {
        return fundingRaised;
    }

    /**
     * @dev Get holder's token percentage compared to initial supply
     * @param holder Address of the holder
     * @return percentage Percentage with 2 decimals (e.g., 534 = 5.34%)
     */
    function getHolderTokenPercentage(address holder) external view returns (uint256) {
        require(holder != address(0), "Invalid address");
        uint256 holderBalance = token.balanceOf(holder);
        if (holderBalance == 0) return 0;
        // Return percentage with 2 decimals
        return (holderBalance * 10000) / initialSupply;
    }

    /**
     * @dev Get top holder percentages
     * @param holders Array of holder addresses to check
     * @return percentages Array of percentages with 2 decimals
     */
    function getMultipleHolderPercentages(address[] calldata holders) external view returns (uint256[] memory) {
        uint256[] memory percentages = new uint256[](holders.length);
        
        for(uint256 i = 0; i < holders.length; i++) {
            if(holders[i] == address(0)) {
                percentages[i] = 0;
                continue;
            }
            uint256 holderBalance = token.balanceOf(holders[i]);
            percentages[i] = holderBalance > 0 ? (holderBalance * 10000) / initialSupply : 0;
        }
        
        return percentages;
    }

    /**
     * @dev Get funding progress percentage
     * @return progress Percentage with 2 decimals (e.g., 8350 = 83.50%)
     */
    function getFundingProgress() external view returns (uint256) {
        if (fundingRaised == 0) return 0;
        return (fundingRaised * 10000) / FUNDING_GOAL;
    }

    /**
     * @dev Get remaining funding amount needed
     * @return remaining Amount in ETH needed to reach goal
     */
    function getRemainingFunding() external view returns (uint256) {
        if (fundingGoalReached || fundingRaised >= FUNDING_GOAL) {
            return 0;
        }
        return FUNDING_GOAL - fundingRaised;
    }

    /**
     * @dev Get funding duration if goal reached
     * @return duration Time in seconds from contract creation to goal reached
     */
    function getFundingDuration() external view returns (uint256) {
        if (!fundingGoalReached) {
            return 0;
        }
        return fundingEndTime;
    }

    /**
     * @dev Check if funding is active
     * @return bool True if funding is still active
     */
    function isFundingActive() public view returns (bool) {
        return !fundingGoalReached && fundingRaised < FUNDING_GOAL;
    }

    // Function to receive ETH
    receive() external payable {}
} 