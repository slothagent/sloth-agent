// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BondingCurve.sol";
import "./ERC20.sol";
import "./FactoryLib.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Helper interface for BondingCurve
interface IBondingCurve {
    function buy(uint256 minTokens, address buyer) external payable;
    function sell(uint256 tokenAmount, uint256 minEth) external;
    function calculatePrice(uint256 amount) external view returns (uint256);
    function getCurrentPrice() external view returns (uint256);
    function updateSlope(uint256 newSlope) external;
    function updateBasePrice(uint256 newBasePrice) external;
    function getTotalMarketCap() external view returns (uint256);
    function calculateTokensForEth(uint256 ethAmount) external view returns (uint256);
}

contract Factory is Ownable {
    using FactoryLib for *;

    // Fee settings
    uint256 public creationFee;  // Fee in ETH for creating new token and curve
    
    // Tracking deployments
    mapping(address => address) public tokenToCurve;  // Token address to its bonding curve
    mapping(address => address) public curveToToken;  // Bonding curve to its token
    mapping(address => bool) public isTokenRegistered;
    
    // Array to store all created tokens
    address[] public allTokens;
    address[] public allCurves;
    
    // Struct to store token info
    struct TokenInfo {
        string name;
        string symbol;
        address tokenAddress;
        address curveAddress;
        uint256 initialSupply;
        uint256 creationTime;
    }
    
    // Mapping from token address to TokenInfo
    mapping(address => FactoryLib.TokenInfo) public tokenInfo;
    
    // Events
    event TokenAndCurveCreated(
        address indexed token,
        address indexed bondingCurve,
        string name,
        string symbol,
        uint256 initialSupply,
        uint256 timestamp
    );
    event CreationFeeUpdated(uint256 newFee);

    constructor(uint256 _creationFee) Ownable(msg.sender) {
        creationFee = _creationFee;
    }

    /**
     * @dev Create new token and bonding curve with initial setup
     * @param name Token name
     * @param symbol Token symbol
     * @param initialSupply Initial token supply
     * @param slope Bonding curve slope
     * @param basePrice Bonding curve base price
     */
    function createTokenAndCurve(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 slope,
        uint256 basePrice
    ) external payable {
        // Check creation fee
        require(msg.value >= creationFee, "Insufficient creation fee");

        // Deploy new token
        ContractErc20 newToken = new ContractErc20(name, symbol, initialSupply);
        
        // Deploy new bonding curve
        BondingCurve newCurve = new BondingCurve(
            address(newToken),
            slope,
            basePrice
        );

        // Setup initial permissions and transfer
        // 1. Approve bonding curve to spend tokens
        newToken.approve(address(newCurve), type(uint256).max);
        
        // 2. Transfer initial supply to bonding curve
        newToken.transfer(address(newCurve), initialSupply);

        // Register the pair
        tokenToCurve[address(newToken)] = address(newCurve);
        curveToToken[address(newCurve)] = address(newToken);
        isTokenRegistered[address(newToken)] = true;

        // Add to arrays
        allTokens.push(address(newToken));
        allCurves.push(address(newCurve));

        // Store token info
        tokenInfo[address(newToken)] = FactoryLib.TokenInfo({
            name: name,
            symbol: symbol,
            tokenAddress: address(newToken),
            curveAddress: address(newCurve),
            initialSupply: initialSupply,
            creationTime: block.timestamp
        });

        // Transfer ownership of token and curve to msg.sender
        newToken.transferOwnership(msg.sender);
        newCurve.transferOwnership(msg.sender);

        emit TokenAndCurveCreated(
            address(newToken),
            address(newCurve),
            name,
            symbol,
            initialSupply,
            block.timestamp
        );
    }

    /**
     * @dev Update creation fee
     * @param newFee New fee amount in ETH
     */
    function updateCreationFee(uint256 newFee) external onlyOwner {
        creationFee = newFee;
        emit CreationFeeUpdated(newFee);
    }

    /**
     * @dev Get token address for a bonding curve
     */
    function getTokenForCurve(address curve) external view returns (address) {
        return curveToToken[curve];
    }

    /**
     * @dev Get bonding curve address for a token
     */
    function getCurveForToken(address token) external view returns (address) {
        return tokenToCurve[token];
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

    /**
     * @dev Get total number of tokens created
     */
    function getTotalTokens() external view returns (uint256) {
        return allTokens.length;
    }

    /**
     * @dev Get token addresses by index range
     */
    function getTokensByRange(uint256 start, uint256 end) 
        external 
        view 
        returns (address[] memory tokens, address[] memory curves) 
    {
        return FactoryLib.getTokensByRange(allTokens, allCurves, start, end);
    }

    /**
     * @dev Get detailed info for a token
     */
    function getTokenInfo(address token) 
        external 
        view 
        returns (FactoryLib.TokenInfo memory) 
    {
        require(isTokenRegistered[token], "Token not registered");
        return tokenInfo[token];
    }

    /**
     * @dev Get latest created token
     */
    function getLatestToken() 
        external 
        view 
        returns (address token, address curve) 
    {
        require(allTokens.length > 0, "No tokens created");
        token = allTokens[allTokens.length - 1];
        curve = allCurves[allCurves.length - 1];
        return (token, curve);
    }

    /**
     * @dev Helper function to buy tokens directly through factory
     * @param token Token address to buy
     * @param amount Amount of tokens to buy
     */
    function buyTokens(address token, uint256 amount) external payable {
        require(isTokenRegistered[token], "Token not registered");
        address curveAddress = tokenToCurve[token];
        
        IBondingCurve curve = IBondingCurve(curveAddress);
        uint256 price = curve.calculatePrice(amount);
        require(msg.value >= price, "Insufficient payment");
        
        // Forward only the required price to bonding curve, passing the buyer's address
        curve.buy{value: price}(amount, msg.sender);
        
        // Refund excess ETH if any
        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool success, ) = msg.sender.call{value: excess}("");
            require(success, "ETH refund failed");
        }
    }

    /**
     * @dev Helper function to get price for buying tokens
     * @param token Token address to check price
     * @param amount Amount of tokens to buy
     */
    function getTokenPrice(address token, uint256 amount) external view returns (uint256) {
        require(isTokenRegistered[token], "Token not registered");
        address curveAddress = tokenToCurve[token];
        
        IBondingCurve curve = IBondingCurve(curveAddress);
        return curve.calculatePrice(amount);
    }

    /**
     * @dev Helper function to get current token price
     * @param token Token address to check price
     */
    function getCurrentTokenPrice(address token) external view returns (uint256) {
        require(isTokenRegistered[token], "Token not registered");
        address curveAddress = tokenToCurve[token];
        
        IBondingCurve curve = IBondingCurve(curveAddress);
        return curve.getCurrentPrice();
    }

    /**
     * @dev Helper function to sell tokens through factory
     * @param token Token address to sell
     * @param amount Amount of tokens to sell
     * @param minEth Minimum ETH to receive
     */
    function sellTokens(address token, uint256 amount, uint256 minEth) external {
        require(isTokenRegistered[token], "Token not registered");
        address curveAddress = tokenToCurve[token];
        
        IBondingCurve curve = IBondingCurve(curveAddress);
        curve.sell(amount, minEth);
    }

    /**
     * @dev Helper function to update slope
     * @param token Token address
     * @param newSlope New slope value
     */
    function updateTokenSlope(address token, uint256 newSlope) external {
        require(isTokenRegistered[token], "Token not registered");
        address curveAddress = tokenToCurve[token];
        
        IBondingCurve curve = IBondingCurve(curveAddress);
        curve.updateSlope(newSlope);
    }

    /**
     * @dev Helper function to update base price
     * @param token Token address
     * @param newBasePrice New base price value
     */
    function updateTokenBasePrice(address token, uint256 newBasePrice) external {
        require(isTokenRegistered[token], "Token not registered");
        address curveAddress = tokenToCurve[token];
        
        IBondingCurve curve = IBondingCurve(curveAddress);
        curve.updateBasePrice(newBasePrice);
    }

    /**
     * @dev Helper function to get total market cap
     * @param token Token address
     */
    function getTokenMarketCap(address token) external view returns (uint256) {
        require(isTokenRegistered[token], "Token not registered");
        address curveAddress = tokenToCurve[token];
        
        IBondingCurve curve = IBondingCurve(curveAddress);
        return curve.getTotalMarketCap();
    }

    /**
     * @dev Calculate how many tokens can be bought with a specific amount of ETH
     * @param token Token address to buy
     * @param ethAmount Amount of ETH in wei
     * @return tokenAmount Approximate number of tokens that can be bought
     */
    function calculateTokensForEth(address token, uint256 ethAmount) external view returns (uint256) {
        require(isTokenRegistered[token], "Token not registered");
        address curveAddress = tokenToCurve[token];
        
        IBondingCurve curve = IBondingCurve(curveAddress);
        return curve.calculateTokensForEth(ethAmount);
    }

    // Function to receive ETH
    receive() external payable {}
} 