import { ObjectId } from 'mongodb';

export interface Agent {
    _id: ObjectId;
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
        _id: ObjectId;
        createdAt: Date;
        updatedAt: Date;
        agentId: string;
        accessToken: string;
        refreshToken: string | null;
        expiresAt: Date;
    } | null;
    createdAt: Date;
    updatedAt: Date;
} 