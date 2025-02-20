import React from 'react';
import { Input } from "@/components/ui/input";

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
    onTickerChange,
}) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Agent Name</label>
                <Input
                    value={agentName}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Enter agent name"
                    className="w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Enter agent description"
                    rows={4}
                    className="w-full bg-[#0B0E17] border border-[#1F2937] rounded-md p-3 text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] focus:outline-none resize-none"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Ticker</label>
                <Input
                    value={ticker}
                    onChange={(e) => onTickerChange(e.target.value.toUpperCase())}
                    placeholder="Enter ticker symbol (e.g. BTC)"
                    className="w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] uppercase"
                    maxLength={5}
                />
                <p className="text-xs text-gray-500">Maximum 5 characters, automatically converted to uppercase</p>
            </div>
        </div>
    );
};

export default BasicInformation; 