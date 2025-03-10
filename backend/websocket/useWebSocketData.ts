import { useState, useEffect } from 'react';
import { addDataListener, subscribeToDataType, subscribeToTransactions, subscribeToTokenByAddress, subscribeToAllTransactions } from './websocketClient';
import { Agent, Token, Transaction } from './models';

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
      // Chỉ xử lý dữ liệu cho địa chỉ token cụ thể mà chúng ta quan tâm
      if (Array.isArray(data)) {
        setTransactions(data);
        setLoading(false);
      } else if (data.change && data.change.operationType && data.tokenAddress === tokenAddress) {
        // Xử lý cập nhật dựa trên loại thao tác
        if (data.change.operationType === 'insert' && data.change.fullDocument) {
          // Kiểm tra xem transaction mới có liên quan đến token của chúng ta không
          const newTx = data.change.fullDocument;
          const isRelevant = newTx.from === tokenAddress || 
                            newTx.to === tokenAddress || 
                            newTx.tokenAddress === tokenAddress;
          
          if (isRelevant) {
            setTransactions((prev: Transaction[]) => [newTx, ...prev]);
          }
        } else if (data.change.operationType === 'update' && data.change.documentKey && data.change.updateDescription) {
          console.log('Received transaction update:', data.change);
          
          // Cập nhật transaction nếu nó đã tồn tại trong danh sách của chúng ta
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
            
            // Nếu không tìm thấy transaction, có thể nó mới được thêm vào và liên quan đến token của chúng ta
            // Trong trường hợp này, chúng ta nên yêu cầu dữ liệu mới
            subscribeToTransactions(tokenAddress, timeRange);
            return prev;
          });
        } else if (data.change.operationType === 'delete' && data.change.documentKey) {
          // Xóa transaction khỏi danh sách nếu nó tồn tại
          setTransactions((prev: Transaction[]) => 
            prev.filter((tx: Transaction) => tx._id !== data.change.documentKey._id)
          );
        } else {
          // Đối với các thao tác khác, đơn giản là yêu cầu dữ liệu mới
          subscribeToTransactions(tokenAddress, timeRange);
        }
      }
    });
    
    // Đăng ký nhận dữ liệu transactions cho token này
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
      // Xử lý dữ liệu transactions
      if (Array.isArray(data)) {
        setTransactions(data);
        setLoading(false);
      } else if (data.change && data.change.operationType) {
        // Xử lý cập nhật dựa trên loại thao tác
        if (data.change.operationType === 'insert' && data.change.fullDocument) {
          // Thêm transaction mới vào đầu danh sách
          setTransactions((prev: Transaction[]) => [data.change.fullDocument, ...prev]);
        } else if (data.change.operationType === 'update' && data.change.documentKey && data.change.updateDescription) {
          console.log('Received transaction update:', data.change);
          
          // Cập nhật transaction nếu nó đã tồn tại trong danh sách
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
            
            // Nếu không tìm thấy transaction, có thể nó đã bị loại khỏi danh sách do giới hạn
            // Trong trường hợp này, chúng ta nên yêu cầu dữ liệu mới
            subscribeToAllTransactions(timeRange, limit);
            return prev;
          });
        } else if (data.change.operationType === 'delete' && data.change.documentKey) {
          // Xóa transaction khỏi danh sách nếu nó tồn tại
          setTransactions((prev: Transaction[]) => 
            prev.filter((tx: Transaction) => tx._id !== data.change.documentKey._id)
          );
        } else {
          // Đối với các thao tác khác, đơn giản là yêu cầu dữ liệu mới
          subscribeToAllTransactions(timeRange, limit);
        }
      }
    });
    
    // Đăng ký nhận tất cả dữ liệu transactions
    subscribeToAllTransactions(timeRange, limit);
    
    return removeListener;
  }, [timeRange, limit]);

  return { transactions, loading };
} 