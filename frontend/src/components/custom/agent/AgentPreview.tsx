import React from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Star } from 'lucide-react';

interface AgentPreviewProps {
    name: string;
    description: string;
    ticker: string;
    imageUrl: string;
    personality: string;
}

const AgentPreview: React.FC<AgentPreviewProps> = ({
    name,
    description,
    ticker,
    imageUrl,
    personality,
}) => {
    return (
        <div className="space-y-4">
            {/* Agent Card */}
            <Card className="bg-[#161B28] border border-[#1F2937] p-4 rounded-lg">
                <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#0B0E17] border border-[#1F2937] flex items-center justify-center">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={name || 'Agent'}
                                className="object-cover"
                            />
                        ) : (
                            <Bot className="w-8 h-8 text-gray-400" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-white">
                                    {name || 'Unnamed Agent'}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    ${ticker || 'TICKER'}
                                </p>
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                            {description || 'No description provided'}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Personality Preview */}
            {personality && (
                <Card className="bg-[#161B28] border border-[#1F2937] p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-gray-400" />
                        <h4 className="text-sm font-medium text-gray-400">Personality</h4>
                    </div>
                    <p className="text-sm text-gray-400">
                        {personality}
                    </p>
                </Card>
            )}
        </div>
    );
};

export default AgentPreview; 