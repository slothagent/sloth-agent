import React from 'react';

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
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Agent Lore
                </label>
                <textarea
                    value={agentLore}
                    onChange={(e) => onLoreChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:ring-2 focus:ring-[#93E905] focus:border-[#93E905] text-black placeholder-gray-500 h-32"
                    placeholder="Enter the background story of your agent"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Personality
                </label>
                <textarea
                    value={personality}
                    onChange={(e) => onPersonalityChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:ring-2 focus:ring-[#93E905] focus:border-[#93E905] text-black placeholder-gray-500 h-32"
                    placeholder="Describe your agent's personality traits and characteristics"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Communication Style
                </label>
                <textarea
                    value={communicationStyle}
                    onChange={(e) => onStyleChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:ring-2 focus:ring-[#93E905] focus:border-[#93E905] text-black placeholder-gray-500 h-32"
                    placeholder="Describe how your agent communicates (e.g., formal, casual, uses emoji, concise, detailed)"
                />
            </div>
        </div>
    );
};

export default PersonalityBackground; 