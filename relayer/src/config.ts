import { ethers } from 'ethers';
import { SlothABI, SlothFactoryABI } from './abis/abis';

export const SLOTH_FACTORY_CONTRACT_ADDRESS = '0x746089c0F0566B4846786822f8C07DF6DC3a7A65'; // Replace with actual contract address
export const NATIVE_TOKEN = "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38";
// Initialize provider and contract
export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL_SONIC);
export const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY || '', provider);

// Get relayer address from wallet
export const RELAYER_ADDRESS = wallet.address;

export const slothFactoryContract = new ethers.Contract(
  SLOTH_FACTORY_CONTRACT_ADDRESS,
  SlothFactoryABI,
  wallet
);
