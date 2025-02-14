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
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-pixel text-[#8b7355] mb-2 uppercase tracking-wider">
                    Agent Lore
                </label>
                <textarea
                    value={agentLore}
                    onChange={(e) => onLoreChange(e.target.value)}
                    className="w-full px-4 py-2 bg-[#fffbf2] border-2 border-[#8b7355] rounded-none 
                    focus:shadow-[2px_2px_0px_0px_rgba(139,115,85,1)]
                    focus:translate-x-[2px] focus:translate-y-[2px]
                    transition-all duration-200 outline-none
                    text-[#8b7355] placeholder-[#baa89d] h-32 resize-none"
                    placeholder="Enter the background story of your agent"
                />
            </div>
            <div>
                <label className="block text-sm font-pixel text-[#8b7355] mb-2 uppercase tracking-wider">
                    Personality
                </label>
                <textarea
                    value={personality}
                    onChange={(e) => onPersonalityChange(e.target.value)}
                    className="w-full px-4 py-2 bg-[#fffbf2] border-2 border-[#8b7355] rounded-none 
                    focus:shadow-[2px_2px_0px_0px_rgba(139,115,85,1)]
                    focus:translate-x-[2px] focus:translate-y-[2px]
                    transition-all duration-200 outline-none
                    text-[#8b7355] placeholder-[#baa89d] h-32 resize-none"
                    placeholder="Describe your agent's personality traits and characteristics"
                />
            </div>
            <div>
                <label className="block text-sm font-pixel text-[#8b7355] mb-2 uppercase tracking-wider">
                    Communication Style
                </label>
                <textarea
                    value={communicationStyle}
                    onChange={(e) => onStyleChange(e.target.value)}
                    className="w-full px-4 py-2 bg-[#fffbf2] border-2 border-[#8b7355] rounded-none 
                    focus:shadow-[2px_2px_0px_0px_rgba(139,115,85,1)]
                    focus:translate-x-[2px] focus:translate-y-[2px]
                    transition-all duration-200 outline-none
                    text-[#8b7355] placeholder-[#baa89d] h-32 resize-none"
                    placeholder="Describe how your agent communicates (e.g., formal, casual, uses emoji, concise, detailed)"
                />
            </div>
        </div>
    );
};

export default PersonalityBackground; 