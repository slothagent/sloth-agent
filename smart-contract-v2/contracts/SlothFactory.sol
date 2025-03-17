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
import "contracts/pharaoh/interfaces/IPharaohRouter.sol";
import "contracts/pharaoh/interfaces/IPharaohFactory.sol";

pragma solidity ^0.8.17;

contract SlothFactory is Ownable2Step, ReentrancyGuard {
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
  address payable public immutable SHADOW_ROUTER;
  address private constant DEAD_ADDRESS = address(0xdead);
  // Constants
  uint256 private constant ETHER = 1 ether;
  uint256 private constant BIN_WIDTH = 2000;
  uint256 private constant BASIS = 10000;
  uint256 private constant COEF = 2;
  uint256 private constant MIN_IN = 1 ether;
  uint256 private constant MIN_OUT = 0.2 ether;

  struct Curve {
    uint256[] distribution;
    uint256 percentOfLP; // 5000 = 50%
    uint256 avaxAtLaunch;
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

  constructor(address msig, address shadowRouter_) Ownable(msig) {
    require(msig != address(0), "Zero address not allowed for owner");
    require(shadowRouter_ != address(0), "Zero address not allowed for router");
    SHADOW_ROUTER = payable(shadowRouter_);
    feeReceiver = payable(msig);
    tradingFee = 100; // 1%
    migrationFee = 400;
    createFee = 1 ether;
    creatorRewards = 300; // 3%
  }

  function createToken(
    string memory name_,
    string memory symbol_,
    uint112 totalSupply_,
    uint8 curveIndex_
  ) external payable nonReentrant {
    Curve memory curve = curves[curveIndex_];
    uint256 percent = curve.percentOfLP;
    uint256[] memory arr = curve.distribution;
    uint256 createFee_ = createFee;
    require(!isPaused, "Sloth: TOKEN_CREATION_IS_PAUSED");
    require(percent != 0, "Sloth: CURVE_DOES_NOT_EXIST");
    require(totalSupply_ >= 1 ether, "Sloth: TOTAL_SUPPLY_TOO_LOW");
    require(msg.value <= 500 ether + createFee_, "Sloth: TOO_MUCH_ETH");
    require(msg.value >= createFee_, "Sloth: TOO_LITTLE_ETH");
    SlothToken token = new SlothToken(name_, symbol_, totalSupply_);

    address t = address(token);
    allTokens.push(t);
    uint256 supply = uint256(totalSupply_ * percent / BASIS); 

    tokens[t].initialSupply = supply;
    tokens[t].currentValue = supply * arr[0] / BASIS;
    tokens[t].curveIndex = curveIndex_;
    tokens[t].creator = msg.sender;
    
    // Create pair initially
    address factory = IPharaohRouter(SHADOW_ROUTER).factory();
    address weth = IPharaohRouter(SHADOW_ROUTER).WETH();
    address pair = IPharaohFactory(factory).createPair(t, weth, false);  
    tokens[t].pair = pair;

    emit TokenCreated(t, msg.sender, curveIndex_);
    pendingFees += createFee_;
    if (msg.value != createFee_) {
      _buy(t, msg.sender, msg.value - createFee_, 0);
    }
  }

  function createCurve(uint8 index, uint256[] memory lists) external onlyOwner {
    require(curves[index].percentOfLP == 0, "Sloth: CURVE_ALREADY_IN_USE");
    uint256 totalDistribution = 0;
    // Amount of AVAX
    uint256 cumulativeValue = 0;
    uint256 length = lists.length;
    // Calculate the cumulative value and track the last non-zero bin
    for (uint256 i = 0; i < length; ++i) {
      require(lists[i] != 0, "Sloth: INVALID_BIN");
      totalDistribution += lists[i];
      uint256 price = ETHER * (BASIS + (i * BIN_WIDTH)) / BASIS;
      cumulativeValue += lists[i] * price;
    }

    // Ensure the total distribution equals 10,000 (in basis points)
    require(totalDistribution == BASIS, "Sloth: INVALID_TOTAL_DISTRIBUTION");

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
    require(t.initialSupply != 0, "Sloth: TOKEN_DOES_NOT_EXIST");
    require(!t.hasLaunched, "Sloth: INSUFFICIENT_LIQUIDITY");
    require(deadline >= block.timestamp, "Sloth: EXPIRED");

    // Try to use permit if supported
    try IERC20Permit(token).permit(msg.sender, address(this), amount0In, deadline, v, r, s) {
      // Permit successful
    } catch {
      // Token doesn't support permit or invalid signature, fallback to regular transfer
    }

    IERC20(token).safeTransferFrom(msg.sender, address(this), amount0In);

    uint256[] memory arr = curves[t.curveIndex].distribution;
    uint256 amount1Out;
    uint256 amount0Used;
    uint256 i = t.currentIndex;
    uint256 currentValue = t.currentValue;
    uint256 initialSupply = t.initialSupply;

    while (amount0Used < amount0In) {
      uint256 amountPerAVAX = initialSupply * COEF / (BASIS + (BIN_WIDTH * i));
      uint256 amount0Remaining = amount0In - amount0Used;
      uint256 amount0InBin = currentValue;
      uint256 amount0InBinMax = arr[i] * initialSupply / BASIS;
      if (amount0InBin + amount0Remaining <= amount0InBinMax) {
        amount1Out += amount0Remaining * ETHER / amountPerAVAX;
        currentValue += amount0Remaining;
        break;
      } else {
        uint256 fillBin = amount0InBinMax - amount0InBin;
        amount0Used += fillBin;
        amount1Out += fillBin * ETHER / amountPerAVAX;
        i--;
        currentValue = 0;
      }
    }
    require(amount1OutMin <= amount1Out, "Sloth: SLIPPAGE_LIMIT");
    require(amount1Out >= MIN_OUT, "Sloth: INSUFFICIENT_ETH_OUT");
    t.currentIndex = i;
    t.currentValue = currentValue;
    
    uint256 fee = amount1Out * tradingFee / BASIS;
    pendingFees += fee;
    payable(msg.sender).sendValue(amount1Out - fee);
    emit SlothSwap(token, msg.sender, amount0In, 0, 0, amount1Out);
  }

  // Keep existing sell function for backward compatibility
  function sell(address token, uint256 amount0In, uint256 amount1OutMin) external nonReentrant {
    Token storage t = tokens[token];
    require(t.initialSupply != 0, "Sloth: TOKEN_DOES_NOT_EXIST");
    require(!t.hasLaunched, "Sloth: INSUFFICIENT_LIQUIDITY");
    IERC20(token).safeTransferFrom(msg.sender, address(this), amount0In);

    uint256[] memory arr = curves[t.curveIndex].distribution;
    uint256 amount1Out;
    uint256 amount0Used;
    uint256 i = t.currentIndex;
    uint256 currentValue = t.currentValue;
    uint256 initialSupply = t.initialSupply;

    while (amount0Used < amount0In) {
      uint256 amountPerAVAX = initialSupply * COEF / (BASIS + (BIN_WIDTH * i));
      uint256 amount0Remaining = amount0In - amount0Used;
      uint256 amount0InBin = currentValue;
      uint256 amount0InBinMax = arr[i] * initialSupply / BASIS;
      if (amount0InBin + amount0Remaining <= amount0InBinMax) {
        amount1Out += amount0Remaining * ETHER / amountPerAVAX;
        currentValue += amount0Remaining;
        break;
      } else {
        uint256 fillBin = amount0InBinMax - amount0InBin;
        amount0Used += fillBin;
        amount1Out += fillBin * ETHER / amountPerAVAX;
        i--;
        currentValue = 0;
      }
    }
    require(amount1OutMin <= amount1Out, "Sloth: SLIPPAGE_LIMIT");
    require(amount1Out >= MIN_OUT, "Sloth: INSUFFICIENT_ETH_OUT");
    t.currentIndex = i;
    t.currentValue = currentValue;
    
    uint256 fee = amount1Out * tradingFee / BASIS;
    pendingFees += fee;
    payable(msg.sender).sendValue(amount1Out - fee);
    emit SlothSwap(token, msg.sender, amount0In, 0, 0, amount1Out);
  }

  function buy(address token, uint256 amount0OutMin) external payable nonReentrant {
    require(msg.value >= MIN_IN, "Sloth: TOO_LOW");
    _buy(token, msg.sender, msg.value, amount0OutMin);
  }

  function _buy(address token, address sender, uint256 amount1In, uint256 amount0OutMin) internal {
    Token storage t = tokens[token];
    require(t.initialSupply != 0, "Sloth: TOKEN_DOES_NOT_EXIST");
    require(!t.hasLaunched, "Sloth: ALREADY_LAUNCHED");
    uint256[] memory arr = curves[t.curveIndex].distribution;
    uint256 fee = amount1In * tradingFee / BASIS;
    uint256 value = amount1In - fee;
    uint256 amount0Out;
    uint256 amount1Used;
    uint256 i = t.currentIndex;
    uint256 currentValue = t.currentValue;
    uint256 initialSupply = t.initialSupply;
    while (amount1Used < value) {
      uint256 amountPerAVAX = initialSupply * COEF / (BASIS + (BIN_WIDTH * i));
      uint256 valueLeft = value - amount1Used;
      uint256 amount0InBin = currentValue;

      if (amount0InBin > valueLeft * amountPerAVAX / ETHER) {
        uint256 outputAmount = amountPerAVAX * valueLeft / ETHER;

        amount1Used += valueLeft;
        amount0Out += outputAmount;
        currentValue = amount0InBin - outputAmount;
        break;
      } else {
        amount1Used += amount0InBin * ETHER / amountPerAVAX;
        amount0Out += amount0InBin;
        ++i;
        if (i < arr.length) {
          currentValue = arr[i] * initialSupply / BASIS;
        } else {
          break;
        }
      }
    }
    require(amount0OutMin <= amount0Out, "Sloth: SLIPPAGE_LIMIT");
    t.currentIndex = i;
    t.currentValue = currentValue;
    pendingFees += fee;
    IERC20(token).safeTransfer(sender, amount0Out);
    emit SlothSwap(token, sender, 0, amount0Out, amount1In, 0);
    if (i >= arr.length) {
      payable(sender).sendValue(value - amount1Used);
      _launchToken(token);
    }
  }

  function _launchToken(address token) internal {
    require(!tokens[token].hasLaunched, "Sloth: ALREADY_LAUNCHED");

    // Allow Transfers
    IOwnable(token).renounceOwnership();
    uint256 balance = IERC20(token).balanceOf(address(this));
    uint256 avaxToLP = curves[tokens[token].curveIndex].avaxAtLaunch;
    uint256 fee = avaxToLP * migrationFee / BASIS;
    if (fee != 0) {
      pendingFees += fee;
    }

    // Add liquidity
    address pair = tokens[token].pair;
    IERC20(token).safeIncreaseAllowance(SHADOW_ROUTER, balance);
    IPharaohRouter(SHADOW_ROUTER).addLiquidityETH{value: avaxToLP - fee}(
      token,
      false,
      balance,
      0, // slippage is unavoidable
      0, // slippage is unavoidable
      DEAD_ADDRESS,
      block.timestamp
    );

    // Update Launch Status
    tokens[token].hasLaunched = true;
    emit CurveCompleted(token, address(0), pair);
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
    feeReceiver.sendValue(amount);
  }
}