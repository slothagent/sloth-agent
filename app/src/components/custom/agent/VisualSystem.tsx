import React, { useRef } from 'react';
import { Upload, Wand2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from 'next/image';

interface VisualSystemProps {
    systemType: string;
    imageUrl: string;
    onSystemTypeChange: (value: string) => void;
    onUploadImage: (file: File) => Promise<string>;
    onGenerateImage: () => void;
}

const VisualSystem: React.FC<VisualSystemProps> = ({
    systemType,
    imageUrl,
    onSystemTypeChange,
    onUploadImage,
    onGenerateImage
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const systemTypes = [
        { value: 'ai_chatbot', label: 'AI Chatbot' },
        { value: 'trading_bot', label: 'Trading Bot' },
        { value: 'community_manager', label: 'Community Manager' }
    ];

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await onUploadImage(file);
            } catch (error) {
                console.error('Error uploading file:', error);
                // You might want to show an error toast here
            }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Agent Image
                </label>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <div className="flex gap-4">
                    <button 
                        onClick={handleUploadClick}
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
                {imageUrl && (
                    <div className="mt-4">
                        <Image
                            src={imageUrl}
                            alt="Agent image"
                            width={200}
                            height={200}
                            className="rounded-lg border-2 border-black"
                        />
                    </div>
                )}
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