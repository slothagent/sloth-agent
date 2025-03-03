"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Layout, User } from 'lucide-react';
import BasicInformation from '@/components/custom/agent/BasicInformation';
import VisualSystem from '@/components/custom/agent/VisualSystem';
import PersonalityBackground from '@/components/custom/agent/PersonalityBackground';
import Capabilities from '@/components/custom/agent/Capabilities';
import AgentPreview from '@/components/custom/agent/AgentPreview';
import { uploadImageToPinata } from '@/utils/pinata';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { factoryAbi } from '@/abi/factoryAbi';
import { initiateTwitterAuth } from '@/utils/twitter';
import { Button } from '../ui/button';

interface TwitterAuthData {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: string | null;
    tokenType: string | null;
    scope: string | null;
}

interface TwitterUserInfo {
    username: string | null;
    name: string | null;
    profileImageUrl: string | null;
}


const CreateAgent: React.FC = () => {

    const [currentStep, setCurrentStep] = useState<number>(1);
    const totalSteps = 5;

    const [agentName, setAgentName] = useState<string|null>(null);
    const [description, setDescription] = useState<string|null>(null);
    const [ticker, setTicker] = useState<string|null>(null);
    const [imageUrl, setImageUrl] = useState<string|null>(null);
    const [agentLore, setAgentLore] = useState<string|null>(null);
    const [personality, setPersonality] = useState<string|null>(null);
    const [knowledgeAreas, setKnowledgeAreas] = useState<string|null>(null);
    // Twitter config state
    const [twitterAuth, setTwitterAuth] = useState<TwitterAuthData | null>(null);
    const [skipTwitter, setSkipTwitter] = useState(false);
    const [twitterUserInfo, setTwitterUserInfo] = useState<TwitterUserInfo | null>(null);
    const [activeTab, setActiveTab] = useState<'preview' | 'avatar'>('preview');
    const [avatarEnabled, setAvatarEnabled] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [imagePrompt, setImagePrompt] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false)

    const router = useRouter();
    const { writeContractAsync, isSuccess,data:txData,isPending } = useWriteContract()
    const { address: OwnerAddress, isConnected } = useAccount()

    const [stepValidation, setStepValidation] = useState<{ [key: number]: boolean }>({
        1: false,
        2: false,
        3: false,
        4: false,
        5: false
    });

    const [showValidation, setShowValidation] = useState<boolean>(false);

    const handleStepValidation = (step: number, isValid: boolean) => {
        setStepValidation(prev => ({
            ...prev,
            [step]: isValid
        }));
    };

    const isCurrentStepValid = () => {
        return stepValidation[currentStep] || false;
    };

    const handleNext = () => {
        setShowValidation(true);
        if (currentStep < totalSteps && isCurrentStepValid()) {
            setCurrentStep(currentStep + 1);
            setShowValidation(false);
        } 
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setShowValidation(false);
        }
    };

    const handleUploadImage = async (file: File) => {
        try {
            if (!agentName) {
                toast.error('Please enter agent name first');
                throw new Error('Agent name is required');
            }
            
            const loadingToast = toast.loading('Uploading image...');
            const ipfsUrl = await uploadImageToPinata(file, agentName);
            setImageUrl(ipfsUrl);
            toast.dismiss(loadingToast);
            toast.success('Image uploaded successfully!');
            return ipfsUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image. Please try again.');
            throw error;
        }
    };

    const handleGenerateImage = async () => {
        try {
            if (!agentName || !description) {
                toast.error('Please enter agent name and description first');
                return;
            }
            setIsGenerating(true)
            const loadingToast = toast.loading('Generating image with AI...');

            // Generate image with DALL-E
            const prompt = `Create a funny, anime-style logo for a crypto token associated with "${agentName}". The design should be playful and meme-inspired, incorporating elements like exaggerated facial expressions, chibi characters, or internet meme aesthetics. It should still maintain a modern and minimalist look, making it suitable for a crypto token. 

                Token details:
                - Agent: ${agentName}
                - Description: ${description || "No description provided"}

                Ensure the logo is clear, memorable, and scalable across different sizes. ${imagePrompt}`;


            
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }

            const { imageUrl } = await response.json();

            // Download the image and convert to File object
            const imageResponse = await fetch(imageUrl);
            const blob = await imageResponse.blob();
            const file = new File([blob], `${agentName}.png`, { type: 'image/png' });

            // Upload to Pinata
            const ipfsUrl = await uploadImageToPinata(file, agentName);
            setImageUrl(ipfsUrl);
            setIsGenerating(false)
            toast.dismiss(loadingToast);
            toast.success('Image generated and uploaded successfully!');
        } catch (error) {
            console.error('Error generating image:', error);
            toast.error('Failed to generate image. Please try again.');
        }
    };

    const handleKnowledgeChange = (value: string) => {
        setKnowledgeAreas(value);
    };

    const handleTwitterConnect = async () => {
        try {
            const tokenData = await initiateTwitterAuth() as TwitterAuthData;
            setTwitterAuth(tokenData);

            // // Fetch user information after successful authentication
            if (tokenData?.accessToken) {
                const response = await fetch('/api/twitter/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ accessToken: tokenData.accessToken }),
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    setTwitterUserInfo({
                        username: userData.data.username,
                        name: userData.data.name,
                        profileImageUrl: userData.data.profile_image_url,
                    });
                }
            }

            toast.success('Successfully connected to Twitter');
        } catch (error) {
            console.error('Error connecting to Twitter:', error);
            toast.error('Failed to connect to Twitter');
        }
    };

    const stringToSlug = (text: string) => {
        return text
            .normalize("NFD") // Normalize accents
            .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .trim()
            .replace(/[\s_-]+/g, '-'); // Replace spaces/underscores with hyphens
    }

    const createAgent = async (address: string) => {
        const loadingToast = toast.loading('Creating agent...');
        try {
            // Validate required fields
            if (!agentName) {
                toast.error('Agent name are required', { id: loadingToast });
                return;
            }

            if (!OwnerAddress) {
                toast.error('Owner address is required', { id: loadingToast });
                return;
            }

            // Prepare the payload with default values for null fields
            const payload = {
                slug: stringToSlug(agentName || ''),
                name: agentName,
                description: description || '',
                ticker: ticker,
                imageUrl: imageUrl || '',
                personality: personality || '',
                knowledgeAreas: knowledgeAreas || '',
                tokenAddress: address,
                owner: OwnerAddress,
                categories: selectedCategories,
                twitterAuth: twitterAuth ? {
                    accessToken: twitterAuth.accessToken || null,
                    refreshToken: twitterAuth.refreshToken || null,
                    expiresAt: twitterAuth.expiresAt || null,
                    tokenType: twitterAuth.tokenType || null,
                    scope: twitterAuth.scope || null,
                    agentId: agentName
                } : null
            };

            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorMessage = 'Failed to create agent';
                toast.error(errorMessage, { id: loadingToast });
                return;
            }

            toast.success('Agent created successfully!', { id: loadingToast });
            router.push(`/agents`);
        } catch (error) {
            console.error('Error creating agent:', error);
            toast.error('An unexpected error occurred while creating the agent', { id: loadingToast });
        }
    };

    useEffect(() => {
        validateTwitterStep();
    }, [twitterAuth, skipTwitter]);

    const validateTwitterStep = () => {
        const isValid = !!twitterAuth || skipTwitter;
        handleStepValidation(5, isValid);
        return isValid;
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <BasicInformation
                        agentName={agentName || ''}
                        description={description || ''}
                        ticker={ticker || ''}
                        onNameChange={setAgentName}
                        onDescriptionChange={setDescription}
                        onTickerChange={setTicker}
                        onValidationChange={(isValid) => handleStepValidation(1, isValid)}
                        showValidation={showValidation}
                    />
                );
            case 2:
                return (
                    <VisualSystem
                        imageUrl={imageUrl || ''}
                        avatarEnabled={avatarEnabled}
                        onUploadImage={handleUploadImage}
                        onGenerateImage={handleGenerateImage}
                        onAvatarToggle={setAvatarEnabled}
                        isGenerating={isGenerating}
                        onValidationChange={(isValid) => handleStepValidation(2, isValid)}
                        showValidation={showValidation}
                        imagePrompt={imagePrompt}
                        setImagePrompt={setImagePrompt}
                    />
                );
            case 3:
                return (
                    <PersonalityBackground
                        agentLore={agentLore || ''}
                        personality={personality || ''}
                        onLoreChange={setAgentLore}
                        onPersonalityChange={setPersonality}
                        onSelectedCategories={setSelectedCategories}
                        selectedCategories={selectedCategories}
                        onValidationChange={(isValid) => handleStepValidation(3, isValid)}
                        showValidation={showValidation}
                    />
                );
            case 4:
                return (
                    <Capabilities
                        knowledgeAreas={knowledgeAreas || ''}
                        onKnowledgeChange={handleKnowledgeChange}
                        onValidationChange={(isValid) => handleStepValidation(4, isValid)}
                        showValidation={showValidation}
                    />
                );
            case 5:
                return (
                    <div className="space-y-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-400">Twitter Integration</label>
                            {!twitterAuth ? (
                                <div className="space-y-4">
                                    <Button
                                        onClick={handleTwitterConnect}
                                        className="inline-flex items-center max-w-fit px-4 py-2 border-2 border-[#2196F3] text-sm font-medium rounded text-[#2196F3] bg-[#161B28] hover:bg-[#2196F3] hover:text-[#f5f0e8] shadow-[2px_2px_0px_0px_rgba(33,150,243,1)] transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                        </svg>
                                        Connect Twitter
                                    </Button>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="skip-twitter"
                                            checked={skipTwitter}
                                            onChange={(e) => setSkipTwitter(e.target.checked)}
                                            className="rounded border-gray-400 text-[#2196F3] focus:ring-[#2196F3]"
                                        />
                                        <label htmlFor="skip-twitter" className="text-sm text-gray-400">
                                            Skip Twitter integration for now
                                        </label>
                                    </div>
                                    {!twitterAuth && !skipTwitter && (
                                        <p className="text-sm text-red-500">
                                            Please either connect Twitter or choose to skip integration
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-[#161B28] p-4 rounded border-2 border-[#2196F3] shadow-[2px_2px_0px_0px_rgba(33,150,243,1)]">
                                    {twitterUserInfo ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {twitterUserInfo.profileImageUrl && (
                                                    <img 
                                                        src={twitterUserInfo.profileImageUrl} 
                                                        alt="Profile" 
                                                        className="w-10 h-10 rounded-full border-2 border-[#2196F3]"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium text-[#2196F3]">{twitterUserInfo.name}</p>
                                                    <p className="text-sm text-[#2196F3]/80">@{twitterUserInfo.username}</p>
                                                </div>
                                            </div>
                                            <div className="ml-auto">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2196F3] text-[#f5f0e8]">
                                                    Connected
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Twitter Connected</span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2196F3] text-[#f5f0e8]">
                                                Connected
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleSubmit = async () => {
        if (!isCurrentStepValid()) {
            toast.error('Please complete all required fields before creating the agent');
            return;
        }

        const loadingToast = toast.loading('Creating agent...');
        await createAgent('');
    };

    const steps = [
        {
            title: "Basic Information",
            fields: ["Name", "Description", "Ticker"]
        },
        {
            title: "Image",
            fields: ["Image"]
        },
        {
            title: "Personality",
            fields: ["Personality"]
        },
        {
            title: "Knowledge",
            fields: ["Knowledge"]
        },
        {
            title: "Twitter Config",
            fields: ["Username", "Password", "Email"]
        }
    ];

    return (
        <main className="min-h-screen bg-[#0B0E17]">
            <div className="">
                <div className="container mx-auto px-4 py-8 pb-0">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                            Create Your Trading Agent
                        </h1>
                        <p className="text-lg text-gray-400 mb-8">
                            Design a powerful AI agent that trades and interacts on your behalf. Customize its personality, knowledge, and capabilities.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 w-full">
                        {/* Progress Steps */}
                        <div className="mb-8">
                            <div className="flex justify-between">
                                {steps.map((step, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border
                                            ${currentStep > index + 1 ? 'bg-[#2196F3] border-[#2196F3] text-white' :
                                            currentStep === index + 1 ? 'bg-[#2196F3] border-[#2196F3] text-white' :
                                            'bg-[#161B28] border-[#1F2937] text-gray-400'}`}>
                                            {index + 1}
                                        </div>
                                        <div className="text-xs md:text-sm text-gray-400 text-center">{step.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="relative mt-2">
                                <div className="absolute top-0 left-0 h-1 bg-[#1F2937] w-full rounded">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-[#2196F3] rounded transition-all duration-300"
                                        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="bg-[#161B28] rounded border border-[#1F2937] p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-6 text-white">{steps[currentStep - 1].title}</h2>
                            {renderStepContent()}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between">
                            <button
                                onClick={handlePrevious}
                                className={`flex items-center gap-2 px-6 py-2 rounded
                                    ${currentStep === 1 
                                        ? 'invisible' 
                                        : 'bg-[#161B28] border border-[#1F2937] text-gray-400 hover:bg-[#1C2333] hover:text-white'}`}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Previous
                            </button>
                            <button
                                onClick={currentStep === totalSteps ? handleSubmit : handleNext}
                                className="flex items-center gap-2 px-6 py-2 bg-[#2196F3] text-white rounded hover:bg-[#1E88E5] transition-colors duration-200"
                            >
                                {currentStep === totalSteps ? 'Create Agent' : 'Next'}
                                {currentStep !== totalSteps && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="w-full mt-10 lg:mt-0">
                        <div className="lg:sticky lg:top-8">
                            {/* Tabs */}
                            <div className="mb-6">
                                <div className="flex p-1 gap-1 bg-[#161B28] rounded-lg w-fit">
                                    <button
                                        onClick={() => setActiveTab('preview')}
                                        className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2
                                            ${activeTab === 'preview'
                                                ? 'bg-[#2196F3] text-white shadow-md shadow-[#2196F3]/20'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <Layout className="w-4 h-4" />
                                        Preview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('avatar')}
                                        className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2
                                            ${activeTab === 'avatar'
                                                ? 'bg-[#2196F3] text-white shadow-md shadow-[#2196F3]/20'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <User className="w-4 h-4" />
                                        Avatar
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="bg-[#161B28] border border-[#2F3850] p-6 shadow-lg">
                                {activeTab === 'preview' ? (
                                    <AgentPreview
                                        name={agentName || ''}
                                        description={description || ''}
                                        ticker={ticker || ''}
                                        imageUrl={imageUrl || ''}
                                        personality={personality || ''}
                                    />
                                ) : (
                                    <div className="space-y-6">
                                        <span className="text-white">Coming Soon</span>
                                        {/* <div className="flex flex-col lg:flex-row gap-4">
                                            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:w-16 pb-2 lg:pb-0 no-scrollbar">
                                                {[
                                                    { icon: <User className="w-5 h-5" />, label: 'body' as AvatarCategory, color: '#4CAF50' },
                                                    { icon: <Package className="w-5 h-5" />, label: 'outfits' as AvatarCategory, color: '#2196F3' },
                                                    { icon: <Shirt className="w-5 h-5" />, label: 'tops' as AvatarCategory, color: '#9C27B0' },
                                                    { icon: <Package className="w-5 h-5" />, label: 'bottoms' as AvatarCategory, color: '#FF9800' },
                                                    { icon: <Footprints className="w-5 h-5" />, label: 'shoes' as AvatarCategory, color: '#F44336' },
                                                    { icon: <Crown className="w-5 h-5" />, label: 'accessories' as AvatarCategory, color: '#795548' },
                                                    { icon: <Smile className="w-5 h-5" />, label: 'expression' as AvatarCategory, color: '#607D8B' },
                                                ].map((category) => (
                                                    <button
                                                        key={category.label}
                                                        onClick={() => setSelectedCategory(category.label)}
                                                        className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg transition-colors min-w-[80px] lg:min-w-0
                                                            ${selectedCategory === category.label 
                                                                ? `bg-[#242938] ring-2 ring-[${category.color}]` 
                                                                : 'hover:bg-[#242938]'}`}
                                                    >
                                                        <div 
                                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                            style={{ backgroundColor: `${category.color}20` }}
                                                        >
                                                            <div style={{ color: category.color }}>{category.icon}</div>
                                                        </div>
                                                        <span className="text-xs mt-1 text-gray-400 lg:hidden">{category.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            
                                            <div className="flex-1 bg-[#1A1F2E] rounded-lg p-4 flex items-center justify-center">
                                                <div className="relative w-[200px] h-[300px] lg:w-[300px] lg:h-[500px]">
                                                    <Image
                                                        src={`/avatars/${avatarCustomization[selectedCategory]}-${selectedSkinTone === 'All' ? 'default' : selectedSkinTone}.png`}
                                                        alt="Avatar Preview"
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CreateAgent;