import React from 'react';
import Image from 'next/image';

interface AgentPreviewProps {
    name: string;
    description: string;
    ticker: string;
    systemType: string;
    imageUrl?: string;
    personality?: string;
}

const AgentPreview: React.FC<AgentPreviewProps> = ({
    name,
    description,
    ticker,
    systemType,
    imageUrl,
    personality
}) => {
    return (
        <div className="bg-white rounded-lg border-2 border-black p-6 w-full">
            <div className="flex flex-col space-y-4">
                {/* Image and Basic Info */}
                <div className="flex items-start space-x-4">
                    <div className="w-24 h-24 relative rounded-lg border-2 border-black overflow-hidden bg-gray-100 flex-shrink-0">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-black mb-1 truncate">{name || 'Unnamed Agent'}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {ticker && (
                                <span className="px-2 py-1 bg-black text-white text-sm rounded">
                                    ${ticker}
                                </span>
                            )}
                            {systemType && (
                                <span className="px-2 py-1 bg-[#93E905] text-black text-sm rounded">
                                    {systemType.replace('_', ' ').split(' ').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </span>
                            )}
                            {personality && (
                                <span className="px-2 py-1 bg-gray-100 text-black text-sm rounded border border-black">
                                    {personality.charAt(0).toUpperCase() + personality.slice(1)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-black mb-2">Description</h4>
                    <p className="text-sm text-gray-600">
                        {description || 'No description available'}
                    </p>
                </div>

                {/* Agent Details */}
                <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-black mb-2">Agent Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-500">Type:</span>
                            <span className="ml-2 text-black">
                                {systemType ? systemType.replace('_', ' ').split(' ').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ') : 'Not specified'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Personality:</span>
                            <span className="ml-2 text-black">
                                {personality ? personality.charAt(0).toUpperCase() + personality.slice(1) : 'Not specified'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Token:</span>
                            <span className="ml-2 text-black">
                                {ticker ? `$${ticker}` : 'Not specified'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentPreview; 