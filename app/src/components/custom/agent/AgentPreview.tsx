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
        <div className="bg-[#fffbf2] rounded-none border-2 border-[#8b7355] p-6 w-full">
            <div className="flex flex-col space-y-4">
                {/* Image and Basic Info */}
                <div className="flex items-start space-x-4">
                    <div className="w-24 h-24 relative rounded-none border-2 border-[#8b7355] overflow-hidden bg-[#fffbf2] flex-shrink-0">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#baa89d] font-pixel">
                                No Image
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-pixel text-[#8b7355] mb-1 truncate uppercase tracking-wider">{name || 'Unnamed Agent'}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {ticker && (
                                <span className="px-2 py-1 bg-[#8b7355] text-[#fffbf2] text-sm rounded-none font-pixel">
                                    ${ticker}
                                </span>
                            )}
                            {systemType && (
                                <span className="px-2 py-1 bg-[#93E905] text-[#8b7355] text-sm rounded-none font-pixel border-2 border-[#8b7355]">
                                    {systemType.replace('_', ' ').split(' ').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </span>
                            )}
                            {personality && (
                                <span className="px-2 py-1 bg-[#fffbf2] text-[#8b7355] text-sm rounded-none font-pixel border-2 border-[#8b7355]">
                                    {personality.charAt(0).toUpperCase() + personality.slice(1)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="border-t-2 border-[#8b7355] pt-4">
                    <h4 className="text-sm font-pixel text-[#8b7355] mb-2 uppercase tracking-wider">Description</h4>
                    <p className="text-sm text-[#8b7355] font-pixel">
                        {description || 'No description available'}
                    </p>
                </div>

                {/* Agent Details */}
                <div className="border-t-2 border-[#8b7355] pt-4">
                    <h4 className="text-sm font-pixel text-[#8b7355] mb-2 uppercase tracking-wider">Agent Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm font-pixel">
                        <div>
                            <span className="text-[#baa89d]">Type:</span>
                            <span className="ml-2 text-[#8b7355]">
                                {systemType ? systemType.replace('_', ' ').split(' ').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ') : 'Not specified'}
                            </span>
                        </div>
                        <div>
                            <span className="text-[#baa89d]">Personality:</span>
                            <span className="ml-2 text-[#8b7355]">
                                {personality ? personality.charAt(0).toUpperCase() + personality.slice(1) : 'Not specified'}
                            </span>
                        </div>
                        <div>
                            <span className="text-[#baa89d]">Token:</span>
                            <span className="ml-2 text-[#8b7355]">
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