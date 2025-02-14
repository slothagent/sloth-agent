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
        <div className="space-y-6 ">
            <div>
                <label className="block text-sm font-pixel text-[#8b7355] mb-2 uppercase tracking-wider">
                    Agent Name
                </label>
                <input
                    type="text"
                    value={agentName}
                    onChange={(e) => onNameChange(e.target.value)}
                    className="w-full px-4 py-2 bg-[#fffbf2] border-2 border-[#8b7355] rounded-none 
                     
                    focus:shadow-[2px_2px_0px_0px_rgba(139,115,85,1)]
                    focus:translate-x-[2px] focus:translate-y-[2px]
                    transition-all duration-200 outline-none
                    text-[#8b7355] placeholder-[#baa89d]"
                    placeholder="Enter agent name"
                />
            </div>
            <div>
                <label className="block text-sm font-pixel text-[#8b7355] mb-2 uppercase tracking-wider">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    className="w-full px-4 py-2 bg-[#fffbf2] border-2 border-[#8b7355] rounded-none 
                    
                    focus:shadow-[2px_2px_0px_0px_rgba(139,115,85,1)]
                    focus:translate-x-[2px] focus:translate-y-[2px]
                    transition-all duration-200 outline-none
                    text-[#8b7355] placeholder-[#baa89d] h-32 resize-none"
                    placeholder="Enter a brief description of your agent"
                />
            </div>
            <div>
                <label className="block text-sm font-pixel text-[#8b7355] mb-2 uppercase tracking-wider">
                    Ticker
                </label>
                <input
                    type="text"
                    value={ticker}
                    onChange={(e) => onTickerChange(e.target.value.toUpperCase())}
                    maxLength={5}
                    className="w-full px-4 py-2 bg-[#fffbf2] border-2 border-[#8b7355] rounded-none 
                    focus:shadow-[2px_2px_0px_0px_rgba(139,115,85,1)]
                    focus:translate-x-[2px] focus:translate-y-[2px]
                    transition-all duration-200 outline-none
                    text-[#8b7355] placeholder-[#baa89d] uppercase"
                    placeholder="Enter token ticker (max 5 chars)"
                />
            </div>
        </div>
    );
};

export default BasicInformation; 