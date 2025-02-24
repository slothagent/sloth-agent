import React from 'react';
import { Input } from "@/components/ui/input";

interface CapabilitiesProps {
    knowledgeAreas: string;
    tools: string[];
    examples: string;
    onKnowledgeChange: (value: string) => void;
    onToolChange: (value: string) => void;
    onExamplesChange: (value: string) => void;
}

const Capabilities: React.FC<CapabilitiesProps> = ({
    knowledgeAreas,
    tools,
    examples,
    onKnowledgeChange,
    onToolChange,
    onExamplesChange,
}) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Knowledge Areas</label>
                <textarea
                    value={knowledgeAreas}
                    onChange={(e) => onKnowledgeChange(e.target.value)}
                    placeholder="Describe the areas of knowledge your agent specializes in"
                    rows={4}
                    className="w-full bg-[#0B0E17] border border-[#1F2937] rounded-md p-3 text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] focus:outline-none resize-none"
                />
            </div>
        </div>
    );
};

export default Capabilities; 