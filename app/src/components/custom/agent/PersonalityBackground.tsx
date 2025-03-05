import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { CirclePlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PersonalityBackgroundProps {
    agentLore: string;
    personality: string;
    onLoreChange: (value: string) => void;
    onPersonalityChange: (value: string) => void;
    onSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
    selectedCategories: string[];
    onValidationChange?: (isValid: boolean) => void;
    showValidation?: boolean;
}

interface ValidationErrors {
    agentLore: string;
    personality: string;
    categories: string;
}

const PersonalityBackground: React.FC<PersonalityBackgroundProps> = ({
    personality,
    onPersonalityChange,
    onSelectedCategories,
    selectedCategories,
    onValidationChange,
    showValidation = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({
        agentLore: '',
        personality: '',
        categories: '',
    });

    const validateFields = () => {
        const newErrors: ValidationErrors = {
            agentLore: '',
            personality: '',
            categories: '',
        };

        // Only show errors if showValidation is true
        if (showValidation) {
            // Validate personality
            if (!personality) {
                newErrors.personality = 'Personality description is required';
            } else if (personality.length < 20) {
                newErrors.personality = 'Personality description must be at least 20 characters';
            }

            // Validate categories
            if (selectedCategories.length === 0) {
                newErrors.categories = 'Please select at least one category';
            }
        }

        setErrors(newErrors);

        // Always check validation state even if not showing errors
        const isValid = !!(
            personality && 
            personality.length >= 20 && 
            selectedCategories.length > 0
        );

        if (onValidationChange) {
            onValidationChange(isValid);
        }

        return isValid;
    };

    useEffect(() => {
        validateFields();
    }, [personality, selectedCategories, showValidation]);

    const categories = {
        Categories: [
            { icon: "🎮", label: "Meme" },
            { icon: "🌐", label: "DeFAI" },
            { icon: "🐦", label: "Alpha" },
            { icon: "🎮", label: "Tool Infra" },
            { icon: "🎬", label: "Trading" },
        ],
        
        Gender: [
            { icon: "👨", label: "Male" },
            { icon: "👩", label: "Female" },
            { icon: "⚧", label: "Non-Binary" },
            { icon: "👽", label: "Non-Human" }
        ]
    };

    const toggleCategory = (category: string) => {
        onSelectedCategories((prev: string[]) => 
            prev.includes(category)
                ? prev.filter((c: string) => c !== category)
                : [...prev, category]
        );
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Personality</label>
                <textarea
                    value={personality}
                    onChange={(e) => onPersonalityChange(e.target.value)}
                    placeholder="Describe your agent's personality traits"
                    rows={4}
                    className={`w-full bg-[#0B0E17] border border-[#1F2937] rounded-md p-3 text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] focus:outline-none resize-none ${
                        errors.personality ? 'border-red-500' : ''
                    }`}
                />
                {errors.personality && (
                    <p className="text-sm text-red-500">{errors.personality}</p>
                )}
            </div>

            <div className="space-y-2 flex items-center justify-between">
                <div className='space-y-2'>
                    <label className="text-sm font-medium text-gray-400">Category</label>
                    <p className='text-gray-500 text-sm'>
                        Useful for making your character discoverable by others in Sloth Agent
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        {selectedCategories.map(category => (
                            <span key={category} className="px-3 py-1 bg-[#1F2937] text-sm text-white">
                                {category}
                            </span>
                        ))}
                    </div>
                    {errors.categories && (
                        <p className="text-sm text-red-500">{errors.categories}</p>
                    )}
                </div>
                <CirclePlus 
                    onClick={() => setIsOpen(true)}
                    className='w-5 h-5 text-white hover:text-gray-400 transition-colors cursor-pointer' 
                />
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
                                            className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
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