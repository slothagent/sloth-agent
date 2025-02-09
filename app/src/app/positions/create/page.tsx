'use client'
import { useState, useEffect } from 'react';
import { 
  useAccount,
  useBalance
} from 'wagmi';
import {
  simulateContract,
  sendTransaction,
  type Config
} from '@wagmi/core';


import { parseUnits, formatUnits, formatEther } from "viem";
import { POSITION_MANAGER_ABI } from '@/config/abis/PositionManager';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { TokenIcon, TokenSelectModal } from '@/components/TokenSelectModal'
import Image from 'next/image';
import type { Token } from '@/components/TokenSelectModal';
import Header from '@/components/Header';
import Trending from '@/components/Trending';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import toast from 'react-hot-toast';
import { config } from '@/wagmi';
import { ethers } from 'ethers';

const POSITION_MANAGER_ADDRESS = "0x45E5ceC1177361b7b5525A382c07C58F3bf89355";
const FACTORY_ADDRESS = "0x48bFcb7c258E3806b390fe9FA2B2B378A9285c17";
const WETH9_ADDRESS = "0x4200000000000000000000000000000000000006";
const SWAP_ROUTER_ADDRESS = "0x2814f03159D471B015C64FF225aA31072366d54D";

// First, update the ERC20_ABI to include all necessary functions and events
const ERC20_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Add the pool interface near the ERC20_ABI


