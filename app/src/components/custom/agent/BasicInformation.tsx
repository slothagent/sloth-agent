import React from 'react';

interface BasicInformationProps {
    agentName: string;
    description: string;
    ticker: string;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onTickerChange: (value: string) => void;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
    agentName,
    description,
    ticker,
    onNameChange,
    onDescriptionChange,
    onTickerChange
}) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Agent Name
                </label>
                <input
                    type="text"
                    value={agentName}
                    onChange={(e) => onNameChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:ring-2 focus:ring-[#93E905] focus:border-[#93E905] text-black placeholder-gray-500"
                    placeholder="Enter agent name"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:ring-2 focus:ring-[#93E905] focus:border-[#93E905] text-black placeholder-gray-500 h-32"
                    placeholder="Enter a brief description of your agent"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Ticker
                </label>
                <input
                    type="text"
                    value={ticker}
                    onChange={(e) => onTickerChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:ring-2 focus:ring-[#93E905] focus:border-[#93E905] text-black placeholder-gray-500"
                    placeholder="Enter token ticker (e.g., BTC, ETH)"
                />
            </div>
        </div>
    );
};

export default BasicInformation; 