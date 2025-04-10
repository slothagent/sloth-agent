import { useState, useEffect } from 'react';
import { addDataListener, subscribeToDataType, subscribeToTransactions, subscribeToTokenByAddress, subscribeToAllTransactions, subscribeToSolanaTokens } from '../lib/websocketClient';
import { Agent, Token, Transaction } from '../models';

// Define interface for Solana token creation data
// Updated interface for Solana token data
interface SolanaTokenData {
  signature: string;
  account?: string;
  mint?: string;
  source?: string;
  metadata?: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    createdOn: string;
    twitter?: string;
    website?: string;
  };
  timestamp: string;
  type?: 'creation' | 'metadata';
}

// Hook for tokens data
export function useTokensData() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Add listener for tokens data
    const removeListener = addDataListener('tokens', (data: any) => {
      if (Array.isArray(data)) {
        setTokens(data);
        setLoading(false);
      } else if (data.change && data.change.operationType) {
        // Handle updates based on the change operation type
        if (data.change.operationType === 'insert' && data.change.fullDocument) {
          setTokens((prev: Token[]) => [...prev, data.change.fullDocument]);
        } else if (data.change.operationType === 'update' && data.change.documentKey && data.change.updateDescription) {
          setTokens((prev: Token[]) => prev.map((token: Token) => 
            token._id === data.change.documentKey._id 
              ? { ...token, ...data.change.updateDescription.updatedFields }
              : token
          ));
        } else if (data.change.operationType === 'delete' && data.change.documentKey) {
          setTokens((prev: Token[]) => prev.filter((token: Token) => token._id !== data.change.documentKey._id));
        } else {
          // If we can't handle the update specifically, request fresh data
          subscribeToDataType('tokens');
        }
      }
    });
    
    // Subscribe to tokens data
    subscribeToDataType('tokens');
    
    return removeListener;
  }, []);

  return { tokens, loading };
}

// Hook for token by address
export function useTokenByAddress(address: string) {
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setError('Address is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    // Add listener for tokenByAddress data
    const removeListener = addDataListener('tokenByAddress', (data: any) => {
      if (data && !Array.isArray(data) && data.address?.toLowerCase() === address.toLowerCase()) {
        setToken(data);
        setLoading(false);
      } else if (data.change && data.change.operationType) {
        // Handle updates for the specific token we're interested in
        if (data.change.operationType === 'insert' && data.change.fullDocument) {
          setToken(data.change.fullDocument);
          setError(null);
        } else if (data.change.operationType === 'update' && 
                  data.change.documentKey && 
                  token && 
                  token._id === data.change.documentKey._id) {
          setToken(prev => prev ? { ...prev, ...data.change.updateDescription.updatedFields } : null);
        } else if (data.change.operationType === 'delete' && 
                  data.change.documentKey && 
                  token && 
                  token._id === data.change.documentKey._id) {
          setToken(null);
          setError('Token was deleted');
        }
      } else if (data.message) {
        setError(data.message);
        setLoading(false);
      }
    });
    
    // Subscribe to token by address
    subscribeToTokenByAddress(address);
    
    return removeListener;
  }, [address, token?._id]);

  return { token, loading, error };
}

// Hook for agents data
export function useAgentsData() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Add listener for agents data
    const removeListener = addDataListener('agents', (data: any) => {
      if (Array.isArray(data)) {
        setAgents(data);
        setLoading(false);
      } else if (data.change && data.change.operationType) {
        // Handle updates based on the change operation type
        if (data.change.operationType === 'insert' && data.change.fullDocument) {
          setAgents((prev: Agent[]) => [...prev, data.change.fullDocument]);
        } else if (data.change.operationType === 'update' && data.change.documentKey && data.change.updateDescription) {
          setAgents((prev: Agent[]) => prev.map((agent: Agent) => 
            agent._id === data.change.documentKey._id 
              ? { ...agent, ...data.change.updateDescription.updatedFields }
              : agent
          ));
        } else if (data.change.operationType === 'delete' && data.change.documentKey) {
          setAgents((prev: Agent[]) => prev.filter((agent: Agent) => agent._id !== data.change.documentKey._id));
        } else {
          // If we can't handle the update specifically, request fresh data
          subscribeToDataType('agents');
        }
      }
    });
    
    // Subscribe to agents data
    subscribeToDataType('agents');
    
    return removeListener;
  }, []);

  return { agents, loading };
}

