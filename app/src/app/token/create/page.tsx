'use client';

import Header from '@/components/Header';
import Trending from '@/components/Trending';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';

async function uploadToPinata(file: File) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
            },
            body: formData
        });

        if (!res.ok) {
            throw new Error('Failed to upload to Pinata');
        }

        const data = await res.json();
        // The IpfsHash is the CID we need
        if (!data.IpfsHash) {
            throw new Error('No IPFS hash received');
        }
        
        return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw error;
    }
}

const CreateToken: React.FC = () => {
    const [showAdditionalInfo, setShowAdditionalInfo] = useState<boolean>(false);
    const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
    const { 
        address
    } = useAccount();

    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        description: '',
        image: '',
        initialBuyAmount: false,
        initialBuyValue: '',
        website: '',
        telegram: '',
        facebook: '',
        twitter: '',
        github: '',
        instagram: '',
        discord: '',
        reddit: '',
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const resetForm = () => {
        setFormData({
            name: '',
            symbol: '',
            description: '',
            image: '',
            initialBuyAmount: false,
            initialBuyValue: '',
            website: '',
            telegram: '',
            facebook: '',
            twitter: '',
            github: '',
            instagram: '',
            discord: '',
            reddit: '',
        });
        setShowAdditionalInfo(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (!address) {
            setIsSubmitting(false);
            setShowWalletModal(true);
            return;
        }

        try {
            // Show loading toast
            const loadingToast = toast.loading('Creating your token...');

            const tokenNameCheck = await fetch(`/api/tokens/findByName`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: formData.name }),
            });
            const tokenNameCheckData = await tokenNameCheck.json();
            if (tokenNameCheckData.length > 0) {
                toast.dismiss(loadingToast);
                toast.error('Token name already exists!');
                return;
            }

            const token = await fetch(`${process.env.NEXT_PUBLIC_API_DEPLOY_TOKEN}/deploy-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    symbol: formData.symbol,
                    description: formData.description,
                    addressOwner: address,
                    tokenImage: formData.image,
                    initialBuyValue: formData.initialBuyValue,
                    initialSupply: 100000000000,
                    facebook: formData.facebook,
                    telegram: formData.telegram,
                    twitter: formData.twitter
                }),
            });
            const tokenData = await token.json();

            if (!tokenData.success) {
                toast.dismiss(loadingToast);
                throw new Error(tokenData.message || 'Failed to deploy token');
            }

            // Extract token address from deploymentResult
            const addressMatch = tokenData.deploymentResult.match(/Token deployed to (0x[a-fA-F0-9]{40})/);
            const tokenAddress = addressMatch ? addressMatch[1] : null;
            
            if (!tokenAddress) {
                toast.dismiss(loadingToast);
                throw new Error('Failed to get token address from deployment');
            }

            const tokenDeployment = await fetch(`${process.env.NEXT_PUBLIC_API_DEPLOY_TOKEN}/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    contractAddress: tokenAddress,
                    addressOwner: address,
                    name: formData.name,
                    symbol: formData.symbol,
                    description: formData.description,
                    tokenImage: formData.image,
                    initialBuyValue: formData.initialBuyValue,
                    initialSupply: 10000000,
                    facebook: formData.facebook,
                    telegram: formData.telegram,
                    twitter: formData.twitter
                 }),
            });
            const tokenDeploymentData = await tokenDeployment.json();
            
            // Extract the explorer link from verification result using updated regex
            const explorerLinkMatch = tokenDeploymentData.verificationResult.match(
                /https:\/\/scanv2-testnet\.ancient8\.gg\/address\/0x[a-fA-F0-9]{40}#code/
            );
            const explorerLink = explorerLinkMatch ? explorerLinkMatch[0] : null;

            // Log for debugging
            // console.log('Verification Result:', tokenDeploymentData.verificationResult);
            // console.log('Explorer Link:', explorerLink);

            const response = await fetch('/api/tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    tokenAddress: tokenAddress,
                    explorerLink: explorerLink,
                    addressOwner: address
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            if (tokenDeploymentData.success) {
                toast.dismiss(loadingToast);
                toast.success('🎉 Token created successfully!', {
                    duration: 5000,
                    position: 'top-center',
                    icon: '🚀',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
                // Open the explorer link in a new tab if available
                if (explorerLink) {
                    window.open(explorerLink, '_blank');
                }
                // Redirect to the token page in the current tab
                window.location.href = `/token/${tokenAddress}`;
            } else {
                toast.error('Token verification failed');
                // Still redirect to token page
                window.location.href = `/token/${tokenAddress}`;
            }
            
            resetForm();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create token';
            setError(errorMessage);
            toast.error(`Error: ${errorMessage}`, {
                duration: 4000,
                position: 'top-center',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            {/* <CampaignBanner /> */}
            <main className="container mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-md">
                    {/* Basic Token Information */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Token Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Token Symbol *
                            </label>
                            <input
                                type="text"
                                name="symbol"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.symbol}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Token Image
                            </label>
                            <div className="space-y-4">
                                {/* File Upload Option */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                        type="file"
                                        name="imageFile"
                                        accept="image/*"
                                        className="hidden"
                                        id="imageUpload"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                // Check file size (e.g., 10MB limit)
                                                if (file.size > 10 * 1024 * 1024) {
                                                    toast.error('File size must be less than 10MB');
                                                    return;
                                                }

                                                try {
                                                    const loadingToast = toast.loading('Uploading image...');
                                                    const ipfsUrl = await uploadToPinata(file);
                                                    
                                                    if (!ipfsUrl) {
                                                        throw new Error('Failed to get IPFS URL');
                                                    }
                                                    
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        image: ipfsUrl
                                                    }));
                                                    
                                                    // Set the preview
                                                    setImagePreview(ipfsUrl);
                                                    
                                                    toast.dismiss(loadingToast);
                                                    toast.success('Image uploaded successfully!');
                                                } catch (error) {
                                                    toast.error('Failed to upload image');
                                                    console.error('Error uploading image:', error);
                                                }
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="imageUpload"
                                        className="flex flex-col items-center justify-center cursor-pointer"
                                    >
                                        {imagePreview ? (
                                            <div className="relative w-full">
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Token preview" 
                                                    className="max-h-48 mx-auto object-contain rounded-lg"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setImagePreview(null);
                                                        setFormData(prev => ({ ...prev, image: '' }));
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                                <span className="mt-2 text-sm text-gray-500">Click to upload from device</span>
                                            </>
                                        )}
                                    </label>
                                </div>

                                {/* URL Input Option */}
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Or enter image URL</label>
                                    <input
                                        type="url"
                                        name="image"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        value={formData.image}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setImagePreview(e.target.value);
                                        }}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Recommended size: 820x205px. Supported formats: PNG, JPG, JPEG, or GIF
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="initialBuyAmount"
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    checked={formData.initialBuyAmount}
                                    onChange={handleChange}
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                    Set initial buy amount
                                </label>
                            </div>
                            
                            {formData.initialBuyAmount && (
                                <div>
                                    <input
                                        type="number"
                                        name="initialBuyValue"
                                        placeholder="Enter amount"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        value={formData.initialBuyValue}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="showAdditionalInfo"
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                checked={showAdditionalInfo}
                                onChange={(e) => setShowAdditionalInfo(e.target.checked)}
                            />
                            <label htmlFor="showAdditionalInfo" className="ml-2 block text-sm text-gray-700">
                                Add Additional Information
                            </label>
                        </div>

                        {/* Additional Information Section */}
                        {showAdditionalInfo && (
                            <div className="border-t pt-6 mt-6">
                                <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            value={formData.website}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Telegram
                                        </label>
                                        <input
                                            type="url"
                                            name="telegram"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            value={formData.telegram}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Social Media Links */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { name: 'facebook' as const, label: 'Facebook' },
                                            { name: 'twitter' as const, label: 'Twitter' },
                                            { name: 'github' as const, label: 'GitHub' },
                                            { name: 'instagram' as const, label: 'Instagram' },
                                            { name: 'discord' as const, label: 'Discord' },
                                            { name: 'reddit' as const, label: 'Reddit' },
                                        ].map((social) => (
                                            <div key={social.name}>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {social.label}
                                                </label>
                                                <input
                                                    type="url"
                                                    name={social.name}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    value={formData[social.name]}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            {error && (
                                <div className="text-red-500 mb-4 text-sm">
                                    {error}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#04D9B2] text-white px-4 rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Token'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreateToken;