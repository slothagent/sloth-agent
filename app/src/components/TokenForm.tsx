'use client'

import React from 'react'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface TokenFormData {
  name: string
  symbol: string
  description: string
  image: string
  initialBuyValue: string
  initialSupply: number
  facebook?: string
  telegram?: string
  twitter?: string
}

interface TokenFormProps {
  onSuccess?: () => void
}

export default function TokenForm({ onSuccess }: TokenFormProps) {
  const {address} = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [tokenData, setTokenData] = useState<TokenFormData>({
    name: '',
    symbol: '',
    description: '',
    image: '',
    initialBuyValue: '',
    initialSupply: 100000000000,
    facebook: '',
    telegram: '',
    twitter: ''
  })
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdTokenData, setCreatedTokenData] = useState<{
    address: string;
    explorerLink: string;
  } | null>(null)

  const handleAIAssist = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "Help me improve my token information",
          tokenData: tokenData
        })
      })
      const data = await response.json()
      if (data.tokenData) {
        setTokenData(prev => ({...prev, ...data.tokenData}))
      }
    } catch (error) {
      console.error('AI assist failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateToken = async () => {
    setIsLoading(true)
    try {
        // Show loading toast
        const loadingToast = toast.loading('Creating your token...');

        const tokenNameCheck = await fetch(`/api/tokens/findByName`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: tokenData.name }),
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
                name: tokenData.name,
                symbol: tokenData.symbol,
                description: tokenData.description,
                addressOwner: address,
                tokenImage: tokenData.image,
                initialBuyValue: tokenData.initialBuyValue,
                initialSupply: 100000000000,
                facebook: tokenData.facebook,
                telegram: tokenData.telegram,
                twitter: tokenData.twitter
            }),
        });
        const tokenDatas = await token.json();

        if (!tokenDatas.success) {
            toast.dismiss(loadingToast);
            throw new Error(tokenDatas.message || 'Failed to deploy token');
        }

        // Extract token address from deploymentResult
        const addressMatch = tokenDatas.deploymentResult.match(/Token deployed to (0x[a-fA-F0-9]{40})/);
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
                name: tokenData.name,
                symbol: tokenData.symbol,
                description: tokenData.description,
                tokenImage: tokenData.image,
                initialBuyValue: tokenData.initialBuyValue,
                initialSupply: 10000000,
                facebook: tokenData.facebook,
                telegram: tokenData.telegram,
                twitter: tokenData.twitter
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
                ...tokenData,
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
            setIsSuccess(true)
            setCreatedTokenData({
                address: tokenAddress,
                explorerLink: explorerLink
            })
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
            // Still redirect to token page
            window.location.href = `/token/${tokenAddress}`;
        }
        
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create token';
        toast.error(`Error: ${errorMessage}`, {
            duration: 4000,
            position: 'top-center',
        });
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess && createdTokenData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Token Created Successfully! 🎉</CardTitle>
          <CardDescription>Your token has been deployed and verified</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Token Name:</p>
              <p>{tokenData.name}</p>
            </div>
            <div>
              <p className="font-semibold">Token Address:</p>
              <p className="break-all">{createdTokenData.address}</p>
            </div>
            {createdTokenData.explorerLink && (
              <div>
                <p className="font-semibold">Explorer Link:</p>
                <a 
                  href={createdTokenData.explorerLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline break-all"
                >
                  {createdTokenData.explorerLink}
                </a>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={() => {
              window.location.href = `/token/${createdTokenData.address}`;
            }}
          >
            View Token Details
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Token</CardTitle>
        <CardDescription>Fill in the details to create your token</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Token Name</Label>
              <Input
                id="name"
                value={tokenData.name}
                onChange={(e) => setTokenData(prev => ({...prev, name: e.target.value}))}
                placeholder="e.g. My Awesome Token"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="symbol">Token Symbol</Label>
              <Input
                id="symbol"
                value={tokenData.symbol}
                onChange={(e) => setTokenData(prev => ({...prev, symbol: e.target.value}))}
                placeholder="e.g. MAT"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={tokenData.description}
                onChange={(e) => setTokenData(prev => ({...prev, description: e.target.value}))}
                placeholder="Describe your token..."
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="image">Token Image URL</Label>
              <Input
                id="image"
                value={tokenData.image}
                onChange={(e) => setTokenData(prev => ({...prev, image: e.target.value}))}
                placeholder="https://..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="initialBuyValue">Initial Buy Value</Label>
              <Input
                id="initialBuyValue"
                value={tokenData.initialBuyValue}
                onChange={(e) => setTokenData(prev => ({...prev, initialBuyValue: e.target.value}))}
                placeholder="0.001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="initialSupply">Initial Supply</Label>
              <Input
                id="initialSupply"
                type="number"
                value={tokenData.initialSupply}
                onChange={(e) => setTokenData(prev => ({...prev, initialSupply: Number(e.target.value)}))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook Link</Label>
              <Input
                id="facebook"
                value={tokenData.facebook}
                onChange={(e) => setTokenData(prev => ({...prev, facebook: e.target.value}))}
                placeholder="https://facebook.com/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram Link</Label>
              <Input
                id="telegram"
                value={tokenData.telegram}
                onChange={(e) => setTokenData(prev => ({...prev, telegram: e.target.value}))}
                placeholder="https://t.me/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter Link</Label>
              <Input
                id="twitter"
                value={tokenData.twitter}
                onChange={(e) => setTokenData(prev => ({...prev, twitter: e.target.value}))}
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleCreateToken}
          disabled={isLoading}
        >
          Create Token
        </Button>
      </CardFooter>
    </Card>
  )
} 