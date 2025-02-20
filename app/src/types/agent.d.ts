type Agent = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description?: string | null;
    ticker: string;
    address: string;
    curveAddress: string;
    owner: string;
    systemType?: string | null;
    imageUrl?: string | null;
    agentLore?: string | null;
    personality?: string | null;
    communicationStyle?: string | null;
    knowledgeAreas?: string | null;
    tools: string[];
    examples?: string | null;
    twitterAuth?: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        scope: string;
        tokenType: string;
    };
    metrics?: AgentMetrics;
};


type AgentMetrics = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    agentId: string;
    liquidityAmount: number;
    liquidityValue: number;
    blueChipHolding: number;
    holdersCount: number;
    holdersChange24h: number;
    smartMoneyValue: number;
    smartMoneyKol: number;
    totalTransactions: number;
    buyTransactions: number;
    sellTransactions: number;
    volumeLastHour: number;
    totalVolume: number;
    currentPrice: number;
    priceChange1m: number;
    marketCap: number;
    followersCount: number;
    topTweetsCount: number;
};

export type { Agent, AgentMetrics };