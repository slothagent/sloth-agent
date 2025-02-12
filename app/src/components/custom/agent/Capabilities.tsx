import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CapabilitiesProps {
    knowledgeAreas: string;
    tools: string[];
    examples: string;
    onKnowledgeChange: (value: string) => void;
    onToolChange: (tool: string) => void;
    onExamplesChange: (value: string) => void;
}

const Capabilities: React.FC<CapabilitiesProps> = ({
    knowledgeAreas,
    tools,
    examples,
    onKnowledgeChange,
    onToolChange,
    onExamplesChange
}) => {
    const toolOptions = ['API Integration', 'Data Analysis', 'Web Search'];

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Knowledge Areas
                </label>
                <textarea
                    value={knowledgeAreas}
                    onChange={(e) => onKnowledgeChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:ring-2 focus:ring-[#93E905] focus:border-[#93E905] text-black placeholder-gray-500 h-32"
                    placeholder="Describe the knowledge areas your agent specializes in"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Tools
                </label>
                <Select onValueChange={onToolChange} value={tools[0]}>
                    <SelectTrigger className="w-full border-2 border-black">
                        <SelectValue placeholder="Select tools" />
                    </SelectTrigger>
                    <SelectContent>
                        {toolOptions.map((tool) => (
                            <SelectItem key={tool} value={tool}>
                                {tool}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Example Interactions
                </label>
                <textarea
                    value={examples}
                    onChange={(e) => onExamplesChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:ring-2 focus:ring-[#93E905] focus:border-[#93E905] text-black placeholder-gray-500 h-32"
                    placeholder="Add example posts or comments"
                />
            </div>
        </div>
    );
};

export default Capabilities; 