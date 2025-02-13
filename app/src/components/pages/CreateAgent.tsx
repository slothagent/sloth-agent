"use client";

import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import BasicInformation from '@/components/custom/agent/BasicInformation';
import VisualSystem from '@/components/custom/agent/VisualSystem';
import PersonalityBackground from '@/components/custom/agent/PersonalityBackground';
import Capabilities from '@/components/custom/agent/Capabilities';
import AgentPreview from '@/components/custom/agent/AgentPreview';
import TwitterConfig from '@/components/custom/agent/TwitterConfig';
import { uploadImageToPinata } from '@/utils/pinata';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { factoryAbi } from '@/abi/factoryAbi';
import { zeroAddress } from 'viem';

const CreateAgent: React.FC = () => {

    const [currentStep, setCurrentStep] = useState<number>(1);
    const totalSteps = 5;

    const [agentName, setAgentName] = useState<string|null>(null);
    const [description, setDescription] = useState<string|null>(null);
    const [ticker, setTicker] = useState<string|null>(null);
    const [systemType, setSystemType] = useState<string|null>(null);
    const [imageUrl, setImageUrl] = useState<string|null>(null);
    const [agentLore, setAgentLore] = useState<string|null>(null);
    const [personality, setPersonality] = useState<string|null>(null);
    const [communicationStyle, setCommunicationStyle] = useState<string|null>(null);
    const [knowledgeAreas, setKnowledgeAreas] = useState<string|null>(null);
    const [tools, setTools] = useState<string[]>([]);
    const [examples, setExamples] = useState<string|null>(null);
    // Twitter config state
    const [twitterUsername, setTwitterUsername] = useState<string|null>(null);
    const [twitterPassword, setTwitterPassword] = useState<string|null>(null);
    const [twitterEmail, setTwitterEmail] = useState<string|null>(null);
    const router = useRouter();
    const { writeContractAsync, isSuccess,data:txData,isPending } = useWriteContract()
    const { address: OwnerAddress, isConnected } = useAccount()

    const handleSubmit = async () => {
        const loadingToast = toast.loading('Creating agent...');
        try {
            // Validate required fields
            if (!agentName || !ticker) {
                toast.error('Agent name and ticker are required', { id: loadingToast });
                return;
            }

            try {
                
                try {
                    await writeContractAsync({
                        address: process.env.FACTORY_ADDRESS as `0x${string}`,
                        abi: factoryAbi,
                        functionName: 'createTokenAndCurve',
                        value: BigInt(1129664128081000),
                        args: [agentName, ticker, BigInt(1000000000)*BigInt(10**18), BigInt(1137000), BigInt(1137000)]
                    });
                    toast.success('Please wait for the agent to be created!', { id: loadingToast });
                } catch (error: any) {
                    console.error('Agent creation error:', error);
                    // Check for MetaMask rejection
                    if (error.code === 4001 || error.message?.includes('User rejected')) {
                        toast.error('Transaction rejected by user', { id: loadingToast });
                    } else if (error.code === -32603) {
                        toast.error('Internal JSON-RPC error. Please check your wallet balance.', { id: loadingToast });
                    } else {
                        toast.error('Failed to create agent', { id: loadingToast });
                    }
                }

            } catch (jsonError) {
                console.error('Error parsing success response:', jsonError);
                // Even if we can't parse the response, we know the request succeeded
                toast.success('Agent created successfully!');
            }
        } catch (error) {
            console.error('Error creating agent:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create agent. Please try again.');
        }
    };

    const steps = [
        {
            title: "Basic Information",
            fields: ["Name", "Description", "Ticker"]
        },
        {
            title: "Visual & System",
            fields: ["Image", "System Type"]
        },
        {
            title: "Personality & Background",
            fields: ["Agent Lore", "Personality", "Style"]
        },
        {
            title: "Capabilities",
            fields: ["Knowledge", "Tools", "Examples"]
        },
        {
            title: "Twitter Config",
            fields: ["Username", "Password", "Email"]
        }
    ];

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
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

            const loadingToast = toast.loading('Generating image with AI...');

            // Generate image with DALL-E
            const prompt = `Create a professional logo for an AI agent named "${agentName}". The agent's purpose is: ${description}. Style: Modern, minimalist, suitable for a tech company. The image should be clear, memorable, and work well at different sizes.`;
            
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
            
            toast.dismiss(loadingToast);
            toast.success('Image generated and uploaded successfully!');
        } catch (error) {
            console.error('Error generating image:', error);
            toast.error('Failed to generate image. Please try again.');
        }
    };

    const handleStyleChange = (value: string) => {
        setCommunicationStyle(value);
    };

    const handleKnowledgeChange = (value: string) => {
        setKnowledgeAreas(value);
    };

    const handleToolChange = (tool: string) => {
        setTools([tool]); // Now we only store one selected tool
    };


    const createAgent = async (address: string, curveAddress: string) => {
        const loadingToast = toast.loading('Creating agent...');
        try {
            // Validate required fields
            if (!agentName || !ticker) {
                toast.error('Agent name and ticker are required', { id: loadingToast });
                return;
            }

            if (!address || !curveAddress) {
                toast.error('Token address and curve address are required', { id: loadingToast });
                return;
            }

            if (!OwnerAddress) {
                toast.error('Owner address is required', { id: loadingToast });
                return;
            }

            // Prepare the payload with default values for null fields
            const payload = {
                name: agentName,
                description: description || '',
                ticker: ticker,
                systemType: systemType || '',
                imageUrl: imageUrl || '',
                agentLore: agentLore || '',
                personality: personality || '',
                communicationStyle: communicationStyle || '',
                knowledgeAreas: knowledgeAreas || '',
                tools: tools || [],
                examples: examples || '',
                twitterUsername: twitterUsername || '',
                twitterEmail: twitterEmail || '',
                twitterPassword: twitterPassword || '',
                address: address,
                curveAddress: curveAddress,
                owner: OwnerAddress
            };

            // console.log('Sending payload:', payload); // Debug log

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
            router.push(`/agent/${ticker.toLowerCase()}`);
        } catch (error) {
            console.error('Error creating agent:', error);
            toast.error('An unexpected error occurred while creating the agent', { id: loadingToast });
        }
    }

    useWatchContractEvent({
        address: process.env.FACTORY_ADDRESS as `0x${string}`,
        abi: factoryAbi,
        eventName: 'TokenAndCurveCreated',
        onLogs(logs) {
            // console.log('TokenAndCurveCreated event:', logs);
            // Create agent in database
            createAgent(logs[0].args.token as `0x${string}`, logs[0].args.bondingCurve as `0x${string}`);
            toast.success('Token and Curve created successfully!');
        }
    });

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
                    />
                );
            case 2:
                return (
                    <VisualSystem
                        systemType={systemType || ''}
                        imageUrl={imageUrl || ''}
                        onSystemTypeChange={setSystemType}
                        onUploadImage={handleUploadImage}
                        onGenerateImage={handleGenerateImage}
                    />
                );
            case 3:
                return (
                    <PersonalityBackground
                        agentLore={agentLore || ''}
                        personality={personality || ''}
                        communicationStyle={communicationStyle || ''}
                        onLoreChange={setAgentLore}
                        onPersonalityChange={setPersonality}
                        onStyleChange={handleStyleChange}
                    />
                );
            case 4:
                return (
                    <Capabilities
                        knowledgeAreas={knowledgeAreas || ''}
                        tools={tools}
                        examples={examples || ''}
                        onKnowledgeChange={handleKnowledgeChange}
                        onToolChange={handleToolChange}
                        onExamplesChange={setExamples}
                    />
                );
            case 5:
                return (
                    <TwitterConfig
                        username={twitterUsername || ''}
                        password={twitterPassword || ''}
                        email={twitterEmail || ''}
                        onUsernameChange={setTwitterUsername}
                        onPasswordChange={setTwitterPassword}
                        onEmailChange={setTwitterEmail}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen bg-white">
            <div className="bg-gradient-to-b from-[#93E905]/10 to-white">
                <div className="container mx-auto px-4 py-8 pb-0">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-2xl md:text-5xl font-bold text-black mb-4">
                            Create Your Trading Agent
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Design a powerful AI agent that trades and interacts on your behalf. Customize its personality, knowledge, and capabilities.
                        </p>
                        {/* <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full">
                                <Sparkles className="w-5 h-5 text-[#93E905]" />
                                <span className="text-sm text-black">AI-Powered Trading</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full">
                                <Twitter className="w-5 h-5 text-[#93E905]" />
                                <span className="text-sm text-black">Twitter Integration</span>
                            </div>
                        </div> */}
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
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border-2
                                            ${currentStep > index + 1 ? 'bg-[#93E905] border-[#93E905] text-black' :
                                            currentStep === index + 1 ? 'bg-black border-black text-white' :
                                            'bg-white border-black text-black'}`}>
                                            {index + 1}
                                        </div>
                                        <div className="text-sm text-black">{step.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="relative mt-2">
                                <div className="absolute top-0 left-0 h-1 bg-black w-full rounded">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-[#93E905] rounded transition-all duration-300"
                                        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="bg-white rounded border-2 border-black p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-6 text-black">{steps[currentStep - 1].title}</h2>
                            {renderStepContent()}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between">
                            <button
                                onClick={handlePrevious}
                                className={`flex items-center gap-2 px-6 py-2 rounded border-2
                                    ${currentStep === 1 
                                        ? 'invisible' 
                                        : 'bg-white border-black text-black hover:bg-[#93E905] hover:border-[#93E905]'}`}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Previous
                            </button>
                            <button
                                onClick={currentStep === totalSteps ? handleSubmit : handleNext}
                                className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded border-2 border-black hover:bg-[#93E905] hover:text-black hover:border-[#93E905]"
                            >
                                {currentStep === totalSteps ? 'Create Agent' : 'Next'}
                                {currentStep !== totalSteps && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="w-full mt-10">
                        <div className="sticky top-8">
                            <h2 className="text-3xl font-semibold mb-4 text-black">Agent Preview</h2>
                            <AgentPreview
                                name={agentName || ''}
                                description={description || ''}
                                ticker={ticker || ''}
                                systemType={systemType || ''}
                                imageUrl={imageUrl || ''}
                                personality={personality || ''}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CreateAgent;