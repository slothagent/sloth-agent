"use client";

import Header from "@/components/Header";
import { useMyNFT } from "@/hooks/myNFT";
import { useAccount } from "wagmi";
import Image from "next/image";


const NFTs = () => {
    const { address } = useAccount();
    const { data: nfts } = useMyNFT(address);
    
    // Filter out NFTs with "Uniswap" in their name
    const filteredNFTs = nfts.filter(nft => !nft.metadata?.name?.includes("Uniswap"));
    
    return(
        <div className="flex flex-col bg-gray-50 min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNFTs.map((nft) => (
                        <div key={nft.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <div className="relative w-full h-64">
                                <Image
                                    src={nft?.image_url || nft?.metadata?.image || "/assets/nfts/nft-example.png"}
                                    alt={nft?.metadata?.name || "NFT"}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/assets/nfts/nft-example.png";
                                    }}
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{nft.metadata?.name}</h3>
                                <p className="text-gray-600">{nft.metadata?.description}</p>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Token ID: {nft?.id}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default NFTs;