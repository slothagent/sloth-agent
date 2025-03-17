// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ISlothNursery.sol";

pragma solidity ^0.8.0;

contract SlothNursery is ISlothNursery, ReentrancyGuard {
  using SafeERC20 for IERC20;

  address public immutable token;
  address public immutable pair;
  uint256 public immutable startTime;
  uint256 public immutable PERCENT_PER_EPOCH; // 25 = 0.25%
  uint256 private constant BASIS = 10000;

  struct Share {
    uint256 amount;
    uint256 lastClaimedEpoch;
  }

  uint256 public totalShares;
  mapping(address => Share) public shares;

  event Deposit (
    address indexed sender,
    uint256 amount
  );

  event Withdrawal (
    address indexed sender,
    uint256 amount
  );

  event EmergencyWithdrawal(
    address indexed sender,
    uint256 amount
  );

  event ClaimRewards (
    address indexed sender,
    uint256 lpAmount
  );

  constructor(address token_, address pair_, uint256 percentPerEpoch_) {
    // Factory contract handles this
    PERCENT_PER_EPOCH = percentPerEpoch_;
    token = token_;
    pair = pair_;
    startTime = block.timestamp;
  }

  function deposit(uint256 amount) external nonReentrant {
    IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    _claimRewards(msg.sender);
    shares[msg.sender].amount += amount;
    totalShares += amount;
    emit Deposit(msg.sender, amount);
  }

  function withdraw(uint256 amount) external nonReentrant {
    require(amount <= shares[msg.sender].amount, "Sloth: NOT_ENOUGH_BALANCE");
    _claimRewards(msg.sender);
    shares[msg.sender].amount -= amount;
    totalShares -= amount;
    IERC20(token).safeTransfer(msg.sender, amount);
    emit Withdrawal(msg.sender, amount);
  }

  function claimRewards() external nonReentrant{
    _claimRewards(msg.sender);
  }

  // In case of emergency. WILL NOT CLAIM REWARDS.
  function emergencyWithdrawal() external nonReentrant {
    uint256 amount = shares[msg.sender].amount;
    totalShares -= amount;
    shares[msg.sender].amount = 0;
    IERC20(token).safeTransfer(msg.sender, amount);
    emit EmergencyWithdrawal(msg.sender, amount);
  }

  function _claimRewards(address shareholder) internal {
    uint256 amount = getUnpaidEarnings(shareholder);
    shares[shareholder].lastClaimedEpoch = getCurrentEpoch();
    IERC20(pair).safeTransfer(shareholder, amount);
    emit ClaimRewards(shareholder, amount);
  }

  function getUnpaidEarnings(address shareholder) public view returns (uint256) {
    uint256 epoch = getCurrentEpoch();
    Share memory share = shares[shareholder];
    
    uint256 totalShares_ = totalShares;
    if (totalShares_ == 0) { return 0; }
    if (share.lastClaimedEpoch < epoch) {
      if (epoch - share.lastClaimedEpoch >= BASIS / PERCENT_PER_EPOCH) {
        return IERC20(pair).balanceOf(address(this))
          * share.amount
          / totalShares_;
      }
      else {
        return IERC20(pair).balanceOf(address(this))
          * share.amount
          * PERCENT_PER_EPOCH
          * (epoch - share.lastClaimedEpoch)
          / totalShares_
          / BASIS;
      }
    }
    return 0;
  }

  function getCurrentEpoch() public view returns (uint256) {
    return (block.timestamp - startTime) / 6 hours;
  }
}