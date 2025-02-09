'use client'
import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { ethers } from 'ethers'
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from "viem";

export type Token = {
  address: string;
  symbol: string;
  decimals?: number;
  name: string;
  logoURI?: string;
  balance?: string;
  totalSupply?: string;
};

const COMMON_TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x4200000000000000000000000000000000000006',
    logoURI: '/assets/tokens/eth.png',
    balance: '0.02001'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x42847D8FAff45c72A92Cce9458Fe622001463dF0',
    logoURI: '/assets/tokens/usdc.png',
  },
]

const WETH9_ADDRESS = '0x4200000000000000000000000000000000000006'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (token: Token) => void
  selectedTokens?: { token0?: Token; token1?: Token }
  selectingToken: 'token0' | 'token1'
}

// Add new component for token icon
export const TokenIcon = ({ token }: { token: Token }) => {
  if (token.logoURI) {
    return (
      <Image
        src={token.logoURI}
        alt={token.symbol}
        width={24}
        height={24}
        className="rounded-full"
      />
    );
  }

  // Fallback to first letter avatar
  const letter = (token.name || token.symbol).charAt(0).toUpperCase();
  return (
    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
      {letter}
    </div>
  );
};

// Add interface for saved tokens
interface SavedToken extends Token {
  timestamp: number;
}


// Update API endpoints
const API_BASE = 'https://scanv2-testnet.ancient8.gg/api/v2';
const API_ENDPOINTS = {
  searchTokens: (query: string) => `${API_BASE}/search?q=${query}`,
  getToken: (address: string) => `${API_BASE}/tokens/${address}/info`,
  getWalletTokens: (address: string) => `${API_BASE}/addresses/${address}/tokens?type=ERC-20`
};

// Add interface for API response
interface TokenResponse {
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
    total_supply: string;
  };
  value: string;
}

