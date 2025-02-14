"use client"

import React from 'react';
import ChatInterface from './ChatInterface';
import TwitterView from './TwitterView';
import { Agent } from '@/types/agent';

const Social: React.FC<{ agentData: Agent }> = ({ agentData }) => {
    return (
        <div className="grid grid-cols-4 gap-4 h-[calc(100vh-4rem)]">
            <div className="col-span-3">
                <ChatInterface />
            </div>
            <div className="col-span-1">
                <TwitterView agentData={agentData} />
            </div>
        </div>
    );
};

export default Social;
