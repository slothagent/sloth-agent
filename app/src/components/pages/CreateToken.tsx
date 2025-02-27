"use client";

import { useRef, useState, useEffect } from 'react';
import { Coins, Upload } from 'lucide-react';
import { uploadImageToPinata } from '@/utils/pinata';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract, useWriteContract, usePublicClient, useWaitForTransactionReceipt } from 'wagmi';
import { factoryAbi } from '@/abi/factoryAbi';
import { Button } from '../ui/button';
import { parseEther, parseUnits, decodeEventLog } from 'viem';
import { Input } from '../ui/input';
import { Card } from '../ui/card';


const CreateToken: React.FC = () => {

    const [tokenName, setTokenName] = useState<string|null>(null);
    const [description, setDescription] = useState<string|null>(null);
    const [ticker, setTicker] = useState<string|null>(null);
    const [imageUrl, setImageUrl] = useState<string|null>(null);
    const [totalSupply, setTotalSupply] = useState<string>('');
    const [twitterUrl, setTwitterUrl] = useState<string>('');
    const [telegramUrl, setTelegramUrl] = useState<string>('');
    const [websiteUrl, setWebsiteUrl] = useState<string>('');
    const [showSocialLinks, setShowSocialLinks] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'upload'|'generate'>('upload');
    const [imagePrompt, setImagePrompt] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const { writeContractAsync, isSuccess,data:txData,isPending } = useWriteContract()
    const { address: OwnerAddress, isConnected } = useAccount()

    const router = useRouter(); 

    // Validation states
    const [errors, setErrors] = useState<{
        tokenName?: string;
        description?: string;
        ticker?: string;
        totalSupply?: string;
        imageUrl?: string;
        twitterUrl?: string;
        telegramUrl?: string;
        websiteUrl?: string;
    }>({});


    const validateForm = () => {
        const newErrors: typeof errors = {};

        // Token Name validation
        if (!tokenName?.trim()) {
            newErrors.tokenName = 'Token name is required';
        } else if (tokenName.length < 3) {
            newErrors.tokenName = 'Token name must be at least 3 characters';
        } else if (tokenName.length > 50) {
            newErrors.tokenName = 'Token name must be less than 50 characters';
        }

        // Description validation
        if (!description?.trim()) {
            newErrors.description = 'Description is required';
        } else if (description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        } else if (description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        // Ticker validation
        if (!ticker?.trim()) {
            newErrors.ticker = 'Token symbol is required';
        } else if (ticker.length < 2) {
            newErrors.ticker = 'Token symbol must be at least 2 characters';
        } else if (ticker.length > 5) {
            newErrors.ticker = 'Token symbol must be less than 5 characters';
        } else if (!/^[A-Z0-9]+$/.test(ticker)) {
            newErrors.ticker = 'Token symbol can only contain uppercase letters and numbers';
        }

        // Image validation
        if (!imageUrl) {
            newErrors.imageUrl = 'Token image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleUploadImage = async (file: File) => {
        try {
            if (!tokenName) {
                toast.error('Please enter token name first');
                return;
            }
            
            const loadingToast = toast.loading('Uploading image...');
            const ipfsUrl = await uploadImageToPinata(file, tokenName||"");
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


    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleUploadImage(file);
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            await handleUploadImage(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };


    const handleGenerateImage = async () => {
        try {
            if (!tokenName) {
                toast.error('Please enter token name first');
                return;
            }

            if (!imagePrompt.trim()) {
                toast.error('Please enter a prompt for image generation');
                return;
            }

            setIsGenerating(true);
            const loadingToast = toast.loading('Generating image...');

            try {
                // Generate image with Replicate
                const prompt = `Create a professional logo for a token named "${tokenName}". ${imagePrompt}. Style: Modern, minimalist, suitable for a crypto token. The image should be clear, memorable, and work well at different sizes.`;
                
                const response = await fetch('/api/generate-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to generate image');
                }

                const data = await response.json();
                const generatedImageUrl = data.imageUrl;

                if (!generatedImageUrl) {
                    throw new Error('No image URL received');
                }

                // Add a small delay to ensure the image is ready
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Download the image with proper headers
                const imageResponse = await fetch(generatedImageUrl);

                if (!imageResponse.ok) {
                    throw new Error('Failed to download generated image');
                }

                const contentType = imageResponse.headers.get('content-type');
                if (!contentType || !contentType.startsWith('image/')) {
                    throw new Error('Invalid image response');
                }

                const imageBlob = await imageResponse.blob();
                const file = new File([imageBlob], `${tokenName}.png`, { type: 'image/png' });

                // Upload to Pinata
                const ipfsUrl = await uploadImageToPinata(file, tokenName);
                if (!ipfsUrl) {
                    throw new Error('Failed to upload to IPFS');
                }

                setImageUrl(ipfsUrl);
                toast.dismiss(loadingToast);
                toast.success('Image generated and uploaded successfully!');
            } catch (error: any) {
                console.error('Error in image generation process:', error);
                toast.dismiss(loadingToast);
                toast.error(error.message || 'Failed to generate and upload image');
            }
        } catch (error) {
            console.error('Error generating image:', error);
            toast.error('Failed to generate image. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const formatNumber = (value: string) => {
        // Remove any non-digit characters
        const number = value.replace(/\D/g, '');
        // Format with dots
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Watch for transaction confirmation
    const { data: receipt, isError: isConfirmationError } = useWaitForTransactionReceipt({
        hash: txHash as `0x${string}`,
    });
    
    // console.log('Receipt:', receipt);

    // Handle transaction receipt
    useEffect(() => {
        const processReceipt = async () => {
            if (receipt) {
                try {
                    // Find the token address from the logs
                    const eventLog = receipt.logs.find(log => {
                        try {
                            const decoded = decodeEventLog({
                                abi: factoryAbi,
                                data: log.data,
                                topics: log.topics,
                            });
                            // console.log('Decoded:', decoded);
                            return decoded.eventName === 'TokenAndCurveCreated';
                        } catch {
                            return false;
                        }
                    });

                    if (eventLog) {
                        const decoded = decodeEventLog({
                            abi: factoryAbi,
                            data: eventLog.data,
                            topics: eventLog.topics,
                        });
                        
                        const { token, bondingCurve } = decoded.args as any;
                        
                        // Create token in database with the token address
                        await createToken(token, bondingCurve);
                    } else {
                        // If we can't find the event log, try to get the token address from the receipt
                        const tokenAddress = receipt.logs[0]?.address;
                        const bondingCurve = receipt.logs[1]?.address;
                        if (tokenAddress) {
                            await createToken(tokenAddress, bondingCurve);
                        } else {
                            throw new Error('Could not find token address in transaction receipt');
                        }
                    }
                } catch (error) {
                    console.error('Error processing transaction receipt:', error);
                    toast.error('Error processing transaction receipt');
                }
            }
        };

        processReceipt();
    }, [receipt]);

    // Handle confirmation error
    useEffect(() => {
        if (isConfirmationError) {
            console.error('Transaction confirmation failed');
            toast.error('Transaction confirmation failed');
        }
    }, [isConfirmationError]);

    const handleCreateToken = async () => {
        if (!isConnected) {
            toast.error('Please connect your wallet');
            return;
        }
        if (!validateForm()) {
            toast.error('Please fill all the fields');
            return;
        }

        const loadingToast = toast.loading('Creating token...');

        try {
            if (!tokenName || !ticker) {
                toast.error('Token name and ticker are required', { id: loadingToast });
                return;
            }
            
            try {
                const tx = await writeContractAsync({
                    address: process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`,
                    abi: factoryAbi,
                    functionName: 'createTokenAndCurve',
                    value: parseEther('1'),
                    args: [tokenName, ticker]
                });
                
                setTxHash(tx); // Save transaction hash
                toast.success('Transaction submitted! Waiting for confirmation...', { id: loadingToast });
                
            } catch (error: any) {
                console.error('Token creation error:', error);
                if (error.code === 4001 || error.message?.includes('User rejected')) {
                    toast.error('Transaction rejected by user', { id: loadingToast });
                } else if (error.code === -32603) {
                    toast.error('Internal JSON-RPC error. Please check your wallet balance.', { id: loadingToast });
                } else {
                    toast.error('Failed to create token', { id: loadingToast });
                }
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create token. Please try again.');
        }
    };

    const createToken = async (address: string, curveAddress: string) => {
        const loadingToast = toast.loading('Creating token...');
        try {

            if (!address) {
                toast.error('Token address is required', { id: loadingToast });
                return;
            }

            // Prepare the payload with default values for null fields
            const payload = {
                name: tokenName,
                address: address,
                owner: OwnerAddress,
                description: description || '',
                ticker: ticker,
                imageUrl: imageUrl || '',
                totalSupply: parseUnits('2',23).toString(),
                twitterUrl: twitterUrl,
                telegramUrl: telegramUrl,
                websiteUrl: websiteUrl,
                curveAddress: curveAddress,
            };

            // console.log('Sending payload:', payload); // Debug log

            const response = await fetch('/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorMessage = 'Failed to create token';
                toast.error(errorMessage, { id: loadingToast });
                return;
            }

            toast.success('Token created successfully!', { id: loadingToast });
            router.push(`/token/${address}`);
        } catch (error) {
            console.error('Error creating token:', error);
            toast.error('An unexpected error occurred while creating the token', { id: loadingToast });
        }
    }

    return (
        <main className="min-h-screen bg-[#0B0E17]">
            <div className="">
                <div className="container mx-auto px-4 py-8 pb-0">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                            Create Your Token
                        </h1>
                        <p className="text-lg text-gray-400 mb-8">
                            Create your own meme token with a unique personality! Launch the next viral token with custom branding, memes, and community features.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
                    <div className="space-y-6 col-span-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Token Name</label>
                            <Input
                                value={tokenName||''}
                                onChange={(e) => {
                                    setTokenName(e.target.value);
                                    setErrors({...errors, tokenName: undefined});
                                }}
                                placeholder="Enter token name"
                                className={`w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] ${errors.tokenName ? 'border-red-500' : ''}`}
                            />
                            {errors.tokenName && (
                                <p className="text-sm text-red-500 mt-1">{errors.tokenName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Description</label>
                            <textarea
                                value={description||''}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    setErrors({...errors, description: undefined});
                                }}
                                placeholder="Enter description"
                                rows={4}
                                className={`w-full bg-[#0B0E17] text-sm border border-[#1F2937] rounded-md p-3 text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] focus:outline-none resize-none ${errors.description ? 'border-red-500' : ''}`}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Token Image</label>
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
                                            onClick={handleGenerateImage}
                                            disabled={!imagePrompt.trim() || isGenerating}
                                            className="bg-[#2196F3] text-white hover:bg-[#1E88E5] disabled:bg-gray-600 disabled:cursor-not-allowed"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <span className="animate-spin mr-2">⚡</span>
                                                    Generating...
                                                </>
                                            ) : (
                                                'Generate Image'
                                            )}
                                        </Button>
                                    </div>

                                    {imageUrl && (
                                        <div className="flex flex-col items-center gap-4 mt-4">
                                            <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                                <img
                                                    src={imageUrl}
                                                    alt="Generated"
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Symbol</label>
                            <Input
                                value={ticker||''}
                                onChange={(e) => {
                                    const value = e.target.value.toUpperCase();
                                    if (value.length <= 5) {
                                        setTicker(value);
                                        setErrors({...errors, ticker: undefined});
                                    }
                                }}
                                placeholder="Enter symbol (e.g. SLOTH)"
                                className={`w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] uppercase ${errors.ticker ? 'border-red-500' : ''}`}
                                maxLength={5}
                            />
                            {errors.ticker && (
                                <p className="text-sm text-red-500 mt-1">{errors.ticker}</p>
                            )}
                            <p className="text-xs text-gray-500">Maximum 5 characters, automatically converted to uppercase</p>
                        </div>

                        {/* <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Total Supply</label>
                            <Input
                                type="text"
                                value={totalSupply ? formatNumber(totalSupply) : ''}
                                onChange={(e) => {
                                    const rawValue = parseNumber(e.target.value);
                                    if (/^\d*$/.test(rawValue)) { // Only allow digits
                                        setTotalSupply(rawValue);
                                        setErrors({...errors, totalSupply: undefined});
                                    }
                                }}
                                placeholder="Enter total supply (e.g. 1.000.000)"
                                className={`w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] ${errors.totalSupply ? 'border-red-500' : ''}`}
                            />
                            {errors.totalSupply && (
                                <p className="text-sm text-red-500 mt-1">{errors.totalSupply}</p>
                            )}
                        </div> */}

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-white">Social Links</h3>
                                <Button
                                    onClick={() => setShowSocialLinks(!showSocialLinks)}
                                    variant="outline"
                                    className="bg-[#161B28] text-gray-400 hover:bg-[#1C2333] hover:text-white border border-[#1F2937]"
                                >
                                    {showSocialLinks ? 'Hide Social Links' : 'Add Social Links'}
                                </Button>
                            </div>
                            
                            {showSocialLinks && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Twitter URL</label>
                                        <Input
                                            type="url"
                                            value={twitterUrl}
                                            onChange={(e) => {
                                                setTwitterUrl(e.target.value);
                                                setErrors({...errors, twitterUrl: undefined});
                                            }}
                                            placeholder="https://twitter.com/youraccount"
                                            className={`w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] ${errors.twitterUrl ? 'border-red-500' : ''}`}
                                        />
                                        {errors.twitterUrl && (
                                            <p className="text-sm text-red-500 mt-1">{errors.twitterUrl}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Telegram URL</label>
                                        <Input
                                            type="url"
                                            value={telegramUrl}
                                            onChange={(e) => {
                                                setTelegramUrl(e.target.value);
                                                setErrors({...errors, telegramUrl: undefined});
                                            }}
                                            placeholder="https://t.me/yourchannel"
                                            className={`w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] ${errors.telegramUrl ? 'border-red-500' : ''}`}
                                        />
                                        {errors.telegramUrl && (
                                            <p className="text-sm text-red-500 mt-1">{errors.telegramUrl}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Website URL</label>
                                        <Input
                                            type="url"
                                            value={websiteUrl}
                                            onChange={(e) => {
                                                setWebsiteUrl(e.target.value);
                                                setErrors({...errors, websiteUrl: undefined});
                                            }}
                                            placeholder="https://yourwebsite.com"
                                            className={`w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] ${errors.websiteUrl ? 'border-red-500' : ''}`}
                                        />
                                        {errors.websiteUrl && (
                                            <p className="text-sm text-red-500 mt-1">{errors.websiteUrl}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-end">
                            <button
                                onClick={handleCreateToken}
                                disabled={isPending}
                                className="flex justify-end items-end gap-2 px-6 py-2 bg-[#2196F3] text-white rounded hover:bg-[#1E88E5] transition-colors duration-200"
                            >
                                Create Token
                            </button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="w-full mt-10 lg:mt-0">
                        <div className="lg:sticky lg:top-8">
                            <h2 className="text-2xl lg:text-3xl font-semibold mb-4 text-white">Token Preview</h2>
                            <div className="bg-[#161B28] border border-[#1F2937] rounded-lg p-4 lg:p-6">
                                <div className="space-y-4">
                                    {/* Token Preview Card */}
                                    <Card className="bg-[#161B28] border border-[#1F2937] p-4 rounded-lg">
                                        <div className="flex items-start gap-4">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#0B0E17] border border-[#1F2937] flex items-center justify-center">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={tokenName || 'Token'}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Coins className="w-8 h-8 text-[#2196F3]" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-white">
                                                            {tokenName || 'Unnamed Token'}
                                                        </h3>
                                                        <p className="text-sm text-gray-400">
                                                            ${ticker || 'SYMBOL'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                                                    {description || 'No description provided'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-[#1F2937]">
                                            <div className="flex items-center justify-between text-sm text-gray-400">
                                                <span>Total Supply:</span>
                                                <span className="font-medium text-white">
                                                    {totalSupply ? formatNumber(totalSupply) : '0'} {ticker || 'SYMBOL'}
                                                </span>
                                            </div>
                                        </div>

                                        {(twitterUrl || telegramUrl || websiteUrl) && (
                                            <div className="mt-4 pt-4 border-t border-[#1F2937]">
                                                <p className="text-sm font-medium text-gray-400 mb-3">Social Links:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {twitterUrl && (
                                                        <a
                                                            href={twitterUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-3 py-1 rounded-full bg-[#0B0E17] text-[#2196F3] text-sm hover:bg-[#1F2937] transition-colors"
                                                        >
                                                            Twitter
                                                        </a>
                                                    )}
                                                    {telegramUrl && (
                                                        <a
                                                            href={telegramUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-3 py-1 rounded-full bg-[#0B0E17] text-[#2196F3] text-sm hover:bg-[#1F2937] transition-colors"
                                                        >
                                                            Telegram
                                                        </a>
                                                    )}
                                                    {websiteUrl && (
                                                        <a
                                                            href={websiteUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-3 py-1 rounded-full bg-[#0B0E17] text-[#2196F3] text-sm hover:bg-[#1F2937] transition-colors"
                                                        >
                                                            Website
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Card>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </main>
    );
};

export default CreateToken;