
interface FunctionTool {
    name: string;
    parameters: Record<string, unknown>;
    strict: boolean;
    type: 'function';
    description: string;    
} 

// Define function tools for OpenAI function calling
export const functionTools: Array<FunctionTool> = [
    {
        type: "function",
        name: "getTokenPrice",
        description: "Get current price information for a specific token",
        parameters: {
            type: "object",
            properties: {
                token: {
                    type: "string",
                    description: "Token symbol or address to get price for"
                }
            },
            required: ["token"],
            additionalProperties: false
        },
        strict: true
    },
    {
        type: "function",
        name: "getWalletTokenBalancesPrices",
        description: "Get token balances and prices for a wallet address",
        parameters: {
            type: "object",
            properties: {
                wallet: {
                    type: "string",
                    description: "Wallet address to check balances for"
                },
                chain: {
                    type: "string",
                    description: "Blockchain network",
                    enum: ["eth", "bnb", "polygon", "arbitrum", "optimism", "base", "avalanche"]
                }
            },
            required: ["wallet", "chain"],
            additionalProperties: false
        },
        strict: true
    },
    {
        type: "function",
        name: "getTrendingTokens",
        description: "Get list of trending tokens with price and market data",
        parameters: {
            type: "object",
            properties: {
                limit: {
                    type: "number",
                    description: "Number of trending tokens to return",
                }
            },
            required: ["limit"],
            additionalProperties: false
        },
        strict: true
    },
    {
        type: "function",
        name: "getWalletNFTs",
        description: "Get NFTs owned by a wallet address",
        parameters: {
            type: "object",
            properties: {
                wallet: {
                    type: "string",
                    description: "Wallet address to check NFTs for"
                },
                chain: {
                    type: "string",
                    description: "Blockchain network",
                    enum: ["eth", "bnb", "polygon", "arbitrum", "optimism", "base", "avalanche"]
                }
            },
            required: ["wallet", "chain"],
            additionalProperties: false
        },
        strict: true
    },
    {
        type: "function",
        name: "getWalletNetWorth",
        description: "Calculate total net worth of a wallet across tokens and NFTs",
        parameters: {
            type: "object",
            properties: {
                wallet: {
                    type: "string",
                    description: "Wallet address to calculate net worth for"
                }
            },
            required: ["wallet"],
            additionalProperties: false
        },
        strict: true
    },
    {
        type: "function",
        name: "getDefiPositionsSummary",
        description: "Get summary of DeFi positions for a wallet",
        parameters: {
            type: "object",
            properties: {
                wallet: {
                    type: "string",
                    description: "Wallet address to check DeFi positions for"
                },
                chain: {
                    type: "string",
                    description: "Blockchain network",
                    enum: ["eth", "bnb", "polygon", "arbitrum", "optimism", "base", "avalanche"]
                }
            },
            required: ["wallet", "chain"],
            additionalProperties: false
        },
        strict: true
    },
    {
        type: "function",
        name: "getTokenHolderStats",
        description: "Get statistics about token holders",
        parameters: {
            type: "object",
            properties: {
                tokenAddress: {
                    type: "string",
                    description: "Token contract address"
                },
                chain: {
                    type: "string",
                    description: "Blockchain network",
                    enum: ["eth", "bnb", "polygon", "arbitrum", "optimism", "base", "avalanche"]
                }
            },
            required: ["tokenAddress", "chain"],
            additionalProperties: false
        },
        strict: true
    },
    {
        type: "function",
        name: "getTopGainersTokens",
        description: "Get list of top gaining tokens in the last 24 hours",
        parameters: {
            type: "object",
            properties: {
                limit: {
                    type: "number",
                    description: "Number of top gainers to return",
                }
            },
            required: ["limit"],
            additionalProperties: false
        },
        strict: true
    },
    {
        type: "function",
        name: "sui_getAllBalances",
        description: "Get all token balances for a Sui wallet",
        parameters: {
            type: "object",
            properties: {
                wallet: {
                    type: "string",
                    description: "Sui wallet address"
                }
            },
            required: ["wallet"],
            additionalProperties: false
        },
        strict: true
    },
    {
        type: "function",
        name: "sui_getBalance",
        description: "Get balance of a specific coin for a Sui wallet",
        parameters: {
            type: "object",
            properties: {
                wallet: {
                    type: "string",
                    description: "Sui wallet address"
                },
                coinType: {
                    type: "string",
                    description: "Coin type to check balance for"
                }
            },
            required: ["wallet", "coinType"],
            additionalProperties: false
        },
        strict: true
    },
    {
        type: "function",
        name: "web_search",
        description: "Search for information about any topic",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "The search query"
                }
            },
            required: ["query"],
            additionalProperties: false
        },
        strict: true
    },
] as const;

