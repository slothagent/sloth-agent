const ethers = require('ethers');

async function createNewToken(
  slothFactoryContract, // Contract instance
  name,
  symbol, 
  totalSupply,
  curveIndex,
  dex,
  createFeeAmount // Số ETH cần gửi kèm
) {
  try {
    // Convert totalSupply to wei (1 token = 1e18 wei)
    const totalSupplyWei = ethers.utils.parseEther(totalSupply.toString());
    
    // Tạo transaction
    const tx = await slothFactoryContract.createToken(
      name,
      symbol,
      totalSupplyWei,
      curveIndex,
      dex,
      {
        value: ethers.utils.parseEther(createFeeAmount.toString()) // Số ETH gửi kèm
      }
    );

    // Đợi transaction được confirm
    const receipt = await tx.wait();
    
    // Lấy địa chỉ token mới từ event TokenCreated
    const event = receipt.events.find(e => e.event === 'TokenCreated');
    const newTokenAddress = event.args.token;
    
    console.log('Token created at:', newTokenAddress);
    return newTokenAddress;

  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
}

// Ví dụ sử dụng:
const createTokenExample = async () => {
  // Khởi tạo contract instance (cần ABI và địa chỉ contract)
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const slothFactoryContract = new ethers.Contract(
    SLOTH_FACTORY_ADDRESS, // Địa chỉ của SlothFactory contract
    SLOTH_FACTORY_ABI,     // ABI của SlothFactory contract
    signer
  );

  // Tham số ví dụ
  const params = {
    name: "My Token",
    symbol: "MTK",
    totalSupply: 100000000, // 100 million tokens
    curveIndex: 0,        // Index của curve đã được tạo
    dex: 0,              // 0 for METROPOLIS
    createFeeAmount: "1"  // 1 ETH as creation fee
  };

  try {
    const newTokenAddress = await createNewToken(
      slothFactoryContract,
      params.name,
      params.symbol,
      params.totalSupply,
      params.curveIndex,
      params.dex,
      params.createFeeAmount
    );
    
    console.log("Token created successfully at:", newTokenAddress);
  } catch (error) {
    console.error("Failed to create token:", error);
  }
};