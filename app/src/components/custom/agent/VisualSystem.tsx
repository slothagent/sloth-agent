import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import { Upload, Sparkles, Pencil, User, Shirt, Package, Footprints, Crown, Smile, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VisualSystemProps {
    imageUrl: string;
    avatarEnabled: boolean;
    onUploadImage: (file: File) => Promise<string>;
    onGenerateImage: () => Promise<void>;
    onAvatarToggle: (enabled: boolean) => void;
    selectedAvatar?: string;
    onAvatarSelect?: (avatarId: string) => void;
    isGenerating: boolean;
    onValidationChange?: (isValid: boolean) => void;
    showValidation?: boolean;
    imagePrompt: string;
    setImagePrompt: (prompt: string) => void;
}

interface AvatarCustomization {
    skinTone: string;
    selectedCategory: string;
    bodyType: string;
    outfitColor: string;
    accessories: string[];
    expression: string;
}

const VisualSystem: React.FC<VisualSystemProps> = ({
    imageUrl,
    avatarEnabled,
    onUploadImage,
    onGenerateImage,
    onAvatarToggle,
    selectedAvatar,
    onAvatarSelect,
    isGenerating,
    onValidationChange,
    showValidation = false,
    imagePrompt,
    setImagePrompt
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [selectedSkinTone, setSelectedSkinTone] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('body');
    const [activeTab, setActiveTab] = useState<'upload' | 'generate'>('upload');
    const [avatarCustomization, setAvatarCustomization] = useState<AvatarCustomization>({
        skinTone: 'default',
        selectedCategory: 'body',
        bodyType: 'default',
        outfitColor: '#000000',
        accessories: [],
        expression: 'neutral'
    });
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [error, setError] = useState<string>('');

    const validateFields = () => {
        let isValid = true;
        let errorMessage = '';

        if (!avatarEnabled && !imageUrl) {
            isValid = false;
            if (showValidation) {
                errorMessage = 'Please upload or generate an image for your agent';
            }
        }

        if (avatarEnabled && !selectedAvatar) {
            isValid = false;
            if (showValidation) {
                errorMessage = 'Please select an avatar for your agent';
            }
        }

        setError(errorMessage);
        if (onValidationChange) {
            onValidationChange(isValid);
        }

        return isValid;
    };

    useEffect(() => {
        validateFields();
    }, [imageUrl, avatarEnabled, selectedAvatar, showValidation]);

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

    const skinTones = [
        { id: 'light1', color: '#FFDBB4', name: 'Light 1' },
        { id: 'light2', color: '#EDB98A', name: 'Light 2' },
        { id: 'medium1', color: '#D08B5B', name: 'Medium 1' },
        { id: 'medium2', color: '#AE5D29', name: 'Medium 2' },
        { id: 'dark1', color: '#694D3D', name: 'Dark 1' },
        { id: 'dark2', color: '#482F2F', name: 'Dark 2' },
        { id: 'dark3', color: '#361F1F', name: 'Dark 3' },
        { id: 'dark4', color: '#241414', name: 'Dark 4' }
    ];

    const avatarCategories = [
        { id: 'body', icon: <User className="w-6 h-6" />, label: 'Body', color: '#4CAF50' },
        { id: 'outfits', icon: <Package className="w-6 h-6" />, label: 'Outfits', color: '#2196F3' },
        { id: 'tops', icon: <Shirt className="w-6 h-6" />, label: 'Tops', color: '#9C27B0' },
        { id: 'bottoms', icon: <Package className="w-6 h-6" />, label: 'Bottoms', color: '#FF9800' },
        { id: 'shoes', icon: <Footprints className="w-6 h-6" />, label: 'Shoes', color: '#F44336' },
        { id: 'accessories', icon: <Crown className="w-6 h-6" />, label: 'Accessories', color: '#795548' },
        { id: 'expression', icon: <Smile className="w-6 h-6" />, label: 'Expression', color: '#607D8B' },
    ];

    const avatarPresets = [
        { 
            id: 'basic1', 
            name: 'Basic 1',
            imageUrl: '/avatars/3d/basic1.png',
            type: '3d',
            description: 'Simple casual style',
            customization: {
                skinTone: 'light1',
                bodyType: 'default',
                outfitColor: '#2196F3',
                accessories: [],
                expression: 'neutral'
            }
        },
        { 
            id: 'basic2', 
            name: 'Basic 2', 
            imageUrl: '/avatars/3d/basic2.png',
            type: '3d',
            description: 'Professional look'
        },
    ];

    const handleSkinToneSelect = (toneId: string) => {
        setSelectedSkinTone(toneId);
        setAvatarCustomization(prev => ({
            ...prev,
            skinTone: toneId
        }));
    };

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
    };

    const handleCustomizationChange = (key: keyof AvatarCustomization, value: any) => {
        setAvatarCustomization(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleAvatarPresetSelect = (presetId: string) => {
        const preset = avatarPresets.find(p => p.id === presetId);
        if (preset && onAvatarSelect) {
            onAvatarSelect(presetId);
            setAvatarCustomization(prev => ({
                ...prev,
                ...preset.customization
            }));
        }
    };


    return (
        <div className="space-y-6">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
                    {error}
                </div>
            )}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Agent Image</label>
                <div className="mb-4 border-b border-[#1F2937]">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-4 py-2 ${
                                activeTab === 'upload'
                                ? 'text-white border-b-2 border-white'
                                : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            Upload Image
                        </button>
                        <button
                            onClick={() => setActiveTab('generate')}
                            className={`px-4 py-2 ${
                                activeTab === 'generate'
                                ? 'text-white border-b-2 border-white'
                                : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            Generate Image
                        </button>
                    </div>
                </div>

                {activeTab === 'upload' ? (
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
                                    <img
                                        src={imageUrl}
                                        alt="Agent"
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
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Image Generation Prompt</label>
                            <textarea
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                placeholder="Describe the image you want to generate..."
                                rows={4}
                                className="w-full bg-[#0B0E17] border border-[#1F2937] rounded-md p-3 text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] focus:outline-none resize-none"
                            />
                        </div>
                        
                        <div className="flex justify-center">
                            <Button
                                onClick={onGenerateImage}
                                disabled={!imagePrompt.trim() || isGenerating}
                                className="bg-[#2196F3] text-white hover:bg-[#1E88E5] disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="animate-spin mr-2">⚡</span>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate Image
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* {imageUrl && (
                            <div className="flex flex-col items-center gap-4 mt-4">
                                <div className="relative w-64 h-64 rounded-lg overflow-hidden">
                                    <Image
                                        src={imageUrl}
                                        alt="Generated Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        )} */}

                        {imageUrl && (
                            <div className="flex flex-col items-center gap-4 mt-4">
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                    <img
                                        src={imageUrl}
                                        alt="Current"
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {isAvatarModalOpen && (
                <div className="fixed inset-0 bg-[#0B0E17] z-50 flex items-center justify-center">
                    <div className="bg-[#0B0E17] w-full h-screen overflow-y-auto p-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-white">Avatar Customization</h2>
                                <button 
                                    onClick={() => setIsAvatarModalOpen(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-[#242938] border border-[#2F3850]">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-400">Enable Avatar</label>
                                        <p className="text-xs text-gray-500">2D or 3D avatars can be used for content creation and customization with wearables.</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onAvatarToggle(!avatarEnabled)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                avatarEnabled ? 'bg-[#2196F3]' : 'bg-gray-700'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    avatarEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {avatarEnabled && (
                                    <>
                                        <div className="mt-6">
                                            <label className="text-sm font-medium text-gray-400 mb-3 block">Skin Tone</label>
                                            <div className="flex gap-3">
                                                <button 
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 text-xs text-white font-medium ${
                                                        selectedSkinTone === 'all' ? 'border-2 border-[#2196F3]' : ''
                                                    }`}
                                                    onClick={() => handleSkinToneSelect('all')}
                                                >
                                                    All
                                                </button>
                                                {skinTones.map((tone) => (
                                                    <button
                                                        key={tone.id}
                                                        className={`w-8 h-8 rounded-full hover:ring-2 hover:ring-[#2196F3] transition-all duration-200 ${
                                                            selectedSkinTone === tone.id ? 'ring-2 ring-[#2196F3]' : ''
                                                        }`}
                                                        onClick={() => handleSkinToneSelect(tone.id)}
                                                    >
                                                        <span
                                                            className="block w-full h-full rounded-full"
                                                            style={{ backgroundColor: tone.color }}
                                                            title={tone.name}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                            {avatarCategories.map((category) => (
                                                <button
                                                    key={category.id}
                                                    className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-colors ${
                                                        selectedCategory === category.id ? 'bg-[#242938]' : 'hover:bg-[#242938]'
                                                    }`}
                                                    style={{ minWidth: '80px' }}
                                                    onClick={() => handleCategorySelect(category.id)}
                                                >
                                                    <div 
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                                                        style={{ backgroundColor: `${category.color}30` }}
                                                    >
                                                        <div style={{ color: category.color }}>
                                                            {category.icon}
                                                        </div>
                                                    </div>
                                                    <span className="text-gray-300">{category.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                                            {avatarPresets.map((preset) => (
                                                <button
                                                    key={preset.id}
                                                    className={`relative aspect-square bg-[#242938] rounded-2xl overflow-hidden hover:bg-[#2A304A] transition-colors ${
                                                        selectedAvatar === preset.id ? 'ring-4 ring-[#4CAF50]' : ''
                                                    }`}
                                                    onClick={() => handleAvatarPresetSelect(preset.id)}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Image
                                                            src={preset.imageUrl}
                                                            alt={preset.name}
                                                            width={200}
                                                            height={300}
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 p-2 text-center bg-gradient-to-t from-black/80 to-transparent">
                                                        <span className="text-sm text-white">{preset.name}</span>
                                                    </div>
                                                    {selectedAvatar === preset.id && (
                                                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center">
                                                            <Check className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisualSystem; 