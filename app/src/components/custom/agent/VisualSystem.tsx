import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import { Upload, Sparkles } from 'lucide-react';

interface VisualSystemProps {
    systemType: string;
    imageUrl: string;
    onSystemTypeChange: (value: string) => void;
    onUploadImage: (file: File) => Promise<string>;
    onGenerateImage: () => Promise<void>;
}

const VisualSystem: React.FC<VisualSystemProps> = ({
    systemType,
    imageUrl,
    onSystemTypeChange,
    onUploadImage,
    onGenerateImage,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await onUploadImage(file);
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            await onUploadImage(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">System Type</label>
                <select
                    value={systemType}
                    onChange={(e) => onSystemTypeChange(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-[#1F2937] rounded-md p-3 text-white focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] focus:outline-none"
                >
                    <option value="" className="bg-[#0B0E17]">Select system type</option>
                    <option value="trading" className="bg-[#0B0E17]">Trading Bot</option>
                    <option value="social" className="bg-[#0B0E17]">Social Media Manager</option>
                    <option value="research" className="bg-[#0B0E17]">Research Assistant</option>
                    <option value="customer" className="bg-[#0B0E17]">Customer Service</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Agent Image</label>
                <div 
                    className="relative border-2 border-dashed border-[#1F2937] rounded-lg p-6 bg-[#0B0E17] hover:border-[#2196F3] transition-colors duration-200"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    
                    {imageUrl ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                <Image
                                    src={imageUrl}
                                    alt="Agent"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                className="bg-[#161B28] text-gray-400 hover:bg-[#1C2333] hover:text-white border border-[#1F2937]"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Change Image
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-32 h-32 rounded-lg bg-[#161B28] border border-[#1F2937] flex items-center justify-center">
                                <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="text-center">
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="outline"
                                    className="mb-2 bg-[#161B28] text-gray-400 hover:bg-[#1C2333] hover:text-white border border-[#1F2937]"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Image
                                </Button>
                                <p className="text-sm text-gray-400">or drag and drop</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center mt-4">
                    <Button
                        onClick={onGenerateImage}
                        className="bg-[#2196F3] text-white hover:bg-[#1E88E5] transition-colors duration-200"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate with AI
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VisualSystem; 