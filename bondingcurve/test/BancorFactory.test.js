const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BancorFactory", function () {
  let BancorFactory, bancorFactory;
  let BancorFormula, bancorFormula;
  let SimpleToken, usdc;
  let owner, user1, user2, treasury;
  const CREATION_FEE = ethers.parseUnits("100", 6); // 100 USDC

  beforeEach(async function () {
    [owner, user1, user2, treasury] = await ethers.getSigners();

    // Deploy BancorFormula
    BancorFormula = await ethers.getContractFactory("BancorFormula");
    bancorFormula = await BancorFormula.deploy();

    // Deploy mock USDC
    SimpleToken = await ethers.getContractFactory("SimpleToken");
    usdc = await SimpleToken.deploy("USD Coin", "USDC", "6"); // Pass decimals as string

    // Deploy BancorFactory
    BancorFactory = await ethers.getContractFactory("BancorFactory");
    bancorFactory = await BancorFactory.deploy(bancorFormula.address);

    // Setup factory
    await bancorFactory.setCreationFee(CREATION_FEE);
    await bancorFactory.setTreasury(treasury.address);

    // Mint some USDC to users
    await usdc.mint(user1.address, ethers.parseUnits("1000", 6));
    await usdc.mint(user2.address, ethers.parseUnits("1000", 6));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await bancorFactory.owner()).to.equal(owner.address);
    });

    it("Should set the correct formula address", async function () {
      expect(await bancorFactory.formulaAddress()).to.equal(bancorFormula.address);
    });
  });

  describe("Token Creation", function () {
    beforeEach(async function () {
      // Approve factory to spend USDC
      await usdc.connect(user1).approve(bancorFactory.address, CREATION_FEE);
    });

    it("Should create a new token", async function () {
      const tx = await bancorFactory.connect(user1).createToken(
        "Test Token",
        "TEST",
        "ipfs://test",
        3000, // 30% reserve ratio
        usdc.address
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === 'TokenCreated');
      const tokenAddress = event.args.token;

      expect(await bancorFactory.isValidToken(tokenAddress)).to.be.true;
      expect(await bancorFactory.tokenCreator(tokenAddress)).to.equal(user1.address);

      const metadata = await bancorFactory.tokenMetadata(tokenAddress);
      expect(metadata.name).to.equal("Test Token");
      expect(metadata.symbol).to.equal("TEST");
      expect(metadata.tokenURI).to.equal("ipfs://test");
      expect(metadata.reserveWeight).to.equal(3000);
      expect(metadata.reserveToken).to.equal(usdc.address);
    });

    it("Should fail if creation fee is not approved", async function () {
      await usdc.connect(user1).approve(bancorFactory.address, 0);
      
      await expect(bancorFactory.connect(user1).createToken(
        "Test Token",
        "TEST",
        "ipfs://test",
        3000,
        usdc.address
      )).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should fail with invalid reserve ratio", async function () {
      await expect(bancorFactory.connect(user1).createToken(
        "Test Token",
        "TEST",
        "ipfs://test",
        10001, // More than 100%
        usdc.address
      )).to.be.revertedWith("Invalid reserve weight");
    });
  });

  describe("Fee Management", function () {
    it("Should update creation fee", async function () {
      const newFee = ethers.parseUnits("200", 6);
      await bancorFactory.setCreationFee(newFee);
      expect(await bancorFactory.creationFee()).to.equal(newFee);
    });

    it("Should fail if non-owner tries to update fee", async function () {
      const newFee = ethers.parseUnits("200", 6);
      await expect(
        bancorFactory.connect(user1).setCreationFee(newFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should update treasury address", async function () {
      const newTreasury = user2.address;
      await bancorFactory.setTreasury(newTreasury);
      expect(await bancorFactory.treasury()).to.equal(newTreasury);
    });
  });

  describe("Token Tracking", function () {
    it("Should track all created tokens", async function () {
      await usdc.connect(user1).approve(bancorFactory.address, CREATION_FEE * BigInt(2));

      // Create two tokens
      await bancorFactory.connect(user1).createToken(
        "Token1",
        "TK1",
        "ipfs://token1",
        3000,
        usdc.address
      );

      await bancorFactory.connect(user1).createToken(
        "Token2",
        "TK2",
        "ipfs://token2",
        4000,
        usdc.address
      );

      expect(await bancorFactory.getTokenCount()).to.equal(2);
      
      const allTokens = await bancorFactory.getAllTokens();
      expect(allTokens.length).to.equal(2);
    });
  });

  describe("Funding Tracking", function () {
    let tokenAddress;

    beforeEach(async function () {
      await usdc.connect(user1).approve(bancorFactory.address, CREATION_FEE);
      const tx = await bancorFactory.connect(user1).createToken(
        "Test Token",
        "TEST",
        "ipfs://test",
        3000,
        usdc.address
      );
      const receipt = await tx.wait();
      tokenAddress = receipt.events.find(e => e.event === 'TokenCreated').args.token;
    });

    it("Should track funding raised", async function () {
      const funding = await bancorFactory.getFundingRaised(tokenAddress);
      expect(funding).to.equal(0); // Initially 0 as only initial reserve is deposited
    });

    it("Should fail to get funding for invalid token", async function () {
      await expect(
        bancorFactory.getFundingRaised(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid token address");
    });
  });
});
