import React from 'react';
import { Input } from "@/components/ui/input";

interface PersonalityBackgroundProps {
    agentLore: string;
    personality: string;
    communicationStyle: string;
    onLoreChange: (value: string) => void;
    onPersonalityChange: (value: string) => void;
    onStyleChange: (value: string) => void;
}

const PersonalityBackground: React.FC<PersonalityBackgroundProps> = ({
    agentLore,
    personality,
    communicationStyle,
    onLoreChange,
    onPersonalityChange,
    onStyleChange
}) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Short Bio</label>
                <textarea
                    value={agentLore}
                    onChange={(e) => onLoreChange(e.target.value)}
                    placeholder="Enter the background story of your agent"
                    rows={4}
                    className="w-full bg-[#0B0E17] border border-[#1F2937] rounded-md p-3 text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] focus:outline-none resize-none"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Personality</label>
                <textarea
                    value={personality}
                    onChange={(e) => onPersonalityChange(e.target.value)}
                    placeholder="Describe your agent's personality traits"
                    rows={4}
                    className="w-full bg-[#0B0E17] border border-[#1F2937] rounded-md p-3 text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] focus:outline-none resize-none"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Category</label>
                
            </div>
        </div>
    );
};

export default PersonalityBackground; 