"use client"

import React from 'react';
import ChatInterface from './ChatInterface';
import TwitterView from './TwitterView';
import { Agent } from '@/types/agent';

const Social = ({ tokenData }: { tokenData: any }) => {
    return (
        <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
                <TwitterView tokenData={tokenData} />
            </div>
        </div>
    );
};

export default Social;
