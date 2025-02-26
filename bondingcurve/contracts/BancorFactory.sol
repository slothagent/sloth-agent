// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./BancorContinuousToken.sol";
import "./SimpleToken.sol";

contract BancorFactory is Ownable {
    using SafeMath for uint256;

    // Formula contract address used for all tokens
    address public immutable formulaAddress;
    
    // Array to store all created token addresses
    address[] public allTokens;
    // Mapping from token address to creator
    mapping(address => address) public tokenCreator;
    // Mapping to check if an address is a valid token
    mapping(address => bool) public isValidToken;
    // Mapping for token metadata
    mapping(address => TokenMetadata) public tokenMetadata;

    // Creation fee in reserve tokens
    uint256 public creationFee;
    // Treasury address to receive fees
    address public treasury;
    
    struct TokenMetadata {
        string name;
        string symbol;
        string tokenURI;
        uint32 reserveWeight;
        uint256 creationTime;
        uint256 totalMinted;
        uint256 totalBurned;
        address reserveToken;
    }

    event TokenCreated(
        address indexed token,
        address indexed creator,
        string name,
        string symbol,
        string tokenURI,
        uint32 reserveWeight,
        uint256 creationFee,
        address reserveToken
    );

    event CreationFeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    constructor(
        address _formulaAddress, 
        uint256 _creationFee,
        address _treasury
    ) {
        formulaAddress = _formulaAddress;
        creationFee = _creationFee;
        treasury = _treasury;
    }

    /// @notice Creates a new BancorContinuousToken
    /// @param name Token name
    /// @param symbol Token symbol
    /// @param tokenURI Token metadata URI
    /// @param reserveWeight Reserve weight (e.g. 800000 for 80%)
    function createToken(
        string memory name,
        string memory symbol,
        string memory tokenURI,
        uint32 reserveWeight
    ) external returns (address) {
        require(reserveWeight > 0 && reserveWeight <= 1000000, "Invalid reserve weight");
        
        SimpleToken reserveToken = new SimpleToken(name, symbol, tokenURI);

        address reserveTokenAddress = address(reserveToken);


        // Handle creation fee
        if (creationFee > 0) {
            require(
                IERC20(reserveTokenAddress).transferFrom(msg.sender, treasury, creationFee),
                "Creation fee transfer failed"
            );
        }

        // Create new token
        BancorContinuousToken newToken = new BancorContinuousToken(
            reserveWeight,
            formulaAddress,
            reserveTokenAddress
        );

        // Initialize the token
        newToken.init(name, symbol);

        // Store token information
        address tokenAddress = address(newToken);
        allTokens.push(tokenAddress);
        tokenCreator[tokenAddress] = msg.sender;
        isValidToken[tokenAddress] = true;

        // Store metadata
        tokenMetadata[tokenAddress] = TokenMetadata({
            name: name,
            symbol: symbol,
            tokenURI: tokenURI,
            reserveWeight: reserveWeight,
            creationTime: block.timestamp,
            totalMinted: 0,
            totalBurned: 0,
            reserveToken: reserveTokenAddress
        });

        emit TokenCreated(
            tokenAddress,
            msg.sender,
            name,
            symbol,
            tokenURI,
            reserveWeight,
            creationFee,
            reserveTokenAddress
        );

        return tokenAddress;
    }

    /// @notice Update token URI
    /// @param tokenAddress Token address
    /// @param newTokenURI New token URI
    function updateTokenURI(address tokenAddress, string memory newTokenURI) external {
        require(isValidToken[tokenAddress], "Invalid token address");
        require(msg.sender == tokenCreator[tokenAddress], "Only creator can update URI");
        tokenMetadata[tokenAddress].tokenURI = newTokenURI;
    }

    /// @notice Set creation fee
    /// @param newFee New fee amount in reserve tokens
    function setCreationFee(uint256 newFee) external onlyOwner {
        emit CreationFeeUpdated(creationFee, newFee);
        creationFee = newFee;
    }

    /// @notice Set treasury address
    /// @param newTreasury New treasury address
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    /// @notice Get total number of tokens created
    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }

    /// @notice Get funding raised for a specific token
    /// @param tokenAddress Address of the BancorContinuousToken
    /// @return Funding raised in reserve tokens (e.g. USDC)
    function getFundingRaised(address tokenAddress) public view returns (uint256) {
        require(isValidToken[tokenAddress], "Invalid token address");
        BancorContinuousToken token = BancorContinuousToken(tokenAddress);
        // Funding raised is the reserve balance minus initial reserve
        return token.reserveBalance().sub(1e6); // Subtract initial 1 USDC
    }

    /// @notice Get total market cap for a specific token
    /// @param tokenAddress Address of the BancorContinuousToken
    /// @return Market cap in reserve tokens (e.g. USDC)
    function getMarketCap(address tokenAddress) public view returns (uint256) {
        require(isValidToken[tokenAddress], "Invalid token address");
        BancorContinuousToken token = BancorContinuousToken(tokenAddress);
        // Market cap = current price * total supply
        return token.price().mul(token.totalSupply()).div(1e18);
    }

    /// @notice Get total funding raised across all tokens
    function getTotalFundingRaised() external view returns (uint256) {
        uint256 totalFunding = 0;
        for (uint i = 0; i < allTokens.length; i++) {
            totalFunding = totalFunding.add(getFundingRaised(allTokens[i]));
        }
        return totalFunding;
    }

    /// @notice Get total market cap across all tokens
    function getTotalMarketCap() external view returns (uint256) {
        uint256 totalMarketCap = 0;
        for (uint i = 0; i < allTokens.length; i++) {
            totalMarketCap = totalMarketCap.add(getMarketCap(allTokens[i]));
        }
        return totalMarketCap;
    }

    /// @notice Get tokens created by a specific address
    function getTokensByCreator(address creator) external view returns (address[] memory) {
        uint256 count = 0;
        for (uint i = 0; i < allTokens.length; i++) {
            if (tokenCreator[allTokens[i]] == creator) {
                count++;
            }
        }

        address[] memory creatorTokens = new address[](count);
        uint256 index = 0;
        for (uint i = 0; i < allTokens.length; i++) {
            if (tokenCreator[allTokens[i]] == creator) {
                creatorTokens[index] = allTokens[i];
                index++;
            }
        }

        return creatorTokens;
    }

} 