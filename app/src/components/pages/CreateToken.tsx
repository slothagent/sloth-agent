"use client";

import { useState } from 'react';
import { Coins } from 'lucide-react';
import { uploadImageToPinata } from '@/utils/pinata';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { factoryAbi } from '@/abi/factoryAbi';
import { initiateTwitterAuth } from '@/utils/twitter';
import { Button } from '../ui/button';
import { parseEther,parseUnits } from 'viem';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import Image from 'next/image';


const CreateToken: React.FC = () => {

    const [tokenName, setTokenName] = useState<string|null>(null);
    const [description, setDescription] = useState<string|null>(null);
    const [ticker, setTicker] = useState<string|null>(null);
    const [imageUrl, setImageUrl] = useState<string|null>(null);
    const [personality, setPersonality] = useState<string|null>(null);
    const [totalSupply, setTotalSupply] = useState<string>('');
    const [twitterUrl, setTwitterUrl] = useState<string>('');
    const [telegramUrl, setTelegramUrl] = useState<string>('');
    const [websiteUrl, setWebsiteUrl] = useState<string>('');


    const handleUploadImage = async (file: File) => {
        try {
            if (!tokenName) {
                toast.error('Please enter agent name first');
                throw new Error('Agent name is required');
            }
            
            const loadingToast = toast.loading('Uploading image...');
            const ipfsUrl = await uploadImageToPinata(file, tokenName);
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
            if (!tokenName || !description) {
                toast.error('Please enter agent name and description first');
                return;
            }

            const loadingToast = toast.loading('Generating image with AI...');

            // Generate image with DALL-E
            const prompt = `Create a professional logo for an AI agent named "${tokenName}". The agent's purpose is: ${description}. Style: Modern, minimalist, suitable for a tech company. The image should be clear, memorable, and work well at different sizes.`;
            
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
            const file = new File([blob], `${tokenName}.png`, { type: 'image/png' });

            // Upload to Pinata
            const ipfsUrl = await uploadImageToPinata(file, tokenName);
            setImageUrl(ipfsUrl);
            
            toast.dismiss(loadingToast);
            toast.success('Image generated and uploaded successfully!');
        } catch (error) {
            console.error('Error generating image:', error);
            toast.error('Failed to generate image. Please try again.');
        }
    };


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
                                onChange={(e) => setTokenName(e.target.value)}
                                placeholder="Enter token name"
                                className="w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Description</label>
                            <textarea
                                value={description||''}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter description"
                                rows={4}
                                className="w-full bg-[#0B0E17] border border-[#1F2937] rounded-md p-3 text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] focus:outline-none resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Symbol</label>
                            <Input
                                value={ticker||''}
                                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                                placeholder="Enter symbol (e.g. BTC)"
                                className="w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] uppercase"
                                maxLength={5}
                            />
                            <p className="text-xs text-gray-500">Maximum 5 characters, automatically converted to uppercase</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Total Supply</label>
                            <Input
                                type="number"
                                value={totalSupply}
                                onChange={(e) => setTotalSupply(e.target.value)}
                                placeholder="Enter total supply (e.g. 1000000)"
                                className="w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]"
                                min="0"
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Social Links</h3>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Twitter URL</label>
                                <Input
                                    type="url"
                                    value={twitterUrl}
                                    onChange={(e) => setTwitterUrl(e.target.value)}
                                    placeholder="https://twitter.com/youraccount"
                                    className="w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Telegram URL</label>
                                <Input
                                    type="url"
                                    value={telegramUrl}
                                    onChange={(e) => setTelegramUrl(e.target.value)}
                                    placeholder="https://t.me/yourchannel"
                                    className="w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Website URL</label>
                                <Input
                                    type="url"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    placeholder="https://yourwebsite.com"
                                    className="w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]"
                                />
                            </div>
                            <div className="flex items-center justify-end">
                                <button
                                    onClick={()=>{}}
                                    className="flex justify-end items-end gap-2 px-6 py-2 bg-[#2196F3] text-white rounded hover:bg-[#1E88E5] transition-colors duration-200"
                                >
                                    Create Token
                                </button>
                            </div>
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
                                                    <Image
                                                        src={imageUrl}
                                                        alt={tokenName || 'Token'}
                                                        fill
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
                                                    {totalSupply ? Number(totalSupply).toLocaleString() : '0'} tokens
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