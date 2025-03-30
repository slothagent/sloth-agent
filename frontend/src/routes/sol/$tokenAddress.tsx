import {  
    ArrowLeft,
    ChevronRight,
    Copy,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { createFileRoute,useNavigate } from '@tanstack/react-router';
import TrandingViewChart from '../../components/chart/TrandingViewChart';
import { useFetchTokenSolana } from '../../hooks/useTokens';
import { copyToClipboard } from '../../utils/utils';
import { useEffect, useState } from 'react';
import { Input } from '../../components/ui/input';


export const Route = createFileRoute("/token/$tokenAddress")({
    component: TokenDetails
});

function TokenDetails() {
    const { tokenAddress } = Route.useParams();
    const navigate = useNavigate()
    const { data: tokenData } = useFetchTokenSolana(tokenAddress || '');
    const [amount, setAmount] = useState<string>('0');
    const [type, setType] = useState<string>('buy');
    const [tokenImage, setTokenImage] = useState<string | null>(null);
    
    const fetchTokenImage = async () => {
        const response = await fetch(tokenData?.metaplex?.metadataUri);
        const blob = await response.json();
        setTokenImage(blob.image);
    }

    useEffect(() => {
        if (tokenData?.metaplex?.metadataUri) {
            fetchTokenImage();
        }
    }, [tokenData]);


    const handleTypeChange = (type: string) => {
        setType(type);
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {    
        setAmount(e.target.value);
    }

    const handleAmountClick = (amount: number) => {
        setAmount(amount.toString());
    }

    if(!tokenData) {
        return <div className="min-h-full bg-[#0B0E17] p-4 pb-0 md:p-0 sm:pb-0">
            <div className="flex items-start h-full">
                <span className="text-gray-400">Loading...</span>
            </div>
        </div>
    }

    return (
    <div className="min-h-full bg-[#0B0E17] p-4 pb-0 md:p-0 sm:pb-0">
      {/* Top Navigation Bar */}
        <div className="bg-[#0B0E17] top-0 sm:top-12 border-[#1F2937] sm:border-b-0">
            <div className="container mx-0 md:mx-auto py-2 sm:py-4 lg:px-4 pt-2 flex md:items-center md:justify-between gap-4 max-lg:px-4 flex-col md:flex-row mb-0 lg:mt-8">
                <div className="flex items-center gap-2 justify-between sm:justify-start">
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                            onClick={()=>navigate({to: "/"})}
                        >
                            <div className="w-7 h-7 bg-[#161B28] flex items-center justify-center border border-[#1F2937] hover:border-gray-600">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                        </Button>
                        <div className="hidden sm:flex items-center gap-2 border border-[#1F2937] px-3 py-1 hover:border-gray-600 transition-colors duration-200">
                            <p className="text-gray-400 text-sm font-medium">{tokenData?.symbol}</p>
                        </div>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-gray-500 hidden sm:block" />
                    
                    <div className="hidden sm:block">
                        <button className="flex items-center justify-center gap-3 px-3 py-1 text-sm font-medium text-gray-400 border border-[#1F2937] hover:bg-[#1C2333] hover:border-gray-600 transition-all duration-200">
                            <img 
                                className="w-5 h-5 rounded-md" 
                                alt={tokenData?.name} 
                                src={tokenImage||''} 
                                loading="lazy" 
                            />
                            {tokenData?.name}
                        </button>
                    </div>
                </div>
                
            </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto flex flex-col sm:mt-4 mb-6 lg:px-4 lg:mb-12">
            <div className="lg:mb-10 block">
                <div className="flex flex-col max-lg:p-2 h-full w-full">
                    <div className="flex gap-4 w-full">
                        <div className="hidden md:flex flex-col">
                            <div className="lg:flex w-full items-center">                        
                                <div className="lg:flex items-start gap-3 h-full hidden">
                                    <img 
                                        src={tokenImage||''}
                                        alt="Token Logo"
                                        className="w-28 h-28 rounded-xl"
                                        loading="lazy"
                                        width={64}
                                        height={64}
                                    />
                                    <div className="lg:flex flex-col justify-center h-full">
                                        <div className='flex justify-start items-start flex-col'>
                                            <div className="flex items-center gap-2">
                                                <h1 className="text-3xl font-medium mb-1 text-white">{tokenData?.name}</h1>
                                            </div>
                                            <p className="text-lg text-gray-400">@{tokenData?.symbol}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-col gap-2 mt-4 space-y-4">
                                <div className="text-white text-sm">
                                    {tokenData?.description}
                                </div>
                                <div className="flex items-center gap-4 mb-2">
                                    {tokenData?.twitterUrl && (
                                        <a 
                                            href={tokenData.twitterUrl} 
                                            target="_blank"
                                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-[#161B28] border border-[#1F2937] hover:text-white hover:border-gray-600 transition-colors rounded-md"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                                            </svg>
                                            Twitter
                                        </a>
                                    )}
                                    {tokenData?.websiteUrl && (
                                        <a 
                                            href={tokenData.websiteUrl} 
                                            target="_blank"
                                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-[#161B28] border border-[#1F2937] hover:text-white hover:border-gray-600 transition-colors rounded-md"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                                <circle cx="12" cy="12" r="10"/>
                                                <line x1="2" y1="12" x2="22" y2="12"/>
                                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                            </svg>
                                            Website
                                        </a>
                                    )}
                                    {tokenData?.telegramUrl && (
                                        <a 
                                            href={tokenData.telegramUrl} 
                                            target="_blank"
                                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-[#161B28] border border-[#1F2937] hover:text-white hover:border-gray-600 transition-colors rounded-md"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                                <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 7.5a2.25 2.25 0 0 0 .126 4.303l3.984 1.028 2.25 6.75a2.25 2.25 0 0 0 4.203.495l7.5-16.5a2.25 2.25 0 0 0-1.041-3.791z"/>
                                            </svg>
                                            Telegram
                                        </a>
                                    )}
                                </div>
                            </div>
                            
                        </div>
                        <div className="ml-auto w-max hidden lg:block">
                            <div className="grid grid-cols-2 max-h-[86px]">
                                <div className="w-52 h-[86px] justify-between flex flex-col border border-[#1F2937] px-4 py-2 bg-[#161B28]">
                                    <div className="flex flex-col h-full">
                                        <div className="text-sm mb-auto flex items-center gap-1.5 font-medium text-gray-400">
                                            <img alt="Chain" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-6" src={"/assets/chains/solana.png"} style={{ color: 'transparent' }} />
                                            Contract address
                                        </div>
                                        <div className="flex text-sm items-center gap-1 mt-1.5 text-gray-400 hover:text-white">
                                            {tokenData?.mint ? (
                                                <a href={`https://solscan.io/token/${tokenData?.mint}`} className='hover:underline' target="_blank">
                                                    {tokenData?.mint.slice(0, 4)}...{tokenData?.mint.slice(-4)}
                                                </a>
                                            ) : (
                                                <span>Address not available</span>
                                            )}
                                            <button onClick={() => copyToClipboard(tokenAddress||'')} className="ml-1 text-gray-400 hover:text-white cursor-pointer">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    <div className="flex flex-col lg:hidden">
                        <div className="flex gap-3 items-center">
                            <div className='flex gap-4'>
                                <img 
                                    src={tokenImage||''}
                                    alt="Token Logo"
                                    className="w-28 h-28 rounded-xl"
                                    loading="lazy"
                                    width={64}
                                    height={64}
                                />
                                <div className="flex flex-col gap-0">
                                    <div className="flex items-center gap-1.5">
                                        <h1 className="text-2xl font-medium font-display mb-1 text-white">{tokenData?.name}</h1>
                                    </div>
                                    <p className="text-xs text-gray-400">@{tokenData?.symbol}</p>
                                    <div className="mt-2 flex items-center gap-1">
                                        <div className="flex items-center rounded justify-center font-sans font-medium w-fit bg-[#161B28] text-gray-400 h-6 gap-1 text-xs px-2 border border-[#1F2937]">
                                            {tokenData?.symbol}
                                        </div>
                                        <a href={`https://solscan.io/token/${tokenData?.mint}`} target="_blank" className="flex items-center rounded justify-center font-medium w-fit bg-[#161B28] text-gray-400 text-[10px] leading-[12px] gap-1 px-1 h-auto py-1 border border-[#1F2937]">
                                            <img alt="Chain" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-4" src="/assets/chains/a8.png" style={{ color: 'transparent' }} />
                                            {tokenData?.mint.slice(0, 4)}...{tokenData?.mint.slice(-4)}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-[#1F2937]">
                <div className="">
                <Tabs defaultValue="trade" className="w-full">
                    <div className="flex-wrap">
                        <div className="flex items-center justify-between mb-4 border-b border-[#1F2937]">
                            <TabsList className="h-[62px] w-full justify-start gap-6 bg-transparent">
                                <TabsTrigger 
                                    value="trade"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none rounded-none px-0 text-xs md:text-base font-medium text-gray-400 data-[state=active]:text-white whitespace-nowrap cursor-pointer"
                                >
                                    <div className="flex items-center gap-1">Trade</div>
                                </TabsTrigger>      
                            </TabsList>
                        </div>
                    </div>

                    <TabsContent value="trade" className="mt-4">

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="col-span-2 h-[350px] w-full sm:h-[450px] md:h-[550px] border rounded-lg relative flex flex-col border-[#1F2937] bg-[#161B28]">
                                <div className="col-span-1 flex-1 sm:p-4 relative">
                                    <TrandingViewChart tokenAddress={tokenAddress || ''} />
                                </div>
                            </div>
                            <div className="border border-[#1F2937] md:w-xl p-2 overflow-hidden h-[450px] sm:h-[550px] bg-[#161B28]">
                                <Tabs defaultValue="buy" className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4 justify-between">
                                        <div className="w-[200px]">
                                            <TabsList className="grid w-full grid-cols-3 bg-[#0B0E17]">
                                                <TabsTrigger 
                                                    value="buy"
                                                    onClick={() => handleTypeChange('buy')}
                                                    className="text-gray-400 data-[state=active]:text-white"
                                                >
                                                    Buy
                                                </TabsTrigger>
                                                <TabsTrigger 
                                                    value="sell"
                                                    onClick={() => handleTypeChange('sell')}
                                                    className="text-gray-400 data-[state=active]:text-white"
                                                >
                                                    Sell
                                                </TabsTrigger>
                                                <TabsTrigger 
                                                    value="auto"
                                                    className="text-gray-400 data-[state=active]:text-white"
                                                >
                                                    Auto
                                                </TabsTrigger>
                                            </TabsList>
                                        </div>

                                    </div>
                                    <TabsContent value="buy">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-gray-400">Amount</span>
                                                <div className="flex items-center gap-2 border border-[#1F2937] px-2 bg-[#0B0E17]">
                                                    <Input 
                                                        type="number"
                                                        placeholder="0.0"
                                                        step="0.01"
                                                        min="0"
                                                        value={parseFloat(amount||"0")||''}
                                                        onChange={handleAmountChange}
                                                        className="w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent text-white" 
                                                    />
                                                    <span className="text-gray-400">SOL</span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    <button 
                                                        onClick={() => handleAmountClick(1)}
                                                        className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                    >
                                                        1
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAmountClick(2)}
                                                        className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                    >
                                                        2
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAmountClick(5)}
                                                        className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                    >
                                                        5
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAmountClick(10)}
                                                        className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                    >
                                                        10
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <span>You will receive: 0 SOL</span>
                                            </div>
                                            <Button onClick={() => {}} className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md font-medium transition-colors">
                                                Buy
                                            </Button>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="sell">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-gray-400">Amount</span>
                                                <div className="flex items-center gap-2 border border-[#1F2937] px-2 bg-[#0B0E17]">
                                                    <Input 
                                                        type="text"
                                                        placeholder="0.0"
                                                        value={amount||''}
                                                        onChange={handleAmountChange}
                                                        className="w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent text-white" 
                                                    />
                                                    <span className="text-gray-400">{tokenData?.ticker}</span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    <button 
                                                        onClick={() => setAmount('10')}
                                                        className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                    >
                                                        10%
                                                    </button>
                                                    <button 
                                                        onClick={() => setAmount('30')}
                                                        className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                    >
                                                        30%
                                                    </button>
                                                    <button 
                                                        onClick={() => setAmount('50')}
                                                        className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                    >
                                                        50%
                                                    </button>
                                                    <button 
                                                        onClick={() => setAmount('100')}
                                                        className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                    >
                                                        100%
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <span>You will receive: 0 SOL</span>
                                            </div>
                                            <Button 
                                                className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Sell
                                            </Button>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="auto">
                                        <span className="text-gray-400">Coming Soon</span>
                                    </TabsContent>  
                                </Tabs>
                            </div>
                            
                        </div>
                        
                    </TabsContent>
                </Tabs>
                </div>
            </div>
            
        </div>      
    
    </div>
    );
} 


export default TokenDetails;