// Add utility function to format balance
const formatBalance = (balance: string) => {
  const num = parseFloat(balance);
  if (num === 0) return '0';
  if (num < 0.0001) return '<0.0001';
  if (num > 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num > 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(4);
};

export function TokenSelectModal({ isOpen, onClose, onSelect, selectedTokens, selectingToken }: Props) {
  const { address } = useAccount();
  const [searchQuery, setSearchQuery] = useState('')
  const [customAddress, setCustomAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [savedTokens, setSavedTokens] = useState<SavedToken[]>([])
  const [searchResults, setSearchResults] = useState<Token[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Move useBalance hooks to component level
  const { data: ethBalance } = useBalance({
    address: address,
  });

  const { data: tokenBalance, refetch: refetchBalance } = useBalance({
    address: address,
    token: selectingToken === 'token0' ? 
      selectedTokens?.token0?.address as `0x${string}` : 
      selectedTokens?.token1?.address as `0x${string}`,
  });

  // Load saved tokens on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedTokens')
    if (saved) {
      setSavedTokens(JSON.parse(saved))
    }
  }, [])

  // Update getTokenWithBalance to use the pre-fetched balances
  const getTokenWithBalance = async (token: Token) => {
    if (!address) return token;

    // Special handling for ETH/WETH
    if (token.address.toLowerCase() === WETH9_ADDRESS.toLowerCase()) {
      return {
        ...token,
        balance: ethBalance ? ethBalance.value.toString() : '0'
      };
    }

    // For other tokens, trigger a balance fetch
    await refetchBalance();
    
    return {
      ...token,
      balance: tokenBalance ? tokenBalance.value.toString() : '0'
    };
  };

  // Update token balance function
  const getTokenBalance = async (token: Token, walletAddress: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.getWalletTokens(walletAddress));
      if (!response.ok) return '0';

      const data = await response.json();
      const tokenData = data.items.find((item: TokenResponse) => 
        item.token.address.toLowerCase() === token.address.toLowerCase()
      );

      if (tokenData) {
        // Format balance using token decimals
        const decimals = parseInt(tokenData.token.decimals);
        return ethers.formatUnits(tokenData.value, decimals);
      }

      return '0';
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  // Update loadWalletTokens function to only get balances for saved tokens
  const loadWalletTokens = async (walletAddress: string) => {
    try {
      // Get saved tokens from localStorage first
      const savedTokensData = localStorage.getItem('savedTokens');
      const savedTokensList = savedTokensData ? JSON.parse(savedTokensData) : [];
      
      // Get all token balances from wallet
      const response = await fetch(API_ENDPOINTS.getWalletTokens(walletAddress));
      if (!response.ok) return savedTokensList;

      const data = await response.json();
      
      // Update balances only for saved tokens
      return savedTokensList.map((savedToken: Token) => {
        const walletToken = data.items.find((item: TokenResponse) => 
          item.token.address.toLowerCase() === savedToken.address.toLowerCase()
        );

        if (walletToken) {
          return {
            ...savedToken,
            balance: ethers.formatUnits(walletToken.value, parseInt(walletToken.token.decimals))
          };
        }
        return savedToken;
      });
    } catch (error) {
      console.error('Error loading wallet tokens:', error);
      return [];
    }
  };

  // Update useEffect
  useEffect(() => {
    const loadTokens = async () => {
      if (address) {
        const updatedTokens = await loadWalletTokens(address);
        setSavedTokens(updatedTokens);
        localStorage.setItem('savedTokens', JSON.stringify(updatedTokens));
      }
    };

    loadTokens();
  }, [address]);

  // Update search function
  const searchTokens = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(API_ENDPOINTS.searchTokens(query));
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      // Filter tokens that have name and are not contracts
      const tokens: Token[] = data.items
        .filter((item: any) => 
          item.type === 'token' && 
          item.name && 
          item.name.trim() !== '' && 
          item.name !== 'Unknown Token'
        )
        .map((item: any) => ({
          symbol: item.symbol || 'Unknown',
          name: item.name,
          address: item.address,
          decimals: parseInt(item.decimals || '18'),
          totalSupply: item.total_supply,
        }));
      setSearchResults(tokens);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search tokens');
    } finally {
      setIsSearching(false);
    }
  };

  // Update search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    searchTokens(query)
  }

  const getUniqueTokens = (tokens: Token[]) => {
    const uniqueAddresses = new Set();
    return tokens.filter(token => {
      const address = token.address.toLowerCase();
      if (uniqueAddresses.has(address) || !token.name) {
        return false;
      }
      uniqueAddresses.add(address);
      return true;
    });
  };

  // Update the combine tokens logic
  const displayTokens = searchQuery 
    ? searchResults
    : getUniqueTokens([...COMMON_TOKENS, ...savedTokens]);

  // Update token selection handler
  const handleTokenSelect = async (token: Token) => {
    const tokenWithBalance = await getTokenWithBalance(token);
    onSelect(tokenWithBalance);
    onClose();
  };

  // Update custom token add function
  const handleCustomTokenAdd = async () => {
    if (!customAddress || !address) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.getToken(customAddress));
      
      if (!response.ok) {
        throw new Error('Token not found');
      }

      const data = await response.json();
      const tokenInfo = data.token;

      const token: Token = {
        symbol: tokenInfo.symbol || 'Unknown',
        name: tokenInfo.name || 'Unknown Token',
        address: customAddress,
        decimals: parseInt(tokenInfo.decimals || '18'),
        totalSupply: tokenInfo.total_supply,
      };

      await handleTokenSelect(token);
      // Reset custom address input
      setCustomAddress('');
    } catch (error) {
      console.error('Error adding token:', error);
      toast.error('Invalid token address or token not found');
    } finally {
      setIsLoading(false);
    }
  };

  const isTokenSelected = (token: Token) => {
    const otherToken = selectingToken === 'token0' ? selectedTokens?.token1 : selectedTokens?.token0
    return otherToken?.address === token.address
  }

  // Add function to check if token is already added
  const isTokenAdded = (token: Token) => {
    return savedTokens.some(t => t.address.toLowerCase() === token.address.toLowerCase());
  };

  // Update the token display in the list
  const TokenListItem = ({ token, showBalance = true }: { token: Token; showBalance?: boolean }) => (
    <div
      key={token.address}
      onClick={() => !isTokenSelected(token) && handleTokenSelect(token)}
      className={`flex items-center justify-between p-2 hover:bg-gray-100 
        ${isTokenSelected(token) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-center gap-3">
        <TokenIcon token={token} />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{token.symbol}</span>
            {isTokenAdded(token) && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                Added
              </span>
            )}
          </div>
          {token.name && token.name !== token.symbol && (
            <div className="text-sm text-gray-500">{token.name}</div>
          )}
        </div>
      </div>
      {showBalance && token.balance && (
        <div className="text-sm text-gray-500">
          Balance: {formatBalance(token.balance)} {token.symbol}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Search tokens by name or address"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full"
            />
          </div>

          <Tabs defaultValue="tokens">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tokens">Your tokens</TabsTrigger>
              <TabsTrigger value="all">All tokens</TabsTrigger>
            </TabsList>
            <TabsContent value="tokens" className="space-y-4">
              <ScrollArea className="h-[300px]">
                {isSearching ? (
                  <div className="text-center py-4">Searching...</div>
                ) : (
                  displayTokens.map((token) => (
                    <TokenListItem key={token.address} token={token} />
                  ))
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="all">
              <div className="space-y-4">
                <div>
                  <Label>Custom token address</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="0x..."
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleCustomTokenAdd}
                      disabled={!customAddress || isLoading}
                      className={isLoading ? 'opacity-50' : ''}
                    >
                      {isLoading ? 'Loading...' : 'Import'}
                    </button>
                  </div>
                  {isLoading && (
                    <p className="text-sm text-gray-500 mt-1">
                      Fetching token information...
                    </p>
                  )}
                </div>
                <ScrollArea className="h-[250px]">
                  {displayTokens.map((token) => (
                    <TokenListItem key={token.address} token={token} showBalance={false} />
                  ))}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
} 