import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { CirclePlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const categories = {
        Origin: [
            { icon: "🎮", label: "Anime" },
            { icon: "🌐", label: "Web3" },
            { icon: "🐦", label: "Twitter" },
            { icon: "🎮", label: "Games" },
            { icon: "🎬", label: "Movies" },
            { icon: "📚", label: "Books" },
            { icon: "😂", label: "Memes" },
            { icon: "🌍", label: "Real Life" },
            { icon: "⭐", label: "Celebrity" },
            { icon: "👾", label: "Original Characters" },
            { icon: "📺", label: "VTuber" }
        ],
        Goal: [
            { icon: "🎭", label: "Roleplay" },
            { icon: "🤖", label: "Assistant" },
            { icon: "🎯", label: "Mascot" }
        ],
        Genre: [
            { icon: "💥", label: "Action" },
            { icon: "🌌", label: "Fictional" },
            { icon: "💹", label: "Finance" },
            { icon: "⚖️", label: "Politics" },
            { icon: "🧠", label: "Philosophy" },
            { icon: "❤️", label: "Romance" },
            { icon: "📜", label: "Historical" },
            { icon: "👻", label: "Horror" }
        ],
        Character: [
            { icon: "👨", label: "Male" },
            { icon: "👩", label: "Female" },
            { icon: "⚧", label: "Non-Binary" },
            { icon: "👽", label: "Non-Human" }
        ]
    };

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev => 
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

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
                <p className='text-gray-500 text-sm'>
                    Useful for making your character discoverable by others in Holoworld
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    {selectedCategories.map(category => (
                        <span key={category} className="px-3 py-1 bg-[#1F2937] rounded-full text-sm text-white">
                            {category}
                        </span>
                    ))}
                    <CirclePlus 
                        onClick={() => setIsOpen(true)}
                        className='w-4 h-4 text-gray-500 hover:text-gray-400 transition-colors cursor-pointer' 
                    />
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-[#0B0E17] text-white border-[#1F2937] max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white">Choose Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        {Object.entries(categories).map(([section, items]) => (
                            <div key={section} className="space-y-3">
                                <h3 className="text-gray-400 font-medium">{section}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {items.map(({ icon, label }) => (
                                        <button
                                            key={label}
                                            onClick={() => toggleCategory(label)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                                                selectedCategories.includes(label)
                                                    ? 'bg-[#2196F3] text-white'
                                                    : 'bg-[#1F2937] text-gray-300 hover:bg-[#374151]'
                                            }`}
                                        >
                                            <span>{icon}</span>
                                            <span>{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PersonalityBackground; 