const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BondingCurve", function () {
  let bondingCurve;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // Constants from the contract
  const MEMETOKEN_CREATION_PLATFORM_FEE = ethers.parseEther("0.003");
  const MEMECOIN_FUNDING_GOAL = ethers.parseEther("24");
  const DECIMALS = ethers.parseUnits("1", 18);
  const MAX_SUPPLY = ethers.parseUnits("1000000", 18);
  const INIT_SUPPLY = MAX_SUPPLY * BigInt(2) / BigInt(100); // 2% of MAX_SUPPLY

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy BondingCurve contract
    const BondingCurve = await ethers.getContractFactory("BondingCurve");
    bondingCurve = await BondingCurve.deploy();
    await bondingCurve.waitForDeployment();
  });

  describe("Token Creation", function () {
    it("Should create a new meme token with correct parameters", async function () {
      const tokenName = "Test Meme Token";
      const tokenSymbol = "TMT";
      const imageUrl = "https://example.com/image.png";
      const description = "Test meme token description";
      const contractURI = "https://example.com/metadata.json";

      // Create token with platform fee
      await expect(bondingCurve.createMemeToken(
        tokenName,
        tokenSymbol,
        imageUrl,
        description,
        contractURI,
        { value: MEMETOKEN_CREATION_PLATFORM_FEE }
      )).to.emit(bondingCurve, "MemeTokenCreated");

      // Get all tokens and verify the created token
      const allTokens = await bondingCurve.getAllMemeTokens();
      expect(allTokens.length).to.equal(1);
      expect(allTokens[0].name).to.equal(tokenName);
      expect(allTokens[0].symbol).to.equal(tokenSymbol);
      expect(allTokens[0].description).to.equal(description);
      expect(allTokens[0].tokenImageUrl).to.equal(imageUrl);
      expect(allTokens[0].fundingRaised).to.equal(0);
      expect(allTokens[0].creatorAddress).to.equal(owner.address);
    });

    it("Should fail to create token without platform fee", async function () {
      await expect(bondingCurve.createMemeToken(
        "Test Token",
        "TT",
        "url",
        "desc",
        "uri"
      )).to.be.revertedWith("Fee not paid for memetoken creation");
    });
  });

  describe("Token Purchase", function () {
    let memeTokenAddress;

    beforeEach(async function () {
      // Create a token before each test
      const tx = await bondingCurve.createMemeToken(
        "Test Token",
        "TT",
        "url",
        "desc",
        "uri",
        { value: MEMETOKEN_CREATION_PLATFORM_FEE }
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => 
        log.fragment && log.fragment.name === 'MemeTokenCreated'
      );
      memeTokenAddress = event.args[0];
    });

    it("Should allow buying tokens with correct ETH amount", async function () {
      const tokenQty = BigInt(100); // Amount of tokens to buy
      const estimatedCost = await bondingCurve.calculateCost(0n, tokenQty);
      
      await expect(bondingCurve.connect(addr1).buyMemeToken(
        memeTokenAddress,
        tokenQty,
        { value: estimatedCost }
      )).to.emit(bondingCurve, "Buy");

      // Get token contract using the correct path
      const TokenERC20 = await ethers.getContractFactory("contracts/Token.sol:TokenERC20");
      const tokenContract = TokenERC20.attach(memeTokenAddress);
      
      // Check buyer's balance
      const balance = await tokenContract.balanceOf(addr1.address);
      expect(balance).to.equal(tokenQty * DECIMALS);
    });

    it("Should fail when trying to buy more than available supply", async function () {
      const tooManyTokens = BigInt(1000001); // More than MAX_SUPPLY
      
      await expect(bondingCurve.connect(addr1).buyMemeToken(
        memeTokenAddress,
        tooManyTokens,
        { value: ethers.parseEther("1000") }
      )).to.be.revertedWith("Insufficient supply");
    });

    it("Should fail when not enough ETH is sent", async function () {
      const tokenQty = BigInt(100);
      const estimatedCost = await bondingCurve.calculateCost(0n, tokenQty);
      const tooLittleETH = estimatedCost - ethers.parseEther("0.1"); // Less than required
      
      await expect(bondingCurve.connect(addr1).buyMemeToken(
        memeTokenAddress,
        tokenQty,
        { value: tooLittleETH }
      )).to.be.revertedWith("Insufficient ETH sent");
    });
  });

  describe("Price Calculation", function () {
    it("Should calculate correct price for different quantities", async function () {
      // Test various token quantities
      const quantities = [1n, 10n, 100n, 1000n];
      
      for (const qty of quantities) {
        const price = await bondingCurve.calculateCost(0n, qty);
        expect(price).to.be.gt(0);
        
        // Price should increase with quantity
        if (qty > 1n) {
          const smallerPrice = await bondingCurve.calculateCost(0n, qty - 1n);
          expect(price).to.be.gt(smallerPrice);
        }
      }
    });

    it("Should have increasing marginal prices", async function () {
      // Test that price increases are accelerating (convex curve)
      const price1 = await bondingCurve.calculateCost(0n, 1n);
      const price10 = await bondingCurve.calculateCost(0n, 10n);
      const price20 = await bondingCurve.calculateCost(0n, 20n);
      
      const increase1to10 = price10 - price1;
      const increase10to20 = price20 - price10;
      
      expect(increase10to20).to.be.gt(increase1to10);
    });
  });

  describe("Funding Goal", function () {
    let memeTokenAddress;

    beforeEach(async function () {
      const tx = await bondingCurve.createMemeToken(
        "Test Token",
        "TT",
        "url",
        "desc",
        "uri",
        { value: MEMETOKEN_CREATION_PLATFORM_FEE }
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => 
        log.fragment && log.fragment.name === 'MemeTokenCreated'
      );
      memeTokenAddress = event.args[0];
    });

    it("Should emit FundingGoalReached event when goal is met", async function () {
      // Buy enough tokens to reach funding goal
      const largeAmount = BigInt(1000);
      await expect(bondingCurve.connect(addr1).buyMemeToken(
        memeTokenAddress,
        largeAmount,
        { value: MEMECOIN_FUNDING_GOAL }
      )).to.emit(bondingCurve, "FundingGoalReached");
    });

    it("Should prevent purchases after funding goal is met", async function () {
      // First purchase to reach funding goal
      await bondingCurve.connect(addr1).buyMemeToken(
        memeTokenAddress,
        BigInt(1000),
        { value: MEMECOIN_FUNDING_GOAL }
      );

      // Attempt to purchase after goal is met
      await expect(bondingCurve.connect(addr2).buyMemeToken(
        memeTokenAddress,
        BigInt(10),
        { value: ethers.parseEther("1") }
      )).to.be.revertedWith("Funding goal met");
    });
  });
}); 