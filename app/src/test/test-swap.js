const hre = require("hardhat");
const { ethers } = require("hardhat");
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json');
const { abi: INonfungiblePositionManagerABI } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json');
const { abi: ISwapRouterABI } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');

async function main() {
    console.log("Testing swap functionality...");

    // Token addresses
    const WETH = "0x4200000000000000000000000000000000000006";
    const OKZ = "0x5335D1331237bA766698D86f9dDf38587aBBA0e1";

    // Get the deployed contracts
    const factory = await ethers.getContractAt(
        "UniswapV3Factory",
        "0x48bFcb7c258E3806b390fe9FA2B2B378A9285c17"
    );

    // Create pool
    const fee = 3000; // 0.3% fee tier
    
    // Check if pool exists
    let poolAddress = await factory.getPool(WETH, OKZ, fee);
    
    if (poolAddress === '0x0000000000000000000000000000000000000000') {
        console.log("Creating new pool...");
        const createPoolTx = await factory.createPool(WETH, OKZ, fee);
        await createPoolTx.wait();
        poolAddress = await factory.getPool(WETH, OKZ, fee);
    }
    
    const pool = await ethers.getContractAt(IUniswapV3PoolABI, poolAddress);
    console.log("Pool address:", poolAddress);

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("Using signer address:", signer.address);

    // Get token contracts
    const token0 = await ethers.getContractAt("IWETH", WETH);
    const token1 = await ethers.getContractAt("IERC20", OKZ);

    // Check token balances before proceeding
    const wethBalance = await token0.balanceOf(signer.address);
    const okzBalance = await token1.balanceOf(signer.address);
    console.log("Initial WETH balance:", ethers.utils.formatEther(wethBalance));
    console.log("Initial OKZ balance:", ethers.utils.formatEther(okzBalance));

    // Adjust amounts based on desired ratio (1 WETH = 1,000,000 OKZ)
    const wethAmount = ethers.utils.parseEther("0.001"); // 0.0001 WETH
    const okzAmount = ethers.utils.parseEther("100000"); // 100,000 OKZ

    // Check pool initialization
    const slot0 = await pool.slot0();
    if (slot0.sqrtPriceX96.eq(0)) {
        console.log("Initializing pool with price...");
        
        // Calculate sqrtPriceX96 for 1 WETH = 1,000,000 OKZ
        // Formula: sqrt(price) * 2^96
        // price = 1,000,000
        const price = ethers.BigNumber.from(10).pow(6); // 1,000,000
        const sqrtPriceX96 = ethers.BigNumber.from(
            Math.floor(Math.sqrt(price) * 2 ** 96)
        );
        
        console.log("Initializing with sqrtPriceX96:", sqrtPriceX96.toString());
        await pool.initialize(sqrtPriceX96);
        console.log("Pool initialized with sqrt price:", sqrtPriceX96.toString());
    }

    // Get updated pool state
    const updatedSlot0 = await pool.slot0();
    const currentTick = updatedSlot0.tick;
    console.log("Current tick:", currentTick.toString());
    console.log("Current sqrt price:", updatedSlot0.sqrtPriceX96.toString());

    // Determine token order
    const [token0Address, token1Address] = WETH.toLowerCase() < OKZ.toLowerCase() 
        ? [WETH, OKZ] 
        : [OKZ, WETH];
    const isWethToken0 = WETH.toLowerCase() < OKZ.toLowerCase();

    // Modify tick range calculation
    const TICK_SPACINGS = {
        500: 10,
        3000: 60,
        10000: 200
    };
    
    const tickSpacing = TICK_SPACINGS[fee];
    const tickRange = tickSpacing * 2; // Use smaller range
    const baseTickLower = Math.floor(currentTick / tickSpacing) * tickSpacing;
    const baseTickUpper = Math.ceil(currentTick / tickSpacing) * tickSpacing;

    // Ensure ticks are within bounds
    const MIN_TICK = -887272;
    const MAX_TICK = 887272;
    const adjustedTickLower = Math.max(MIN_TICK, baseTickLower - tickRange);
    const adjustedTickUpper = Math.min(MAX_TICK, baseTickUpper + tickRange);

    // Update liquidity parameters with tighter range
    liquidityParams = {
        token0: token0Address,
        token1: token1Address,
        fee: fee,
        tickLower: adjustedTickLower,
        tickUpper: adjustedTickUpper,
        amount0Desired: isWethToken0 ? wethAmount : okzAmount,
        amount1Desired: isWethToken0 ? okzAmount : wethAmount,
        amount0Min: 0,
        amount1Min: 0,
        recipient: signer.address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 10
    };

    // // Convert ETH to WETH
    // const wethToDeposit = ethers.utils.parseEther("0.001");
    // console.log("Converting ETH to WETH...");
    // try {
    //     const wrapTx = await token0.deposit({ value: wethToDeposit });
    //     await wrapTx.wait();
    //     console.log("Successfully wrapped", ethers.utils.formatEther(wethToDeposit), "ETH to WETH");
    // } catch (error) {
    //     console.error("Error wrapping ETH:", error.message);
    //     return;
    // }

    // Add more detailed logging
    console.log("Updated parameters:", {
        currentSqrtPrice: updatedSlot0.sqrtPriceX96.toString(),
        currentTick,
        tickSpacing,
        finalTickLower: adjustedTickLower,
        finalTickUpper: adjustedTickUpper,
        tickRange,
        isWethToken0,
        token0: isWethToken0 ? "WETH" : "OKZ",
        token1: isWethToken0 ? "OKZ" : "WETH",
        amount0Desired: ethers.utils.formatEther(liquidityParams.amount0Desired),
        amount1Desired: ethers.utils.formatEther(liquidityParams.amount1Desired)
    });

    // Add this after getting the pool contract and before theliquidityParams liquidity section
    // Create NonfungiblePositionManager instance
    const positionManager = await ethers.getContractAt(
        INonfungiblePositionManagerABI,
        "0x45E5ceC1177361b7b5525A382c07C58F3bf89355"
    );

    // Add liquidity
    try {
        // Get current gas prices
        const feeData = await ethers.provider.getFeeData();
        const maxPriorityFeePerGas = ethers.utils.parseUnits("2", "gwei"); // Increased priority fee
        const maxFeePerGas = feeData.maxFeePerGas.gt(maxPriorityFeePerGas) 
            ? feeData.maxFeePerGas 
            : maxPriorityFeePerGas.mul(2);

        console.log("Gas fees:", {
            maxFeePerGas: ethers.utils.formatUnits(maxFeePerGas, "gwei"),
            maxPriorityFeePerGas: ethers.utils.formatUnits(maxPriorityFeePerGas, "gwei")
        });

        // Ensure sufficient allowance
        const token0Contract = await ethers.getContractAt("IERC20", token0Address);
        const token1Contract = await ethers.getContractAt("IERC20", token1Address);

        // Approve if needed
        const token0Allowance = await token0Contract.allowance(signer.address, positionManager.address);
        const token1Allowance = await token1Contract.allowance(signer.address, positionManager.address);

        if (token0Allowance.lt(liquidityParams.amount0Desired)) {
            console.log("Approving token0...");
            await (await token0Contract.approve(positionManager.address, ethers.constants.MaxUint256)).wait();
        }

        if (token1Allowance.lt(liquidityParams.amount1Desired)) {
            console.log("Approving token1...");
            await (await token1Contract.approve(positionManager.address, ethers.constants.MaxUint256)).wait();
        }

        // Mint position with higher gas limit
        const mintTx = await positionManager.mint(liquidityParams, {
            gasLimit: 10000000, // Increased gas limit
            maxFeePerGas,
            maxPriorityFeePerGas
        });

        console.log("Mint transaction submitted:", mintTx.hash);
        const receipt = await mintTx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        // Log events
        for (const log of receipt.logs) {
            try {
                const parsed = positionManager.interface.parseLog(log);
                console.log("Event:", parsed.name, parsed.args);
            } catch (e) {
                // Skip logs that can't be parsed
            }
        }
    } catch (error) {
        console.error("Error adding liquidity:", error);
        if (error.error && error.error.message) {
            console.error("Error message:", error.error.message);
        }
        throw error;
    }

    // Perform swap with a smaller amount first
    const swapAmount = ethers.utils.parseEther("1000000"); // Reduce to 1M OKZ first
    const swapParams = {
        tokenIn: OKZ,
        tokenOut: WETH,
        fee: fee,
        recipient: signer.address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 10,
        amountIn: swapAmount,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    };

    // Create SwapRouter instance
    const swapRouter = await ethers.getContractAt(
        ISwapRouterABI,
        "0x2814f03159D471B015C64FF225aA31072366d54D"
    );

    // Check and approve SwapRouter if needed
    const swapAllowance = await token1.allowance(signer.address, swapRouter.address);  // Changed from token0 to token1
    if (swapAllowance.lt(swapAmount)) {
        console.log("Approving OKZ for swap...");  // Changed message from WETH to OKZ
        const approveTx = await token1.approve(swapRouter.address, ethers.constants.MaxUint256);  // Changed from token0 to token1
        await approveTx.wait();
        console.log("OKZ approved for swap");  // Changed message
    }

    // Execute swap with increased gas limit and better error handling
    console.log("Executing swap...");
    try {
        const feeData = await ethers.provider.getFeeData();
        const maxPriorityFeePerGas = ethers.utils.parseUnits("2", "gwei"); // Increased priority fee
        const maxFeePerGas = feeData.maxFeePerGas.gt(maxPriorityFeePerGas) 
            ? feeData.maxFeePerGas 
            : maxPriorityFeePerGas.mul(2);

        console.log("Attempting to swap", ethers.utils.formatEther(swapAmount), "OKZ for WETH");
        
        const swapTx = await swapRouter.exactInputSingle(
            swapParams,
            { 
                gasLimit: 1000000, // Increased gas limit
                maxFeePerGas,
                maxPriorityFeePerGas
            }
        );
        
        console.log("Swap transaction submitted:", swapTx.hash);
        const receipt = await swapTx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        
        // Log swap events with more detail
        for (const log of receipt.logs) {
            try {
                const parsed = swapRouter.interface.parseLog(log);
                if (parsed.name === 'Swap') {
                    console.log("Swap successful:", {
                        amountIn: ethers.utils.formatEther(parsed.args.amountIn),
                        amountOut: ethers.utils.formatEther(parsed.args.amountOut)
                    });
                }
            } catch (e) {
                // Skip logs that can't be parsed
            }
        }
    } catch (error) {
        console.error("Swap failed with error:", error);
        if (error.error && error.error.message) {
            console.error("Error details:", error.error.message);
        }
        // Check if error contains revert data
        if (error.transaction) {
            console.log("Transaction details:", {
                hash: error.transaction.hash,
                from: error.transaction.from,
                to: error.transaction.to,
                data: error.transaction.data.slice(0, 66) // Show first few bytes of call data
            });
        }
        throw error;
    }

    // Get final balances
    const finalBalance0 = await token0.balanceOf(signer.address);
    const finalBalance1 = await token1.balanceOf(signer.address);

    console.log("Final WETH balance:", ethers.utils.formatEther(finalBalance0));
    console.log("Final OKZ balance:", ethers.utils.formatEther(finalBalance1));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 