import { useState, useEffect } from 'react';
import { addDataListener, subscribeToDataType, subscribeToTransactions } from '@/lib/websocketClient';

// Define interfaces for data types
interface BaseItem {
  _id: string;
  [key: string]: any;
}

// Hook for tokens data
export function useTokensData() {
  const [tokens, setTokens] = useState<BaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Add listener for tokens data
    const removeListener = addDataListener('tokens', (data) => {
      if (Array.isArray(data)) {
        setTokens(data);
        setLoading(false);
      } else if (data.change && data.change.operationType) {
        // Handle updates based on the change operation type
        if (data.change.operationType === 'insert' && data.change.fullDocument) {
          setTokens(prev => [...prev, data.change.fullDocument]);
        } else if (data.change.operationType === 'update' && data.change.documentKey && data.change.updateDescription) {
          setTokens(prev => prev.map(token => 
            token._id === data.change.documentKey._id 
              ? { ...token, ...data.change.updateDescription.updatedFields }
              : token
          ));
        } else if (data.change.operationType === 'delete' && data.change.documentKey) {
          setTokens(prev => prev.filter(token => token._id !== data.change.documentKey._id));
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

// Hook for agents data
export function useAgentsData() {
  const [agents, setAgents] = useState<BaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Add listener for agents data
    const removeListener = addDataListener('agents', (data) => {
      if (Array.isArray(data)) {
        setAgents(data);
        setLoading(false);
      } else if (data.change && data.change.operationType) {
        // Handle updates based on the change operation type
        if (data.change.operationType === 'insert' && data.change.fullDocument) {
          setAgents(prev => [...prev, data.change.fullDocument]);
        } else if (data.change.operationType === 'update' && data.change.documentKey && data.change.updateDescription) {
          setAgents(prev => prev.map(agent => 
            agent._id === data.change.documentKey._id 
              ? { ...agent, ...data.change.updateDescription.updatedFields }
              : agent
          ));
        } else if (data.change.operationType === 'delete' && data.change.documentKey) {
          setAgents(prev => prev.filter(agent => agent._id !== data.change.documentKey._id));
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
export function useTransactionsData(tokenAddress: string, timeRange: string = '24h') {
  const [transactions, setTransactions] = useState<BaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenAddress) return;
    
    setLoading(true);
    
    // Add listener for transactions data
    const removeListener = addDataListener('transactions', (data) => {
      // Only process data for the specific token address we're interested in
      if (data.tokenAddress === tokenAddress) {
        if (Array.isArray(data)) {
          setTransactions(data);
          setLoading(false);
        } else if (data.change && data.change.operationType) {
          // Handle updates based on the change operation type
          if (data.change.operationType === 'insert' && data.change.fullDocument) {
            setTransactions(prev => [data.change.fullDocument, ...prev]);
          } else if (data.change.operationType === 'update' && data.change.documentKey && data.change.updateDescription) {
            setTransactions(prev => prev.map(tx => 
              tx._id === data.change.documentKey._id 
                ? { ...tx, ...data.change.updateDescription.updatedFields }
                : tx
            ));
          } else if (data.change.operationType === 'delete' && data.change.documentKey) {
            setTransactions(prev => prev.filter(tx => tx._id !== data.change.documentKey._id));
          } else {
            // For other operations, it's simpler to just request fresh data
            subscribeToTransactions(tokenAddress, timeRange);
          }
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
    const removeListener = addDataListener('totalVolume', (data) => {
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