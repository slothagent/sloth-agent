"use client"

import React from 'react';
import { Card } from '@/components/ui/card';
import { Twitter } from 'lucide-react';

const TwitterView: React.FC = () => {
    return (
        <Card className="h-full p-6 border-2 border-[#8b7355] rounded-lg">
            <div className="flex items-center gap-3 mb-4 border-b-2 border-[#8b7355]/20 pb-2">
                <Twitter className="w-5 h-5 text-[#8b7355]" />
                <h2 className="text-xl font-bold text-[#8b7355] font-mono tracking-tight">Twitter Feed</h2>
            </div>
        </Card>
    );
};

export default TwitterView; 