// Hook for transactions data
export function useTransactionsData(tokenAddress: string, timeRange: string = '30d') {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenAddress) return;
    
    setLoading(true);
    
    // Add listener for transactions data
    const removeListener = addDataListener('transactions', (data: any) => {
      // Only process data for the specific token address we're interested in
      // console.log("data", data);
      if (Array.isArray(data)) {
        setTransactions(data);
        setLoading(false);
      } else if (data.change && data.change.operationType && data.tokenAddress === tokenAddress) {
        // Handle updates based on operation type
        if (data.change.operationType === 'insert' && data.change.fullDocument) {
          // Check if the new transaction is related to our token
          const newTx = data.change.fullDocument;
          const isRelevant = newTx.from === tokenAddress || 
                            newTx.to === tokenAddress || 
                            newTx.tokenAddress === tokenAddress;
          
          if (isRelevant) {
            setTransactions((prev: Transaction[]) => [newTx, ...prev]);
          }
        } else if (data.change.operationType === 'update' && data.change.documentKey && data.change.updateDescription) {
          console.log('Received transaction update:', data.change);
          
          // Update transaction if it exists in our list
          setTransactions((prev: Transaction[]) => {
            const txIndex = prev.findIndex((tx: Transaction) => tx._id === data.change.documentKey._id);
            
            if (txIndex >= 0) {
              const updatedTx = { 
                ...prev[txIndex], 
                ...data.change.updateDescription.updatedFields 
              };
              
              const newTransactions = [...prev];
              newTransactions[txIndex] = updatedTx;
              return newTransactions;
            }
            
            // If transaction not found, it might be newly added and related to our token
            // In this case, we should request fresh data
            subscribeToTransactions(tokenAddress, timeRange);
            return prev;
          });
        } else if (data.change.operationType === 'delete' && data.change.documentKey) {
          // Remove transaction from list if it exists
          setTransactions((prev: Transaction[]) => 
            prev.filter((tx: Transaction) => tx._id !== data.change.documentKey._id)
          );
        } else {
          // For other operations, simply request fresh data
          subscribeToTransactions(tokenAddress, timeRange);
        }
      }
    });
    
    // Subscribe to transactions data for this token
    subscribeToTransactions(tokenAddress, timeRange);
    
    return removeListener;
  }, [tokenAddress, timeRange]);

  return { transactions, loading };
}

// Hook for total volume data
export function useTotalVolumeData(timeRange?: string) {
  const [totalVolume, setTotalVolume] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Add listener for total volume data
    const removeListener = addDataListener('totalVolume', (data: any) => {
      if (data && typeof data.totalVolume === 'number') {
        setTotalVolume(data.totalVolume);
        setLoading(false);
      }
    });
    
    // Subscribe to total volume data with optional timeRange
    subscribeToDataType('totalVolume', timeRange ? { timeRange } : {});
    
    return removeListener;
  }, [timeRange]);

  return { totalVolume, loading };
}

// Hook for all transactions data
export function useAllTransactionsData(timeRange: string = '30d', limit: number = 100) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Add listener for all transactions data
    const removeListener = addDataListener('allTransactions', (data: any) => {
      // Process transactions data
      if (Array.isArray(data)) {
        setTransactions(data);
        setLoading(false);
      } else if (data.change && data.change.operationType) {
        // Handle updates based on operation type
        if (data.change.operationType === 'insert' && data.change.fullDocument) {
          // Add new transaction to the beginning of the list
          setTransactions((prev: Transaction[]) => [data.change.fullDocument, ...prev]);
        } else if (data.change.operationType === 'update' && data.change.documentKey && data.change.updateDescription) {
          console.log('Received transaction update:', data.change);
          
          // Update transaction if it exists in the list
          setTransactions((prev: Transaction[]) => {
            const txIndex = prev.findIndex((tx: Transaction) => tx._id === data.change.documentKey._id);
            
            if (txIndex >= 0) {
              const updatedTx = { 
                ...prev[txIndex], 
                ...data.change.updateDescription.updatedFields 
              };
              
              const newTransactions = [...prev];
              newTransactions[txIndex] = updatedTx;
              return newTransactions;
            }
            
            // If transaction not found, it might have been removed from the list due to limit
            // In this case, we should request fresh data
            subscribeToAllTransactions(timeRange, limit);
            return prev;
          });
        } else if (data.change.operationType === 'delete' && data.change.documentKey) {
          // Remove transaction from list if it exists
          setTransactions((prev: Transaction[]) => 
            prev.filter((tx: Transaction) => tx._id !== data.change.documentKey._id)
          );
        } else {
          // For other operations, simply request fresh data
          subscribeToAllTransactions(timeRange, limit);
        }
      }
    });
    
    // Subscribe to all transactions data
    subscribeToAllTransactions(timeRange, limit);
    
    return removeListener;
  }, [timeRange, limit]);

  return { transactions, loading };
}

// Hook for Solana token creation events
const MAX_TOKENS = 20;
const STORAGE_KEY = 'solana_tokens';

export function useSolanaTokens() {
  const [tokens, setTokens] = useState<SolanaTokenData[]>(() => {
    // Initialize from localStorage
    const storedTokens = localStorage.getItem(STORAGE_KEY);
    return storedTokens ? JSON.parse(storedTokens) : [];
  });
  const [loading, setLoading] = useState(true);

  // Update localStorage whenever tokens change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }, [tokens]);

  useEffect(() => {
    setLoading(true);
    
    // Add listener for Solana token creation events
    const removeListener = addDataListener('solanaTokens', (data: any) => {
      if (data && data.type === 'update' && data.data) {
        // console.log('Received token data:', data.data);
        
        setTokens(prev => {
          // Check if token already exists
          const existingTokenIndex = prev.findIndex(t => t.mint === data.data.mint);
          
          if (existingTokenIndex !== -1) {
            // Update existing token
            const updatedTokens = [...prev];
            updatedTokens[existingTokenIndex] = {
              ...prev[existingTokenIndex],
              ...data.data
            };
            return updatedTokens;
          }
          
          // Handle new token
          if (prev.length >= MAX_TOKENS) {
            // Remove last token and add new one at the beginning
            const newTokens = [data.data, ...prev.slice(0, MAX_TOKENS - 1)];
            return newTokens;
          }
          
          // Add new token if under limit
          return [data.data, ...prev];
        });
        setLoading(false);
      }
    });
    
    // Subscribe to Solana token creation events
    subscribeToSolanaTokens();
    
    return removeListener;
  }, []);

  return { tokens, loading };
}