'use client';

import Header from "@/components/Header";
import { useState } from "react";
import { useAccount, useWriteContract, useWatchContractEvent } from "wagmi";
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from "@/config/contracts";
import { OpenAI } from "openai";
import Image from "next/image";
import { uploadImageToPinata, uploadTokenMetadataToPinata } from "@/utils/pinata";
import toast from "react-hot-toast";
import { zeroAddress } from "viem";
import { useRouter } from "next/navigation";

const Mint = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  
  const { address } = useAccount();
  const { writeContractAsync, isPending: isMinting } = useWriteContract();

  // Watch for NFT minted events
  useWatchContractEvent({
    address: NFT_CONTRACT_ADDRESS,
    abi: NFT_CONTRACT_ABI,
    eventName: 'Transfer',
    args: {
      from: zeroAddress,
      to: address as `0x${string}`,
    },
    onLogs(logs) {
      toast.success("NFT minted successfully!");
      router.push('/nfts');
    },
  });

  // Configure OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Generate image using OpenAI
  const generateImage = async () => {
    try {
      setIsLoading(true);
      setError("");
      setGenerationStep("Initializing AI image generation...");

      if (!prompt.trim()) {
        throw new Error("Please enter a prompt");
      }

      const enhancedPrompt = `Create a safe, creative digital art piece of: ${prompt}`;
      
      setGenerationStep("Generating image with DALL-E...");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GENERATE_IMAGE}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: enhancedPrompt }),
      });
      const data = await response.json();
      
      // Handle the base64 image data safely
      setGenerationStep("Processing generated image...");
      const base64Response = data.base64_image;
      // Remove any potential data URL prefix to get clean base64
      const base64Data = base64Response.replace(/^data:image\/\w+;base64,/, '');
      
      try {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const imageBlob = new Blob([byteArray], { type: 'image/png' });

        setGenerationStep("Uploading to IPFS via Pinata...");
        const imageFile = new File([imageBlob], 'nft-image.png', { type: 'image/png' });
        const ipfsImageUrl = await uploadImageToPinata(
          imageFile,
          name
        );
        
        setImageUrl(ipfsImageUrl);
        toast.success("Image generated successfully!");
      } catch (decodeError) {
        console.error('Base64 decoding error:', decodeError);
        throw new Error('Failed to process the generated image');
      }
    } catch (err: any) {
      if (err?.message?.includes("safety system")) {
        setError("Your prompt was rejected by the safety system. Please try a different prompt that follows content guidelines.");
      } else if (err?.message?.includes("rate limits")) {
        setError("Too many requests. Please wait a moment before trying again.");
      } else {
        setError("Failed to generate image. Please try again with a different prompt.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
      setGenerationStep("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const toastId = toast.loading("Minting NFT...");
    
    try {
      // Then create and upload the metadata
      const tokenMetadata = {
        name: name,
        description: description,
        image: imageUrl,
      };
      
      const tokenUri = await uploadTokenMetadataToPinata(tokenMetadata);
      console.log("tokenUri", tokenUri);
      // Now mint the NFT with the IPFS token URI
      await writeContractAsync({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_CONTRACT_ABI,
        functionName: 'mintNFT',
        args: [address as `0x${string}`, tokenUri],
      });
      
      setIsSuccess(true);
      toast.success("Please wait for the transaction to complete!", { id: toastId });
    } catch (err) {
      setError("Failed to mint NFT. Please try again.");
      console.error(err);
      toast.error("Failed to mint NFT. Please try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Mint Your AI-Generated NFT</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NFT Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Enter NFT name"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  required
                  placeholder="Describe your NFT"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Prompt
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Describe the image you want to generate"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={generateImage}
                    disabled={!prompt || isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-200 disabled:text-gray-500 transition-colors"
                  >
                    {isLoading ? 'Generating...' : 'Generate'}
                  </button>
                </div>
                
                {isLoading && (
                  <div className="mt-4">
                    <div className="animate-pulse flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                      <span className="text-sm text-gray-600">{generationStep}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      This process may take up to 30 seconds...
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}
              </div>

              {imageUrl && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generated Image Preview
                  </label>
                  <div className="relative w-full aspect-square max-w-md mx-auto border border-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt="Generated NFT"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!imageUrl || !name || !description || isMinting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500 transition-colors font-medium"
              >
                {isMinting ? 'Minting...' : 'Mint NFT'}
              </button>

              {isSuccess && (
                <div className="mt-4 text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">
                  NFT minted successfully! 🎉
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Mint;
