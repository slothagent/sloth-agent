import { ObjectId } from 'mongodb';

export interface Agent {
    _id: ObjectId;
    name: string;
    description?: string;
    ticker: string;
    address: string;
    curveAddress: string;
    owner: string;
    systemType?: string;
    imageUrl?: string;
    agentLore?: string;
    personality?: string;
    communicationStyle?: string;
    knowledgeAreas?: string;
    tools: string[];
    examples?: string;
    twitterAuth?: {
        accessToken: string;
        refreshToken?: string;
        expiresAt: Date;
    };
} 