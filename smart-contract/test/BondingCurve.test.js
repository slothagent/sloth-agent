const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BondingCurve", function () {
  let bondingCurve;
  let token;
  let owner;
  let buyer;
  let seller;
  
  const INITIAL_SUPPLY = ethers.parseEther("1000"); // 1000 tokens
  const SLOPE = ethers.parseEther("0.0000000001"); // Very small slope for gradual price increase
  const BASE_PRICE = ethers.parseEther("0.00000001"); // Initial price at 0.00000001 ETH
  
  beforeEach(async function () {
    // Get signers
    [owner, buyer, seller] = await ethers.getSigners();
    
    // Deploy mock ERC20 token
    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy("Test Token", "TEST", INITIAL_SUPPLY);
    await token.waitForDeployment();
    
    // Deploy BondingCurve
    const BondingCurve = await ethers.getContractFactory("BondingCurve");
    bondingCurve = await BondingCurve.deploy(
      await token.getAddress(),
      SLOPE,
      BASE_PRICE
    );
    await bondingCurve.waitForDeployment();
    
    // Transfer some tokens to the bonding curve
    await token.transfer(await bondingCurve.getAddress(), ethers.parseEther("500")); // Transfer half of supply
    
    // Send some ETH to the contract for sell tests
    await owner.sendTransaction({
      to: await bondingCurve.getAddress(),
      value: ethers.parseEther("1") // 1 ETH for tests
    });
  });
  
  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      expect(await bondingCurve.token()).to.equal(await token.getAddress());
    });
    
    it("Should set the correct slope", async function () {
      expect(await bondingCurve.slope()).to.equal(SLOPE);
    });
    
    it("Should set the correct base price", async function () {
      expect(await bondingCurve.basePrice()).to.equal(BASE_PRICE);
    });
  });
  
  describe("Price Calculation", function () {
    it("Should calculate correct price for buying tokens", async function () {
      const amount = ethers.parseEther("1");
      const price = await bondingCurve.calculatePrice(amount);
      expect(price).to.be.gt(0);
    });
    
    it("Should return higher prices for larger amounts", async function () {
      const smallAmount = ethers.parseEther("1");
      const largeAmount = ethers.parseEther("10");
      
      const smallPrice = await bondingCurve.calculatePrice(smallAmount);
      const largePrice = await bondingCurve.calculatePrice(largeAmount);
      
      expect(largePrice).to.be.gt(smallPrice);
    });
  });
  
  describe("Buying Tokens", function () {
    it("Should allow buying tokens with correct ETH amount", async function () {
      const buyAmount = ethers.parseEther("1");
      const price = await bondingCurve.calculatePrice(buyAmount);
      
      const initialBalance = await token.balanceOf(buyer.address);
      const initialEthBalance = await ethers.provider.getBalance(buyer.address);
      
      const tx = await bondingCurve.connect(buyer).buy(buyAmount, { value: price });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await token.balanceOf(buyer.address);
      const finalEthBalance = await ethers.provider.getBalance(buyer.address);
      
      expect(finalBalance - initialBalance).to.equal(buyAmount);
      expect(initialEthBalance - finalEthBalance - gasUsed).to.equal(price);
    });
    
    it("Should refund excess ETH", async function () {
      const buyAmount = ethers.parseEther("1");
      const price = await bondingCurve.calculatePrice(buyAmount);
      const excess = ethers.parseEther("0.0001"); // Small excess amount
      
      const initialEthBalance = await ethers.provider.getBalance(buyer.address);
      
      const tx = await bondingCurve.connect(buyer).buy(buyAmount, { value: price + excess });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalEthBalance = await ethers.provider.getBalance(buyer.address);
      
      // Should only deduct price + gas, not the excess
      expect(initialEthBalance - finalEthBalance - gasUsed).to.equal(price);
    });
  });
  
  describe("Selling Tokens", function () {
    beforeEach(async function () {
      // Buy some tokens first
      const buyAmount = ethers.parseEther("10");
      const price = await bondingCurve.calculatePrice(buyAmount);
      await bondingCurve.connect(seller).buy(buyAmount, { value: price });
      await token.connect(seller).approve(await bondingCurve.getAddress(), buyAmount);
    });
    
    it("Should allow selling tokens for correct ETH amount", async function () {
      const sellAmount = ethers.parseEther("1");
      const price = await bondingCurve.calculatePrice(sellAmount);
      
      const initialEthBalance = await ethers.provider.getBalance(seller.address);
      
      const tx = await bondingCurve.connect(seller).sell(sellAmount, 0);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalEthBalance = await ethers.provider.getBalance(seller.address);
      
      // Should receive price - gas
      expect(finalEthBalance - initialEthBalance + gasUsed).to.equal(price);
    });
  });
  
  describe("Admin Functions", function () {
    it("Should allow owner to update slope", async function () {
      const newSlope = ethers.parseEther("0.000002");
      await bondingCurve.updateSlope(newSlope);
      expect(await bondingCurve.slope()).to.equal(newSlope);
    });
    
    it("Should allow owner to update base price", async function () {
      const newBasePrice = ethers.parseEther("0.000002");
      await bondingCurve.updateBasePrice(newBasePrice);
      expect(await bondingCurve.basePrice()).to.equal(newBasePrice);
    });
    
    it("Should prevent non-owner from updating slope", async function () {
      const newSlope = ethers.parseEther("0.000002");
      await expect(
        bondingCurve.connect(buyer).updateSlope(newSlope)
      ).to.be.revertedWithCustomError(bondingCurve, "OwnableUnauthorizedAccount");
    });
  });
}); 