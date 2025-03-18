let socket: WebSocket | null = null;
const listeners: Record<string, Set<(data: any) => void>> = {
  tokens: new Set(),
  agents: new Set(),
  transactions: new Set(),
  totalVolume: new Set(),
  tokenByAddress: new Set(),
  solanaTokens: new Set(),
};

// Initialize WebSocket connection
export function initWebSocket() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  // Use the correct WebSocket URL based on your deployment
  const wsUrl = process.env.PUBLIC_WS_URL || 'ws://localhost:333';
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connected');
    
    // Subscribe to data types that have listeners
    Object.entries(listeners).forEach(([dataType, listenerSet]) => {
      if (listenerSet.size > 0) {
        subscribeToDataType(dataType);
      }
    });
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === 'data' || message.type === 'update') {
        const dataType = message.dataType;
        
        if (dataType && listeners[dataType]) {
          // Notify all listeners for this data type
          listeners[dataType].forEach(callback => {
            callback(message.type === 'data' ? message.data : message);
          });
        }
        
        // Also handle collection-based messages for backward compatibility
        if (message.collection && listeners[message.collection]) {
          listeners[message.collection].forEach(callback => {
            callback(message.type === 'data' ? message.data : message);
          });
        }
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
    // Attempt to reconnect after a delay
    setTimeout(initWebSocket, 3000);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (socket) {
      socket.close();
    }
  };
}

// Subscribe to a specific data type
export function subscribeToDataType(dataType: string, params: Record<string, any> = {}) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    initWebSocket();
    return;
  }
  
  socket.send(JSON.stringify({
    type: 'subscribe',
    dataType,
    ...params
  }));
}

// Add a listener for a specific data type
export function addDataListener(dataType: string, callback: (data: any) => void) {
  if (!listeners[dataType]) {
    listeners[dataType] = new Set();
  }
  
  listeners[dataType].add(callback);
  
  // If this is the first listener, subscribe to the data
  if (listeners[dataType].size === 1 && socket && socket.readyState === WebSocket.OPEN) {
    subscribeToDataType(dataType);
  }
  
  // Initialize WebSocket if not already connected
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    initWebSocket();
  }
  
  // Return a function to remove the listener
  return () => {
    listeners[dataType].delete(callback);
  };
}

// Subscribe to transactions for a specific token
export function subscribeToTransactions(tokenAddress: string, timeRange: string = '24h') {
  subscribeToDataType('transactions', { tokenAddress, timeRange });
}

// Subscribe to a token by its address
export function subscribeToTokenByAddress(address: string) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    initWebSocket();
    return;
  }
  
  socket.send(JSON.stringify({
    type: 'subscribe',
    dataType: 'tokenByAddress',
    address
  }));
}

// Add a helper function for totalVolume with timeRange
export function subscribeTotalVolume(timeRange?: string) {
  subscribeToDataType('totalVolume', timeRange ? { timeRange } : {});
}

// Subscribe to all transactions
export function subscribeToAllTransactions(timeRange: string = '30d', limit: number = 100) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    initWebSocket();
    return;
  }
  
  socket.send(JSON.stringify({
    type: 'subscribe',
    dataType: 'allTransactions',
    timeRange,
    limit
  }));
}

// Subscribe to Solana token creation events
export function subscribeToSolanaTokens(accountAddress: string) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    initWebSocket();
    return;
  }
  
  socket.send(JSON.stringify({
    type: 'subscribe',
    dataType: 'solanaTokens',
    accountAddress
  }));
}

// Initialize WebSocket on client side
if (typeof window !== 'undefined') {
  initWebSocket();
} 