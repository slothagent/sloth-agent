// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "contracts/SlothToken.sol";
import "contracts/SlothNursery.sol";
import "contracts/interfaces/IOwnable.sol";
import "contracts/interfaces/IDojoSwapRouter.sol";
import "contracts/interfaces/IUniswapV2Factory.sol";
import "contracts/interfaces/IA8Token.sol";

pragma solidity ^0.8.17;

contract SlothFactoryAncient8 is Ownable2Step, ReentrancyGuard {
  using Address for address payable;
  using SafeERC20 for IERC20;

  // Ecosystem Info
  bool private isPaused;
  address payable public feeReceiver;
  uint256 public migrationFee;
  uint256 public pendingFees;
  uint256 public tradingFee;
  uint256 public createFee;
  uint256 public creatorRewards;
  // Addresses
  address payable public immutable DOJO_ROUTER;
  address private constant DEAD_ADDRESS = address(0xdead);
  address public immutable A8_TOKEN;
  // Constants
  uint256 private constant ETHER = 1 ether;
  uint256 private constant BIN_WIDTH = 2000;
  uint256 private constant BASIS = 10000;
  uint256 private constant COEF = 2;
  uint256 private constant MIN_IN = 1 ether;
  uint256 private constant MIN_OUT = 0.2 ether;
  uint256 private constant MIN_A8_AMOUNT = 1 * 10**18; // Minimum A8 token amount for transactions

  struct Curve {
    uint256[] distribution;
    uint256 percentOfLP; // 5000 = 50%
    uint256 a8AtLaunch;  // Changed from avaxAtLaunch to a8AtLaunch
  }

  struct Token {
    address creator;
    address pair;
    uint8 curveIndex;
    uint256 currentIndex;
    uint256 currentValue;
    uint256 initialSupply;
    bool hasLaunched;
  }

  address[] public allTokens;
  mapping(address => Token) public tokens;
  mapping(uint8 => Curve) public curves;

  event TokenCreated(
    address indexed token,
    address indexed creator,
    uint curveIndex
  );

  event CurveCreated(
    uint indexed curveIndex
  );
  
  event SlothSwap(
    address indexed token,
    address indexed sender,
    uint amount0In,
    uint amount0Out,
    uint amount1In,
    uint amount1Out
  );

  event CurveCompleted(
    address indexed token,
    address indexed nursery,
    address indexed pair
  );

  constructor(
    address msig, 
    address dojoRouter_,
    address a8Token_
  ) Ownable(msig) {
    require(msig != address(0), "Zero address not allowed for owner");
    require(dojoRouter_ != address(0), "Zero address not allowed for router");
    require(a8Token_ != address(0), "Zero address not allowed for A8");
    DOJO_ROUTER = payable(dojoRouter_);
    A8_TOKEN = a8Token_;
    feeReceiver = payable(msig);
    tradingFee = 100; // 1%
    migrationFee = 400; // 4%
    createFee = 10 * 10**18; // 1000 A8 tokens
    creatorRewards = 300; // 3%
  }

  function createToken(
    string memory name_,
    string memory symbol_,
    uint112 totalSupply_,
    uint8 curveIndex_
  ) external nonReentrant {
    Curve memory curve = curves[curveIndex_];
    uint256 percent = curve.percentOfLP;
    uint256[] memory arr = curve.distribution;
    uint256 createFee_ = createFee;
    require(!isPaused, "SLOTH: TOKEN_CREATION_IS_PAUSED");
    require(percent != 0, "SLOTH: CURVE_DOES_NOT_EXIST");
    require(totalSupply_ >= 1 ether, "SLOTH: TOTAL_SUPPLY_TOO_LOW");
    
    // Transfer A8 tokens for fee
    IERC20(A8_TOKEN).safeTransferFrom(msg.sender, address(this), createFee_);
    pendingFees += createFee_;

    SlothToken token = new SlothToken(name_, symbol_, totalSupply_);

    address t = address(token);
    allTokens.push(t);
    uint256 supply = uint256(totalSupply_ * percent / BASIS); 

    tokens[t].initialSupply = supply;
    tokens[t].currentValue = supply * arr[0] / BASIS;
    tokens[t].curveIndex = curveIndex_;
    tokens[t].creator = msg.sender;
    
    // Create pair initially
    address factory = IDojoSwapRouter(DOJO_ROUTER).factory();
    address pair = IUniswapV2Factory(factory).createPair(t, A8_TOKEN);  
    tokens[t].pair = pair;

    emit TokenCreated(t, msg.sender, curveIndex_);
  }

  function createCurve(uint8 index, uint256[] memory lists) external onlyOwner {
    require(curves[index].percentOfLP == 0, "SLOTH: CURVE_ALREADY_IN_USE");
    uint256 totalDistribution = 0;
    // Amount of AVAX
    uint256 cumulativeValue = 0;
    uint256 length = lists.length;
    // Calculate the cumulative value and track the last non-zero bin
    for (uint256 i = 0; i < length; ++i) {
      require(lists[i] != 0, "SLOTH: INVALID_BIN");
      totalDistribution += lists[i];
      uint256 price = ETHER * (BASIS + (i * BIN_WIDTH)) / BASIS;
      cumulativeValue += lists[i] * price;
    }

    // Ensure the total distribution equals 10,000 (in basis points)
    require(totalDistribution == BASIS, "SLOTH: INVALID_TOTAL_DISTRIBUTION");

    // Calculate the price for the last non-zero bin
    uint256 lastNonZeroPrice = ETHER * (((length - 1) * BIN_WIDTH) + BASIS) / BASIS;

    // Calculate the required market cap based on the last non-zero bin value and total tokens
    uint256 requiredMarketCap = BASIS * lastNonZeroPrice;
    uint256 fraction = BASIS * requiredMarketCap / (requiredMarketCap + cumulativeValue);
    curves[index] = Curve(lists, fraction, cumulativeValue / COEF);
    emit CurveCreated(index);
  }

  function sell(
    address token,
    uint256 amount0In,
    uint256 amount1OutMin,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external nonReentrant {
    Token storage t = tokens[token];
    require(t.initialSupply != 0, "SLOTH: TOKEN_DOES_NOT_EXIST");
    require(!t.hasLaunched, "SLOTH: INSUFFICIENT_LIQUIDITY");
    require(deadline >= block.timestamp, "SLOTH: EXPIRED");

    // Try to use permit if supported
    IERC20Permit(token).permit(msg.sender, address(this), amount0In, deadline, v, r, s);

    IERC20(token).safeTransferFrom(msg.sender, address(this), amount0In);

    uint256[] memory arr = curves[t.curveIndex].distribution;
    uint256 amount1Out;
    uint256 amount0Used;
    uint256 i = t.currentIndex;
    uint256 currentValue = t.currentValue;
    uint256 initialSupply = t.initialSupply;

    while (amount0Used < amount0In) {
      uint256 amountPerA8 = initialSupply * COEF / (BASIS + (BIN_WIDTH * i));
      uint256 amount0Remaining = amount0In - amount0Used;
      uint256 amount0InBin = currentValue;
      uint256 amount0InBinMax = arr[i] * initialSupply / BASIS;
      if (amount0InBin + amount0Remaining <= amount0InBinMax) {
        amount1Out += amount0Remaining * 10**18 / amountPerA8;
        currentValue += amount0Remaining;
        break;
      } else {
        uint256 fillBin = amount0InBinMax - amount0InBin;
        amount0Used += fillBin;
        amount1Out += fillBin * 10**18 / amountPerA8;
        i--;
        currentValue = 0;
      }
    }
    require(amount1OutMin <= amount1Out, "SLOTH: SLIPPAGE_LIMIT");
    t.currentIndex = i;
    t.currentValue = currentValue;
    
    uint256 fee = amount1Out * tradingFee / BASIS;
    pendingFees += fee;
    IERC20(A8_TOKEN).safeTransfer(msg.sender, amount1Out - fee);
    emit SlothSwap(token, msg.sender, amount0In, 0, 0, amount1Out);
  }

  // Update the old sell function to use A8 token
  function sell(address token, uint256 amount0In, uint256 amount1OutMin) external nonReentrant {
    Token storage t = tokens[token];
    require(t.initialSupply != 0, "SLOTH: TOKEN_DOES_NOT_EXIST");
    require(!t.hasLaunched, "SLOTH: INSUFFICIENT_LIQUIDITY");
    IERC20(token).safeTransferFrom(msg.sender, address(this), amount0In);

    uint256[] memory arr = curves[t.curveIndex].distribution;
    uint256 amount1Out;
    uint256 amount0Used;
    uint256 i = t.currentIndex;
    uint256 currentValue = t.currentValue;
    uint256 initialSupply = t.initialSupply;

    while (amount0Used < amount0In) {
      uint256 amountPerA8 = initialSupply * COEF / (BASIS + (BIN_WIDTH * i));
      uint256 amount0Remaining = amount0In - amount0Used;
      uint256 amount0InBin = currentValue;
      uint256 amount0InBinMax = arr[i] * initialSupply / BASIS;
      if (amount0InBin + amount0Remaining <= amount0InBinMax) {
        amount1Out += amount0Remaining * 10**18 / amountPerA8;
        currentValue += amount0Remaining;
        break;
      } else {
        uint256 fillBin = amount0InBinMax - amount0InBin;
        amount0Used += fillBin;
        amount1Out += fillBin * 10**18 / amountPerA8;
        i--;
        currentValue = 0;
      }
    }
    require(amount1OutMin <= amount1Out, "SLOTH: SLIPPAGE_LIMIT");
    t.currentIndex = i;
    t.currentValue = currentValue;
    
    uint256 fee = amount1Out * tradingFee / BASIS;
    pendingFees += fee;
    IERC20(A8_TOKEN).safeTransfer(msg.sender, amount1Out - fee);
    emit SlothSwap(token, msg.sender, amount0In, 0, 0, amount1Out);
  }

  function buy(address token, uint256 amount0OutMin) external nonReentrant {
    _buy(token, msg.sender, MIN_A8_AMOUNT, amount0OutMin);
  }

  function _buy(address token, address sender, uint256 amount1In, uint256 amount0OutMin) internal {
    Token storage t = tokens[token];
    require(t.initialSupply != 0, "SLOTH: TOKEN_DOES_NOT_EXIST");
    require(!t.hasLaunched, "SLOTH: ALREADY_LAUNCHED");
    
    // Transfer A8 tokens from sender
    IERC20(A8_TOKEN).safeTransferFrom(sender, address(this), amount1In);
    
    uint256[] memory arr = curves[t.curveIndex].distribution;
    uint256 fee = amount1In * tradingFee / BASIS;
    uint256 value = amount1In - fee;
    uint256 amount0Out;
    uint256 amount1Used;
    uint256 i = t.currentIndex;
    uint256 currentValue = t.currentValue;
    uint256 initialSupply = t.initialSupply;
    
    while (amount1Used < value) {
      uint256 amountPerA8 = initialSupply * COEF / (BASIS + (BIN_WIDTH * i));
      uint256 valueLeft = value - amount1Used;
      uint256 amount0InBin = currentValue;

      if (amount0InBin > valueLeft * amountPerA8 / 10**18) {
        uint256 outputAmount = amountPerA8 * valueLeft / 10**18;

        amount1Used += valueLeft;
        amount0Out += outputAmount;
        currentValue = amount0InBin - outputAmount;
        break;
      } else {
        amount1Used += amount0InBin * 10**18 / amountPerA8;
        amount0Out += amount0InBin;
        ++i;
        if (i < arr.length) {
          currentValue = arr[i] * initialSupply / BASIS;
        } else {
          break;
        }
      }
    }
    require(amount0OutMin <= amount0Out, "SLOTH: SLIPPAGE_LIMIT");
    t.currentIndex = i;
    t.currentValue = currentValue;
    pendingFees += fee;
    IERC20(token).safeTransfer(sender, amount0Out);
    emit SlothSwap(token, sender, 0, amount0Out, amount1In, 0);
    if (i >= arr.length) {
      IERC20(A8_TOKEN).safeTransfer(sender, value - amount1Used);
      _launchToken(token);
    }
  }

  function _launchToken(address token) internal {
    require(!tokens[token].hasLaunched, "SLOTH: ALREADY_LAUNCHED");

    // Allow Transfers
    IOwnable(token).renounceOwnership();
    uint256 balance = IERC20(token).balanceOf(address(this));
    uint256 a8ToLP = curves[tokens[token].curveIndex].a8AtLaunch;
    uint256 fee = a8ToLP * migrationFee / BASIS;
    if (fee != 0) {
      pendingFees += fee;
    }

    // Add liquidity
    address pair = tokens[token].pair;
    IERC20(token).safeIncreaseAllowance(DOJO_ROUTER, balance);
    IERC20(A8_TOKEN).safeIncreaseAllowance(DOJO_ROUTER, a8ToLP - fee);
    
    // Calculate minimum amounts (1% slippage tolerance)
    uint256 amountAMin = balance * 99 / 100;
    uint256 amountBMin = (a8ToLP - fee) * 99 / 100;
    
    // Set deadline to 20 minutes from now
    uint256 deadline = block.timestamp + 20 minutes;
    
    try IDojoSwapRouter(DOJO_ROUTER).addLiquidity(
      token,          // tokenA address
      A8_TOKEN,       // tokenB address (A8)
      balance,        // amountA desired
      a8ToLP - fee,  // amountB desired
      amountAMin,    // amountA min
      amountBMin,    // amountB min
      DEAD_ADDRESS,  // LP tokens recipient
      deadline       // deadline
    ) {
      // Update Launch Status only if liquidity addition was successful
      tokens[token].hasLaunched = true;
      emit CurveCompleted(token, address(0), pair);
    } catch {
      // If addLiquidity fails, revert the whole transaction
      revert("SLOTH: LIQUIDITY_ADDITION_FAILED");
    }
  }

  function allTokensLength() external view returns (uint) {
    return allTokens.length;
  }
  
  // Owner
  function changeFeeReceiver(address payable feeReceiver_) external onlyOwner {
    feeReceiver = feeReceiver_;
  }

  function changeFee(uint256 newFee_) external onlyOwner {
    require(newFee_ <= 250, "Sloth: FEE_TOO_HIGH");
    tradingFee = newFee_;
  }

  function setIsPaused(bool isPaused_) external onlyOwner {
    isPaused = isPaused_;
  }

  function setMigrationFee(uint256 migrationFee_) external onlyOwner {
    require(migrationFee_ <= 1000, "Sloth: MIGRATION_FEE_TOO_HIGH");
    migrationFee = migrationFee_;
  }

  function setCreateFee(uint256 createFee_) external onlyOwner {
    require(createFee_ <= 50 ether, "Sloth: FEE_TOO_HIGH");
    createFee = createFee_;
  }

  function setCreatorRewards(uint256 creatorRewards_) external onlyOwner {
    require(creatorRewards_ <= 1000, "Sloth: CREATOR_REWARDS_TOO_HIGH");
    creatorRewards = creatorRewards_;
  }

   // Separate fee collection function
  function collectFees() external {
    uint256 amount = pendingFees;
    require(amount != 0, "No fees to collect");

    pendingFees = 0;
    IERC20(A8_TOKEN).safeTransfer(feeReceiver, amount);
  }
}