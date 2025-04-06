// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

interface ISloth {
    /**
     * @notice Emitted when tokens are bought in initial sale
     * @param buyer Address of the buyer
     * @param recipient Address receiving the tokens
     * @param nativeAmount Amount of native tokens paid
     * @param tokenAmount Amount of tokens received
     */
    event InitialBuy(
        address indexed buyer,
        address indexed recipient,
        uint256 nativeAmount,
        uint256 tokenAmount
    );

    /**
     * @notice Emitted when tokens are bought
     * @param buyer Address of the buyer
     * @param recipient Address receiving the tokens
     * @param nativeAmount Amount of native tokens paid
     * @param tokenAmount Amount of tokens received
     */
    event TokenBought(
        address indexed buyer,
        address indexed recipient,
        uint256 nativeAmount,
        uint256 tokenAmount
    );

    /**
     * @notice Emitted when tokens are sold
     * @param seller Address of the seller
     * @param recipient Address receiving the native tokens
     * @param tokenAmount Amount of tokens sold
     * @param nativeAmount Amount of native tokens received
     */
    event TokenSold(
        address indexed seller,
        address indexed recipient,
        uint256 tokenAmount,
        uint256 nativeAmount
    );

    function initialize(
        address _token,
        address _native,
        address _uniswapV2Factory,
        address _uniswapV2Pair,
        uint256 _saleAmount,
        uint256 _tokenOffset,
        uint256 _nativeOffset
    ) external;

    /**
     * @notice Get current liquidity info
     * @return tokenReserve Current token reserve in the pool
     * @return nativeReserve Current native token reserve in the pool
     * @return totalLiquidity Total supply of LP tokens
     */
    function getLiquidityInfo() external view returns (
        uint256 tokenReserve,
        uint256 nativeReserve,
        uint256 totalLiquidity
    );

    function initialBuy(uint256 _nativeAmount, address _to) external;
    function buy(uint256 _nativeAmount, address _to) external;
    function sell(uint256 _tokenAmount, address _to) external;
    function calculateTokenAmount(uint256 _nativeAmount) external view returns (uint256);
    function calculateNativeAmount(uint256 _tokenAmount) external view returns (uint256);
}
