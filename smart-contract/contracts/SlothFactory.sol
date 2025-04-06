// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import {FullMath} from "./libraries/FullMath.sol";
import {ISlothFactory} from "./interfaces/ISlothFactory.sol";
import {ISloth} from "./interfaces/ISloth.sol";
import {IUniswapV2Factory} from "./interfaces/IUniswapV2Factory.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import "./SlothToken.sol";

contract SlothFactory is ISlothFactory, Initializable, Ownable {
    using Create2 for *;

    event CurveSet(
        uint256 totalSupply,
        uint256 saleAmount,
        uint256 tokenOffset,
        uint256 nativeOffset,
        address indexed factory
    );
    event ConfigurationSet(
        address feeTo,
        uint256 tradingFeeRate,
        uint256 listingFeeRate,
        uint256 creationFee,
        address native,
        address uniswapV2Factory,
        bool forLaunching,
        address indexed factory
    );
    event SlothCreated(
        address token,
        address sloth,
        address creator,
        uint256 totalSupply,
        uint256 saleAmount,
        uint256 tokenOffset,
        uint256 nativeOffset,
        uint256 tokenId,
        bool whitelistEnabled,
        address indexed factory
    );
    event SlothCreatedWithoutLaunching(
        address sloth,
        uint256 tokenId,
        address indexed factory
    );

    event BridgeSet(address);

    event SlothImplementationSet(address);

    event SignerSet(address);

    UpgradeableBeacon public beacon;
    address public signerAddress;
    address public bridge;
    address public feeTo;
    uint256 public totalSupply;
    uint256 public saleAmount;
    uint256 public tokenOffset;
    uint256 public nativeOffset;
    uint256 public tradingFeeRate;
    uint256 public listingFeeRate;
    uint256 public creationFee;
    address public native;
    address public uniswapV2Factory;
    bool public forLaunching;

    bytes tokenInitCode;

    constructor(address owner) Ownable(owner) {}

    function setSignerAddress(address _signer) external onlyOwner {
        _setSignerAddress(_signer);
    }

    function _setSignerAddress(address _signer) internal {
        signerAddress = _signer;
        emit SignerSet(_signer);
    }

    function setBridge(address _bridge) external onlyOwner {
        _setBridge(_bridge);
        emit BridgeSet(_bridge);
    }

    function _setBridge(address _bridge) internal {
        bridge = _bridge;
        emit BridgeSet(_bridge);
    }

    function initialize(
        InitializationParams calldata params
    ) public onlyOwner initializer {
        beacon = new UpgradeableBeacon(params.slothImplementation, address(this));

        uniswapV2Factory = params.uniswapV2Factory;
        native = params.native;
        signerAddress = params.signerAddress;

        feeTo = params.feeTo;

        tradingFeeRate = params.tradingFeeRate;
        listingFeeRate = params.listingFeeRate;
        creationFee = params.creationFee;

        totalSupply = params.totalSupply;
        saleAmount = params.saleAmount;
        tokenOffset = params.tokenOffset;
        nativeOffset = params.nativeOffset;

        forLaunching = true;
    }

    function initializeWithoutLaunching() external onlyOwner initializer {
        forLaunching = false;
    }

    function setUniV2Factory(address _univ2Factory) external onlyOwner {
        _setUniV2Factory(_univ2Factory);
    }
    function _setUniV2Factory(address _univ2Factory) internal {
        uniswapV2Factory = _univ2Factory;
        _emitConfigurationSet();
    }

    function setSlothImplementation(address _implementation) external onlyOwner {
        _setSlothImplementation(_implementation);
    }
    function _setSlothImplementation(address _implementation) internal {
        beacon.upgradeTo(_implementation);
        emit SlothImplementationSet(_implementation);
    }
    function setNative(address _native) external onlyOwner {
        _setNative(_native);
    }

    function _setNative(address _native) internal {
        native = _native;
        _emitConfigurationSet();
    }

    function setForLaunching(bool _forLaunching) external onlyOwner {
        _setForLaunching(_forLaunching);
    }

    function _setForLaunching(bool _forLaunching) internal {
        forLaunching = _forLaunching;
        _emitConfigurationSet();
    }

    function setCreationFee(uint256 _creationFee) external onlyOwner {
        _setCreationFee(_creationFee);
    }

    function _setCreationFee(uint256 _creationFee) internal {
        creationFee = _creationFee;
        _emitConfigurationSet();
    }

    function setListingFeeRate(uint256 _listingFee) external onlyOwner {
        _setListingFeeRate(_listingFee);
        _emitConfigurationSet();
    }

    function _setListingFeeRate(uint256 _listingFee) internal {
        listingFeeRate = _listingFee;
        _emitConfigurationSet();
    }

    function setFeeTo(address _feeTo) external onlyOwner {
        _setFeeTo(_feeTo);
    }

    function _setFeeTo(address _feeTo) internal {
        feeTo = _feeTo;

        _emitConfigurationSet();
    }

    function setTradingFeeRate(uint256 _fee) external onlyOwner {
        _setTradingFeeRate(_fee);
    }

    function _setTradingFeeRate(uint256 _fee) internal {
        tradingFeeRate = _fee;
        _emitConfigurationSet();
    }

    function setCurveConfiguration(
        uint256 _totalSupply,
        uint256 _saleAmount,
        uint256 _tokenOffset,
        uint256 _nativeOffset
    ) external onlyOwner {
        totalSupply = _totalSupply;
        saleAmount = _saleAmount;
        tokenOffset = _tokenOffset;
        nativeOffset = _nativeOffset;
        emit CurveSet(
            totalSupply,
            saleAmount,
            tokenOffset,
            nativeOffset,
            address(this)
        );
    }

    function create(
        SlothCreationParams memory params
    ) external returns (address token, address sloth) {
        require(forLaunching, "Only in launching mode");

        bytes32 salt = keccak256(abi.encodePacked(params.tokenId));

        token = Create2.deploy(
            0,
            salt,
            abi.encodePacked(type(SlothToken).creationCode)
        );

        bytes32 pumpSalt = keccak256(abi.encodePacked(token));

        address uniswapPair = IUniswapV2Factory(uniswapV2Factory).getPair(
            token,
            address(native)
        );

        if (uniswapPair == address(0)) {
            uniswapPair = IUniswapV2Factory(uniswapV2Factory).createPair(
                token,
                address(native)
            );
        }

        sloth = Create2.deploy(
            0,
            pumpSalt,
            abi.encodePacked(
                type(BeaconProxy).creationCode,
                abi.encode(address(beacon), "")
            )
        );

        SlothToken(token).initialize(
            params.name,
            params.symbol,
            sloth,
            uniswapPair,
            totalSupply
        );

        IERC20(token).transfer(sloth, totalSupply);

        ISloth(sloth).initialize(
            token,
            native,
            uniswapV2Factory,
            uniswapPair,
            saleAmount,
            tokenOffset,
            nativeOffset
        );

        emit SlothCreated(
            token,
            sloth,
            msg.sender,
            totalSupply,
            saleAmount,
            tokenOffset,
            nativeOffset,
            params.tokenId,
            false,
            address(this)
        );

        if (params.initialDeposit > 0) {
            require(
                IERC20(native).transferFrom(
                    msg.sender,
                    address(this),
                    params.initialDeposit
                ),
                "Failed to transfer native for the first buy"
            );

            IERC20(native).transfer(sloth, params.initialDeposit);
            ISloth(sloth).initialBuy(params.initialDeposit, msg.sender);
        }

        if (creationFee > 0) {
            require(
                IERC20(native).transferFrom(msg.sender, feeTo, creationFee),
                "Failed to pay creation fee"
            );
        }
    }

    function createWithoutLaunching(
        string calldata _name,
        string calldata _symbol,
        uint256 _tokenId,
        uint256 _totalSupply,
        address _supplyRecipient
    ) external onlyOwner returns (address token) {
        require(!forLaunching, "Only in non-launching mode");

        bytes32 salt = keccak256(abi.encodePacked(_tokenId));

        token = Create2.deploy(
            0,
            salt,
            type(SlothToken).creationCode
        );

        SlothToken(token).initializeWithoutLaunching(
            _name,
            _symbol,
            _totalSupply,
            _supplyRecipient
        );

        emit SlothCreatedWithoutLaunching(token, _tokenId, address(this));
    }

    function getTokenAddressByTokenId(uint256 _tokenId) public view returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(_tokenId));

        return Create2.computeAddress(
            salt,
            keccak256(abi.encodePacked(type(SlothToken).creationCode))
        );
    }

    function getTokenAddressByAddress(
        address tokenAddress
    ) public view returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(tokenAddress));
        bytes memory bytecode = abi.encodePacked(
            type(BeaconProxy).creationCode,
            abi.encode(address(beacon), "")
        );
        bytes32 bytecodeHash = keccak256(bytecode);
        return Create2.computeAddress(salt, bytecodeHash);
    }

    function _emitConfigurationSet() private {
        emit ConfigurationSet(
            feeTo,
            tradingFeeRate,
            listingFeeRate,
            creationFee,
            native,
            uniswapV2Factory,
            forLaunching,
            address(this)
        );
    }

}
