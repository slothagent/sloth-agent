"use client";

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Bot, Sparkles, Twitter } from 'lucide-react';
import Header from '@/components/Header';
import BasicInformation from '@/components/custom/agent/BasicInformation';
import VisualSystem from '@/components/custom/agent/VisualSystem';
import PersonalityBackground from '@/components/custom/agent/PersonalityBackground';
import Capabilities from '@/components/custom/agent/Capabilities';
import AgentPreview from '@/components/custom/agent/AgentPreview';
import TwitterConfig from '@/components/custom/agent/TwitterConfig';

const CreateAgent = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

    // Form state
    const [agentName, setAgentName] = useState('');
    const [description, setDescription] = useState('');
    const [ticker, setTicker] = useState('');
    const [systemType, setSystemType] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [agentLore, setAgentLore] = useState('');
    const [personality, setPersonality] = useState('');
    const [communicationStyle, setCommunicationStyle] = useState('');
    const [knowledgeAreas, setKnowledgeAreas] = useState('');
    const [tools, setTools] = useState<string[]>([]);
    const [examples, setExamples] = useState('');
    // Twitter config state
    const [twitterUsername, setTwitterUsername] = useState('');
    const [twitterPassword, setTwitterPassword] = useState('');
    const [twitterEmail, setTwitterEmail] = useState('');

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

    const handleUploadImage = () => {
        // Implement image upload logic
        console.log('Upload image');
    };

    const handleGenerateImage = () => {
        // Implement AI image generation logic
        console.log('Generate image with AI');
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

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <BasicInformation
                        agentName={agentName}
                        description={description}
                        ticker={ticker}
                        onNameChange={setAgentName}
                        onDescriptionChange={setDescription}
                        onTickerChange={setTicker}
                    />
                );
            case 2:
                return (
                    <VisualSystem
                        systemType={systemType}
                        onSystemTypeChange={setSystemType}
                        onUploadImage={handleUploadImage}
                        onGenerateImage={handleGenerateImage}
                    />
                );
            case 3:
                return (
                    <PersonalityBackground
                        agentLore={agentLore}
                        personality={personality}
                        communicationStyle={communicationStyle}
                        onLoreChange={setAgentLore}
                        onPersonalityChange={setPersonality}
                        onStyleChange={handleStyleChange}
                    />
                );
            case 4:
                return (
                    <Capabilities
                        knowledgeAreas={knowledgeAreas}
                        tools={tools}
                        examples={examples}
                        onKnowledgeChange={handleKnowledgeChange}
                        onToolChange={handleToolChange}
                        onExamplesChange={setExamples}
                    />
                );
            case 5:
                return (
                    <TwitterConfig
                        username={twitterUsername}
                        password={twitterPassword}
                        email={twitterEmail}
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
            <Header />
            
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-[#93E905]/10 to-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-3 bg-[#93E905] rounded-full">
                                <Bot className="w-8 h-8 text-black" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
                            Create Your Trading Agent
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Design a powerful AI agent that trades and interacts on your behalf. Customize its personality, knowledge, and capabilities.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full">
                                <Sparkles className="w-5 h-5 text-[#93E905]" />
                                <span className="text-sm text-black">AI-Powered Trading</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full">
                                <Twitter className="w-5 h-5 text-[#93E905]" />
                                <span className="text-sm text-black">Twitter Integration</span>
                            </div>
                        </div>
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
                                onClick={handleNext}
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
                                name={agentName}
                                description={description}
                                ticker={ticker}
                                systemType={systemType}
                                imageUrl={imageUrl}
                                personality={personality}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CreateAgent;