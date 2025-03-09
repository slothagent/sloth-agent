"use client"

import React from 'react';
import TwitterView from './TwitterView';

const Social = ({ tokenData }: { tokenData: any }) => {
    return (
        <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto bg-[#0F1724] p-4">
            <div className="max-w-[1400px] mx-auto">
                <TwitterView tokenData={tokenData} />
            </div>
        </div>
    );
};

export default Social;
