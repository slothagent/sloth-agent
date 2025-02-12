import React from 'react';
import { Upload, Wand2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface VisualSystemProps {
    systemType: string;
    onSystemTypeChange: (value: string) => void;
    onUploadImage: () => void;
    onGenerateImage: () => void;
}

const VisualSystem: React.FC<VisualSystemProps> = ({
    systemType,
    onSystemTypeChange,
    onUploadImage,
    onGenerateImage
}) => {
    const systemTypes = [
        { value: 'ai_chatbot', label: 'AI Chatbot' },
        { value: 'trading_bot', label: 'Trading Bot' },
        { value: 'community_manager', label: 'Community Manager' }
    ];

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Agent Image
                </label>
                <div className="flex gap-4">
                    <button 
                        onClick={onUploadImage}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded hover:bg-[#93E905] hover:border-[#93E905] text-black transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Image
                    </button>
                    <button 
                        onClick={onGenerateImage}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded hover:bg-[#93E905] hover:border-[#93E905] text-black transition-colors"
                    >
                        <Wand2 className="w-4 h-4" />
                        Generate with AI
                    </button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    System Type
                </label>
                <Select onValueChange={onSystemTypeChange} value={systemType}>
                    <SelectTrigger className="w-full border-2 border-black">
                        <SelectValue placeholder="Select system type" />
                    </SelectTrigger>
                    <SelectContent>
                        {systemTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default VisualSystem; 