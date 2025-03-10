'use client';

import React, { useState, useEffect } from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import { ancient8Sepolia } from 'wagmi/chains';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';
import { config } from '@/wagmi';

async function uploadToPinata(file: File) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PINATA_JWT}`
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


export const ViewFrame = ({ code }: { code: string }) => {
    const [tokenAddress, setTokenAddress] = useState<string | null>(null);
    const { address } = useAccount();
  const scope = {
    React,
    useState,
    useEffect,
    config,
    chain: ancient8Sepolia,
    toast,
    useAccount,
    uploadToPinata: async (file: File) => {
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
                toast.dismiss(loadingToast);
                toast.success('Image uploaded successfully!');
            } catch (error) {
                toast.error('Failed to upload image');
                console.error('Error uploading image:', error);
            }
        }
    },
    deployToken: async (data: any) => {
      try {
        // Show loading toast
        const loadingToast = toast.loading('Creating your token...');

        const tokenNameCheck = await fetch(`/api/tokens/findByName`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: data.name }),
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
                name: data.name,
                symbol: data.symbol,
                description: data.description,
                addressOwner: address,
                tokenImage: data.image,
                initialBuyValue: data.initialBuyValue,
                initialSupply: 100000000000,
                facebook: data.facebook,
                telegram: data.telegram,
                twitter: data.twitter
            }),
        });
        const tokenData = await token.json();

        if (!tokenData.success) {
            toast.dismiss(loadingToast);
            throw new Error(tokenData.message || 'Failed to deploy token');
        }

        const tokenAddress = tokenData.deploymentResult.match(/Token deployed to (0x[a-fA-F0-9]{40})/)?.[1];
        if (!tokenAddress) {
            throw new Error('Failed to get token address from deployment');
        }
        setTokenAddress(tokenAddress);
        toast.dismiss(loadingToast);
        toast.success('Token deployed successfully!');
      } catch (error) {
        toast.error(`Failed to deploy token: ${error}`);
        console.error('Error deploying token:', error);
      }
    },
    verifyToken: async (dataToken: any) => {
      try {
        const loadingToast = toast.loading('Verifying token...');
        const tokenDeployment = await fetch(`${process.env.NEXT_PUBLIC_API_DEPLOY_TOKEN}/verify-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                contractAddress: tokenAddress,
                addressOwner: address,
                name: dataToken.name,
                symbol: dataToken.symbol,
                description: dataToken.description,
                tokenImage: dataToken.image,
                initialBuyValue: dataToken.initialBuyValue,
                initialSupply: 10000000,
                facebook: dataToken.facebook,
                telegram: dataToken.telegram,
                twitter: dataToken.twitter
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
                ...dataToken,
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
        } else {
            toast.error('Token verification failed');
        }
      } catch (error) {
        toast.error(`Failed to verify token: ${error}`);
        console.error('Error verifying token:', error);
      }
    }
  };

  return (
    <LiveProvider 
      code={code} 
      scope={scope}
      transformCode={(code) => `
        ${code.includes('className') ? '' : "import 'tailwindcss/tailwind.css';"}
        ${code}
      `}
    >
      <div className="rounded-lg border bg-white">
        <div className="p-4">
          <LivePreview />
          <LiveError 
            className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded"
          />
        </div>
      </div>
    </LiveProvider>
  );
};