// Add pool initialization ABI
const POOL_INIT_ABI = [
  {
    inputs: [{ internalType: "uint160", name: "sqrtPriceX96", type: "uint160" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "slot0",
    outputs: [
      { internalType: "uint160", name: "sqrtPriceX96", type: "uint160" },
      { internalType: "int24", name: "tick", type: "int24" },
      { internalType: "uint16", name: "observationIndex", type: "uint16" },
      { internalType: "uint16", name: "observationCardinality", type: "uint16" },
      { internalType: "uint16", name: "observationCardinalityNext", type: "uint16" },
      { internalType: "uint8", name: "feeProtocol", type: "uint8" },
      { internalType: "bool", name: "unlocked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  }
] as const;

// Add helper function to calculate ticks
const TICK_SPACINGS: { [key: number]: number } = {
  500: 10,
  3000: 60,
  10000: 200
};

type Slot0Response = {
  sqrtPriceX96: bigint;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
};

const calculateTicks = async (poolAddress: string, fee: number) => {
  try {
    // @ts-ignore
    const { result: slot0 } = await simulateContract(config, {
      address: poolAddress,
      abi: POOL_INIT_ABI,
      functionName: 'slot0',
    }) as { result: Slot0Response };

    const currentTick = slot0.tick;
    const tickSpacing = TICK_SPACINGS[fee];
    const tickRange = tickSpacing * 2;
    const baseTickLower = Math.floor(currentTick / tickSpacing) * tickSpacing;
    const baseTickUpper = Math.ceil(currentTick / tickSpacing) * tickSpacing;

    const MIN_TICK = -887272;
    const MAX_TICK = 887272;
    
    return {
      tickLower: Math.max(MIN_TICK, baseTickLower - tickRange),
      tickUpper: Math.min(MAX_TICK, baseTickUpper + tickRange)
    };
  } catch (error) {
    console.error("Error calculating ticks:", error);
    return { tickLower: -887272, tickUpper: 887272 };
  }
};

// Add function to check if pool exists
const checkPool = async (token0: string, token1: string, fee: number) => {
  try {
    // @ts-ignore
    const { result: poolAddress } = await simulateContract(config, {
      address: FACTORY_ADDRESS,
      abi: [
        {
          inputs: [
            { internalType: "address", name: "tokenA", type: "address" },
            { internalType: "address", name: "tokenB", type: "address" },
            { internalType: "uint24", name: "fee", type: "uint24" }
          ],
          name: "getPool",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function"
        }
      ],
      functionName: 'getPool',
      args: [token0, token1, fee],
    });

    return poolAddress;
  } catch (error) {
    console.error("Error checking pool:", error);
    return null;
  }
};

const CreatePositionPage = () => {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({
    address: address,
  });
  const [token0Address, setToken0Address] = useState<string | null>(null);
  const [token1Address, setToken1Address] = useState<string | null>(null);
  const [fee, setFee] = useState(3000); // Default fee tier (0.3%)
  const [amount0, setAmount0] = useState<string | null>(null);
  const [amount1, setAmount1] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [initialPrice, setInitialPrice] = useState('');
  const [priceRange, setPriceRange] = useState<'full' | 'custom'>('full');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)
  const [selectingToken, setSelectingToken] = useState<'token0' | 'token1'>('token0')
  const [selectedTokens, setSelectedTokens] = useState<{
    token0?: Token;
    token1?: Token;
  }>({});
  const [priceInvert, setPriceInvert] = useState(false);
  const [token0ApproveHash, setToken0ApproveHash] = useState<`0x${string}`>();
  const [token1ApproveHash, setToken1ApproveHash] = useState<`0x${string}`>();

  const approveTokens = async (token0: `0x${string}`, amount0: bigint, token1: `0x${string}`, amount1: bigint) => {
    if (!address || !isConnected || !token0 || !token1) {
      toast.error('Invalid token addresses or wallet not connected');
      return false;
    }

    try {
      const token0Address = token0.toLowerCase() as `0x${string}`;
      const token1Address = token1.toLowerCase() as `0x${string}`;
      const positionManagerAddress = POSITION_MANAGER_ADDRESS.toLowerCase() as `0x${string}`;

      // First token approval
      toast.loading('Approving first token...', { id: 'approve-token0' });
      try {
        const token0Contract = {
          address: token0Address,
          abi: ERC20_ABI,
        };

        // First simulate the approval
        // @ts-ignore
        const token0Simulation = await simulateContract(config, {
          ...token0Contract,
          functionName: 'approve',
          args: [positionManagerAddress, amount0],
          account: address,
        });

        if (token0Simulation.result === false) {
          throw new Error('Token0 approval simulation failed');
        }

        // Send the approval transaction
        // @ts-ignore
        const token0Hash = await sendTransaction(config, {
          to: token0Address,
          // @ts-ignore
          data: token0Simulation.request.data,
          value: BigInt(0),
        });

        if (token0Hash) {
          setToken0ApproveHash(token0Hash);
          toast.success('First token approved', { id: 'approve-token0' });
          
          // Second token approval
          toast.loading('Approving second token...', { id: 'approve-token1' });
          const token1Contract = {
            address: token1Address,
            abi: ERC20_ABI,
          };
          // @ts-ignore
          const token1Simulation = await simulateContract(config, {
            ...token1Contract,
            functionName: 'approve',
            args: [positionManagerAddress, amount1],
            account: address,
          });

          if (token1Simulation.result === false) {
            throw new Error('Token1 approval simulation failed');
          }
          // @ts-ignore
          const token1Hash = await sendTransaction(config, {
            to: token1Address,
            // @ts-ignore
            data: token1Simulation.request.data,
            value: BigInt(0),
          });

          if (token1Hash) {
            setToken1ApproveHash(token1Hash);
            toast.success('Second token approved', { id: 'approve-token1' });
            return true;
          }
        }
      } catch (error: any) {
        console.error('Approval error:', error);
        toast.error(error?.message || 'Approval failed', { id: 'approve-token0' });
        return false;
      }

      return false;
    } catch (error: any) {
      console.error('Error approving tokens:', error);
      toast.error(error?.message || 'Failed to approve tokens');
      return false;
    }
  };

  const resetForm = () => {
    setToken0Address(null);
    setToken1Address(null);
    setFee(3000);
    setAmount0(null);
    setAmount1(null);
    setMinPrice(null);
    setMaxPrice(null);
    setInitialPrice('');
    setPriceRange('full');
    setPriceInvert(false);
    setSelectedTokens({});
    setCurrentStep(1);
  };

  const formatAmount = (amount: string | null): bigint => {
    if (!amount || amount === '') return BigInt(0);
    
    try {
      // Remove any commas and handle decimals properly
      const cleanAmount = amount.replace(/,/g, '');
      const [whole, decimal = ''] = cleanAmount.split('.');
      
      // Pad or truncate decimals to 18 places
      const paddedDecimal = decimal.padEnd(18, '0').slice(0, 18);
      
      // Combine whole and decimal parts
      const fullNumber = `${whole}${paddedDecimal}`;
      
      // Remove leading zeros
      const trimmed = fullNumber.replace(/^0+/, '') || '0';
      
      return BigInt(trimmed);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return BigInt(0);
    }
  };

  const handleCreatePosition = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);

      // Sort tokens and prepare amounts
      const [token0, token1, amount0Desired, amount1Desired] = 
        selectedTokens.token0!.address.toLowerCase() < selectedTokens.token1!.address.toLowerCase()
          ? [
              selectedTokens.token0!.address,
              selectedTokens.token1!.address,
              formatAmount(amount0),
              formatAmount(amount1),
            ]
          : [
              selectedTokens.token1!.address,
              selectedTokens.token0!.address,
              formatAmount(amount1),
              formatAmount(amount0),
            ];

      // Check if pool exists and initialize if needed
      if (!token0 || !token1) {
        toast.error('Invalid token addresses');
        return;
      }

      const poolAddress = await checkPool(token0, token1, fee);
      if (!poolAddress || poolAddress === '0x0000000000000000000000000000000000000000') {
        toast.loading('Creating new pool...', { id: 'create-pool' });
        try {
          // @ts-ignore
          const { request } = await simulateContract(config, {
            address: FACTORY_ADDRESS,
            abi: [
              {
                inputs: [
                  { internalType: "address", name: "tokenA", type: "address" },
                  { internalType: "address", name: "tokenB", type: "address" },
                  { internalType: "uint24", name: "fee", type: "uint24" }
                ],
                name: "createPool",
                outputs: [{ internalType: "address", name: "", type: "address" }],
                stateMutability: "nonpayable",
                type: "function"
              }
            ],
            functionName: 'createPool',
            args: [token0, token1, fee],
            account: address,
          });

          // @ts-ignore
          await sendTransaction(config, request);
          await new Promise(r => setTimeout(r, 2000)); // Wait for pool creation
          toast.success('Pool created', { id: 'create-pool' });
        } catch (error: any) {
          console.error("Error creating pool:", error);
          toast.error('Failed to create pool', { id: 'create-pool' });
          return;
        }
      }

      // Initialize pool if needed
      // @ts-ignore
      const { result: slot0 } = await simulateContract(config, {
        address: poolAddress,
        abi: POOL_INIT_ABI,
        functionName: 'slot0',
      }) as { result: Slot0Response };

      if (slot0.sqrtPriceX96.toString() === '0') {
        toast.loading('Initializing pool...', { id: 'init-pool' });
        try {
          const price = BigInt(10) ** BigInt(6); // 1:1,000,000 ratio
          const sqrtPriceX96 = BigInt(Math.floor(Math.sqrt(Number(price)) * 2 ** 96));

          // @ts-ignore
          const { request } = await simulateContract(config, {
            address: poolAddress,
            abi: POOL_INIT_ABI,
            functionName: 'initialize',
            args: [sqrtPriceX96],
            account: address,
          });

          // @ts-ignore
          await sendTransaction(config, request);
          toast.success('Pool initialized', { id: 'init-pool' });
        } catch (error: any) {
          console.error("Error initializing pool:", error);
          toast.error('Failed to initialize pool', { id: 'init-pool' });
          return;
        }
      }

      // Calculate optimal ticks
      const { tickLower, tickUpper } = await calculateTicks(poolAddress||'', fee);

      // Approve tokens
      // @ts-ignore
      const approved = await approveTokens(token0, amount0Desired, token1, amount1Desired);
      if (!approved) {
        toast.error('Failed to approve tokens');
        return;
      }

      // Create position
      if (token0ApproveHash && token1ApproveHash) {
        toast.loading('Creating position...', { id: 'create-position' });

        const mintParams = {
          token0: token0 as `0x${string}`,
          token1: token1 as `0x${string}`,
          fee,
          tickLower,
          tickUpper,
          amount0Desired,
          amount1Desired,
          amount0Min: BigInt(0),
          amount1Min: BigInt(0),
          recipient: address,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
        };

        try {
          // @ts-ignore
          const { request } = await simulateContract(config, {
            address: POSITION_MANAGER_ADDRESS,
            abi: POSITION_MANAGER_ABI,
            functionName: 'mint',
            args: [mintParams],
            account: address,
          });

          // @ts-ignore
          const hash = await sendTransaction(config, {
            ...request,
            gasLimit: BigInt(1000000), // Increased gas limit
          });

          if (hash) {
            console.log("Position created:", hash);
            toast.success('Position created successfully!', { id: 'create-position' });
            resetForm();
          }
        } catch (error: any) {
          console.error("Error creating position:", error);
          toast.error(error.message || 'Failed to create position', { id: 'create-position' });
        }
      }

    } catch (error: any) {
      console.error("Error in process:", error);
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };


  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return 'Select token pair and fees';
      case 2:
        return 'Set price range';
      case 3:
        return 'Enter deposit amounts';
      default:
        return '';
    }
  };

  // Add formatBalance function
  const formatBalance = (balance: string | undefined, decimals: number = 18) => {
    if (!balance) return '0';
    try {
      const formatted = formatUnits(BigInt(balance), decimals);
      const num = parseFloat(formatted);
      if (num === 0) return '0';
      if (num < 0.0001) return '<0.0001';
      if (num > 1000000) {
        return `${(num / 1000000).toFixed(2)}M`;
      }
      if (num > 1000) {
        return `${(num / 1000).toFixed(2)}K`;
      }
      return num.toFixed(4);
    } catch (error) {
      console.error('Error formatting balance:', error);
      return '0';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="text-xl font-semibold mb-2">Select pair</h2>
            <p className="text-gray-600 mb-6">
              Choose the tokens you want to provide liquidity for. You can select tokens on all supported networks.
            </p>

            {/* Token selection and fee tier content */}
            <div className="space-y-4">
              <div>
                <Button
                  variant="outline"
                  className="w-full justify-between h-14"
                  onClick={() => {
                    setSelectingToken('token0')
                    setIsTokenModalOpen(true)
                  }}
                >
                  {selectedTokens.token0 ? (
                    <div className="flex items-center gap-2">
                      {selectedTokens.token0.logoURI ? (
                        <Image
                          src={selectedTokens.token0.logoURI}
                          alt={selectedTokens.token0.symbol}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <TokenIcon token={selectedTokens.token0} />
                      )}
                      <span>{selectedTokens.token0.symbol}</span>
                    </div>
                  ) : (
                    'Select token'
                  )}
                  <span>↓</span>
                </Button>
              </div>

              <div>
                <Button
                  variant="outline"
                  className="w-full justify-between h-14"
                  onClick={() => {
                    setSelectingToken('token1')
                    setIsTokenModalOpen(true)
                  }}
                >
                  {selectedTokens.token1 ? (
                    <div className="flex items-center gap-2">
                      {selectedTokens.token1.logoURI ? (
                        <Image
                          src={selectedTokens.token1.logoURI}
                          alt={selectedTokens.token1.symbol}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <TokenIcon token={selectedTokens.token1} />
                      )}
                      <span>{selectedTokens.token1.symbol}</span>
                    </div>
                  ) : (
                    'Select token'
                  )}
                  <span>↓</span>
                </Button>
              </div>

              <TokenSelectModal
                isOpen={isTokenModalOpen}
                onClose={() => setIsTokenModalOpen(false)}
                onSelect={(token) => {
                  if (selectingToken === 'token0') {
                    setSelectedTokens(prev => ({ ...prev, token0: token }));
                    setToken0Address(token.address);
                  } else {
                    setSelectedTokens(prev => ({ ...prev, token1: token }));
                    setToken1Address(token.address);
                  }
                }}
                selectedTokens={selectedTokens}
                selectingToken={selectingToken}
              />

              <div>
                <Label>Fee tier</Label>
                <p className="text-sm text-gray-400 mb-2">
                  The amount earned providing liquidity. Choose an amount that suits your risk tolerance and strategy.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { value: 100, label: "0.01%", description: "Best for very stable pairs" },
                    { value: 500, label: "0.05%", description: "Best for stable pairs" },
                    { value: 3000, label: "0.3%", description: "Best for most pairs" },
                    { value: 10000, label: "1%", description: "Best for exotic pairs" },
                  ].map((feeTier) => (
                    <Card 
                      key={feeTier.value}
                      className={`p-4 cursor-pointer ${fee === feeTier.value ? 'border-blue-500' : 'border-gray-800'}`}
                      onClick={() => setFee(feeTier.value)}
                    >
                      <div className="font-semibold">{feeTier.label}</div>
                      <div className="text-sm text-gray-400">{feeTier.description}</div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Set price range</h2>
              <p className="text-gray-600">
                Set the starting exchange rate between the two tokens you are providing.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Initial price</Label>
                <Input 
                  value={initialPrice}
                  onChange={(e) => setInitialPrice(e.target.value)}
                  placeholder="0"
                  className="mt-2"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500">
                    Current price: {priceInvert 
                      ? `1 ${selectedTokens.token0?.symbol || 'Token 0'} = ${initialPrice || '0'} ${selectedTokens.token1?.symbol || 'Token 1'}`
                      : `1 ${selectedTokens.token1?.symbol || 'Token 1'} = ${initialPrice || '0'} ${selectedTokens.token0?.symbol || 'Token 0'}`
                    } (-)
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`px-3 py-1 ${!priceInvert ? 'bg-gray-100' : ''}`}
                      onClick={() => setPriceInvert(false)}
                    >
                      {selectedTokens.token1?.symbol || 'Token 1'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`px-3 py-1 ${priceInvert ? 'bg-gray-100' : ''}`}
                      onClick={() => setPriceInvert(true)}
                    >
                      {selectedTokens.token0?.symbol || 'Token 0'}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label>Price range</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-lg">
                  <button
                    className={`py-2 rounded-md text-sm font-medium transition-colors
                      ${priceRange === 'full' 
                        ? 'bg-white shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setPriceRange('full')}
                  >
                    Full range
                  </button>
                  <button
                    className={`py-2 rounded-md text-sm font-medium transition-colors
                      ${priceRange === 'custom' 
                        ? 'bg-white shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setPriceRange('custom')}
                  >
                    Custom range
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  Providing full range liquidity ensures continuous market participation across all possible prices, 
                  offering simplicity but with potential for higher impermanent loss.
                </p>

                {priceRange === 'custom' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                    <div className="text-sm text-gray-500">
                      Current price: {priceInvert 
                        ? `1 ${selectedTokens.token0?.symbol || 'Token 0'} = ${initialPrice || '0'} ${selectedTokens.token1?.symbol || 'Token 1'}`
                        : `1 ${selectedTokens.token1?.symbol || 'Token 1'} = ${initialPrice || '0'} ${selectedTokens.token0?.symbol || 'Token 0'}`
                      } (-)
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Min price</Label>
                        <Input 
                          value={minPrice || ''}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="0"
                          className="mt-2"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {priceInvert 
                            ? `${selectedTokens.token0?.symbol || 'Token 0'} per ${selectedTokens.token1?.symbol || 'Token 1'}`
                            : `${selectedTokens.token1?.symbol || 'Token 1'} per ${selectedTokens.token0?.symbol || 'Token 0'}`
                          }
                        </p>
                      </div>
                      <div>
                        <Label>Max price</Label>
                        <Input 
                          value={maxPrice || ''}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder=""
                          className="mt-2"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {priceInvert 
                            ? `${selectedTokens.token0?.symbol || 'Token 0'} per ${selectedTokens.token1?.symbol || 'Token 1'}`
                            : `${selectedTokens.token1?.symbol || 'Token 1'} per ${selectedTokens.token0?.symbol || 'Token 0'}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Deposit tokens</h2>
              <p className="text-gray-600">
                Specify the token amounts for your liquidity contribution.
              </p>
            </div>

            <div className="space-y-4">
              {/* First Token Input */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {selectedTokens.token0?.logoURI ? (
                      <Image
                        src={selectedTokens.token0.logoURI}
                        alt={selectedTokens.token0.symbol || ''}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <TokenIcon token={selectedTokens.token0!} />
                    )}
                    <span className="font-medium">
                      {selectedTokens.token0?.symbol || 'Token 0'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Balance: {formatBalance(
                      selectedTokens.token0?.balance,
                      selectedTokens.token0?.decimals || 18
                    )} {selectedTokens.token0?.symbol}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 text-xs bg-gray-200 hover:bg-gray-300"
                      onClick={() => setAmount0(selectedTokens.token0?.balance || '0')}
                    >
                      Max
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    value={amount0 || ''}
                    onChange={(e) => {
                      // Only allow numbers and decimal point
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      // Prevent multiple decimal points
                      if ((value.match(/\./g) || []).length <= 1) {
                        setAmount0(value);
                      }
                    }}
                    placeholder="0.0"
                    className="bg-white text-lg pr-20"
                    type="text"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $0
                  </div>
                </div>
                {amount0 && parseFloat(amount0) > parseFloat(selectedTokens.token0?.balance || '0') && (
                  <p className="text-sm text-red-500 mt-1">
                    Insufficient {selectedTokens.token0?.symbol} balance
                  </p>
                )}
              </div>

              {/* Second Token Input */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {selectedTokens.token1?.logoURI ? (
                      <Image
                        src={selectedTokens.token1.logoURI}
                        alt={selectedTokens.token1.symbol || ''}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <TokenIcon token={selectedTokens.token1!} />
                    )}
                    <span className="font-medium">
                      {selectedTokens.token1?.symbol || 'Token 1'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Balance: {formatBalance(
                      selectedTokens.token1?.balance,
                      selectedTokens.token1?.decimals || 18
                    )} {selectedTokens.token1?.symbol}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 text-xs bg-gray-200 hover:bg-gray-300"
                      onClick={() => setAmount1(selectedTokens.token1?.balance || '0')}
                    >
                      Max
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    value={amount1 || ''}
                    onChange={(e) => {
                      // Only allow numbers and decimal point
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      // Prevent multiple decimal points
                      if ((value.match(/\./g) || []).length <= 1) {
                        setAmount1(value);
                      }
                    }}
                    placeholder="0.0"
                    className="bg-white text-lg pr-20"
                    type="text"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $0
                  </div>
                </div>
                {amount1 && parseFloat(amount1) > parseFloat(selectedTokens.token1?.balance || '0') && (
                  <p className="text-sm text-red-500 mt-1">
                    Insufficient {selectedTokens.token1?.symbol} balance
                  </p>
                )}
              </div>
            </div>
          </>
        );
    }
  };

  // Add helper functions for calculations
  const calculateTokenAmounts = () => {
    if (!initialPrice || !selectedTokens.token0 || !selectedTokens.token1) return;

    const price = parseFloat(initialPrice);
    const minPriceVal = priceRange === 'custom' ? parseFloat(minPrice || '0') : 0;
    const maxPriceVal = priceRange === 'custom' ? parseFloat(maxPrice || '0') : Infinity;

    // Calculate suggested amounts based on price range
    let suggestedAmount0 = '0';
    let suggestedAmount1 = '0';

    if (priceInvert) {
      // If price is inverted (token0 per token1)
      suggestedAmount0 = '1';
      suggestedAmount1 = (price).toString();
    } else {
      // If price is normal (token1 per token0)
      suggestedAmount0 = '1';
      suggestedAmount1 = (1/price).toString();
    }

    return {
      amount0: suggestedAmount0,
      amount1: suggestedAmount1
    };
  };

  // Add validation function for token amounts
  const validateAmounts = () => {
    if (!selectedTokens.token0?.balance || !selectedTokens.token1?.balance) return false;
    
    const amount0Val = parseFloat(amount0 || '0');
    const amount1Val = parseFloat(amount1 || '0');
    const balance0 = parseFloat(selectedTokens.token0.balance);
    const balance1 = parseFloat(selectedTokens.token1.balance);

    if (amount0Val > balance0 || amount1Val > balance1) {
      return false;
    }

    return true;
  };

  // Update useEffect to calculate amounts when price changes
  useEffect(() => {
    if (currentStep === 3) {
      const amounts = calculateTokenAmounts();
      if (amounts) {
        setAmount0(amounts.amount0);
        setAmount1(amounts.amount1);
      }
    }
  }, [initialPrice, priceRange, minPrice, maxPrice, priceInvert, currentStep]);

  // Add new useEffect to handle token amount changes
  useEffect(() => {
    if (currentStep === 3 && initialPrice) {
      const price = parseFloat(initialPrice);
      
      // When amount0 changes, update amount1
      if (amount0) {
        const amount0Val = parseFloat(amount0);
        const calculatedAmount1 = priceInvert 
          ? amount0Val * price 
          : amount0Val / price;
        setAmount1(calculatedAmount1.toString());
      }
    }
  }, [amount0, initialPrice, priceInvert, currentStep]);

  useEffect(() => {
    if (currentStep === 3 && initialPrice) {
      const price = parseFloat(initialPrice);
      
      // When amount1 changes, update amount0
      if (amount1) {
        const amount1Val = parseFloat(amount1);
        const calculatedAmount0 = priceInvert 
          ? amount1Val / price 
          : amount1Val * price;
        setAmount0(calculatedAmount0.toString());
      }
    }
  }, [amount1, initialPrice, priceInvert, currentStep]);

  // Update canContinue function
  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return selectedTokens.token0 && selectedTokens.token1;
      case 2:
        if (priceRange === 'custom') {
          return initialPrice && minPrice && maxPrice;
        }
        return initialPrice;
      case 3:
        return amount0 && amount1 && validateAmounts();
      default:
        return false;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/positions" className="text-gray-500">
                Your positions
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400" />
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="#" 
                className="text-gray-500"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentStep(1);
                }}
              >
                New position
              </BreadcrumbLink>
            </BreadcrumbItem>
            {currentStep > 1 && (
              <>
                <BreadcrumbSeparator className="text-gray-400" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getStepTitle(currentStep)}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">New position</h1>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={resetForm}
            >
              Reset
            </Button>
            <Select defaultValue="v3">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v3">v3 position</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-[300px,1fr] gap-8">
          {/* Left sidebar */}
          <Card className="border-gray-200">
            <div className="p-6 space-y-6">
              {[1, 2, 3].map((step) => (
                <div key={step}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                      ${currentStep === step 
                        ? 'bg-blue-500 text-white' 
                        : currentStep > step 
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-400'}`}>
                      {step}
                    </div>
                    <div className={currentStep >= step ? 'text-gray-900' : 'text-gray-400'}>
                      <div className="font-semibold">Step {step}</div>
                      <div className="text-sm">
                        {step === 1 ? 'Select token pair and fees' :
                         step === 2 ? 'Set price range' : 'Enter deposit amounts'}
                      </div>
                    </div>
                  </div>
                  {step < 3 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </Card>

          {/* Main content */}
          <Card className="border-gray-200">
            <div className="p-6">
              {renderStepContent()}

              <div className="mt-6 flex justify-end gap-4">
                {currentStep > 1 && (
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    if (currentStep < 3) {
                      setCurrentStep(prev => prev + 1);
                    } else {
                      handleCreatePosition();
                    }
                  }}
                  disabled={!address || !canContinue()}
                  className={!canContinue() ? 'bg-gray-300' : ''}
                >
                  {!address 
                    ? 'Connect Wallet'
                    : !canContinue() 
                      ? currentStep === 1 
                        ? 'Select tokens to continue'
                        : currentStep === 2 
                          ? 'Enter price to continue'
                          : 'Enter amounts to continue'
                      : currentStep === 3 
                        ? 'Create Position' 
                        : 'Continue'
                  }
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

export default CreatePositionPage;