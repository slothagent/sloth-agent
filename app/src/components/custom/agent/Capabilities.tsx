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
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-pixel text-[#8b7355] mb-2 uppercase tracking-wider">
                    Knowledge Areas
                </label>
                <textarea
                    value={knowledgeAreas}
                    onChange={(e) => onKnowledgeChange(e.target.value)}
                    className="w-full px-4 py-2 bg-[#fffbf2] border-2 border-[#8b7355] rounded-none 
                    focus:shadow-[2px_2px_0px_0px_rgba(139,115,85,1)]
                    focus:translate-x-[2px] focus:translate-y-[2px]
                    transition-all duration-200 outline-none
                    text-[#8b7355] placeholder-[#baa89d] h-32 resize-none"
                    placeholder="Describe the knowledge areas your agent specializes in"
                />
            </div>
            <div>
                <label className="block text-sm font-pixel text-[#8b7355] mb-2 uppercase tracking-wider">
                    Tools
                </label>
                <Select onValueChange={onToolChange} value={tools[0]}>
                    <SelectTrigger className="w-full border-2 border-[#8b7355] bg-[#fffbf2] text-[#8b7355] rounded-none
                    focus:shadow-[2px_2px_0px_0px_rgba(139,115,85,1)]
                    focus:translate-x-[2px] focus:translate-y-[2px]
                    transition-all duration-200 outline-none">
                        <SelectValue placeholder="Select tools" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#fffbf2] border-2 border-[#8b7355] text-[#8b7355] rounded-none">
                        {toolOptions.map((tool) => (
                            <SelectItem key={tool} value={tool} className="hover:bg-[#8b7355] hover:text-[#fffbf2]">
                                {tool}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-pixel text-[#8b7355] mb-2 uppercase tracking-wider">
                    Example Interactions
                </label>
                <textarea
                    value={examples}
                    onChange={(e) => onExamplesChange(e.target.value)}
                    className="w-full px-4 py-2 bg-[#fffbf2] border-2 border-[#8b7355] rounded-none 
                    focus:shadow-[2px_2px_0px_0px_rgba(139,115,85,1)]
                    focus:translate-x-[2px] focus:translate-y-[2px]
                    transition-all duration-200 outline-none
                    text-[#8b7355] placeholder-[#baa89d] h-32 resize-none"
                    placeholder="Add example posts or comments"
                />
            </div>
        </div>
    );
};

export default Capabilities; 