import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Print {
  id: string;
  name: string;
  image: string;
  code: string;
}

const prints: Print[] = [
  {
    id: 'MB1',
    name: 'MB1 Print',
    image: '/assets/nfts/nft-example.png',
    code: '07044',
  },  
  {
    id: 'MB2',
    name: 'MB2 Print',
    image: '/assets/nfts/nft-example.png',
    code: '07045',
  },    
  {
    id: 'MB3',
    name: 'MB3 Print',
    image: '/assets/nfts/nft-example.png',
    code: '07046',
  },  
  {
    id: 'MB4',
    name: 'MB4 Print',
    image: '/assets/nfts/nft-example.png',
    code: '07047',
  },
];

const Hero = () => {
  return (
    <div className="flex max-h-[700px] bg-gradient-to-b from-[#93E905]/10 to-white">
      <div className="container mx-auto relative flex items-center gap-4 py-8 pt-16">
        {/* Left Card */}
        <Card className="w-full md:w-[400px] max-h-[700px] border-2 border-black rounded-none">
          <CardContent className="p-0">
            {/* Image Container */}
            <div className="w-full h-[600px] relative">
              <div className="w-full h-full relative overflow-hidden">
                <Image
                  src="/assets/nfts/nft-example.png"
                  alt="MB1 Print"
                  fill
                  className="object-cover" 
                  priority
                />
                {/* Overlay Text */}
                <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black to-transparent">
                  <div className="flex flex-col">
                    <h2 className="text-8xl font-bold text-white mb-1 font-mono">MB1</h2>
                    <div className="flex flex-col gap-1">
                      <p className="text-white text-xl font-mono">07044</p>
                      <div className="flex items-center gap-2 text-white text-lg font-mono">
                        <span>UNIQUE PRINT</span>
                        <span className="text-2xl">•</span>
                        <span>5" x 7.5"</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>              
          
            <div className="w-full grid grid-cols-2">
              <Button variant="outline" className="text-white py-3 rounded-none font-mono font-medium border-2 border-white hover:bg-[#93E905] hover:text-black">
                ADD TO CART
              </Button>
              <Button variant="outline" className="text-white py-3 rounded-none font-mono border-2 border-white hover:bg-[#93E905] hover:text-black">
                DOWNLOAD
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Content */}
        <div className="flex-1 flex flex-col justify-between p-10">
          {/* Timer */}
          <div className="mb-12">
            <div className="flex gap-4 text-2xl font-bold font-mono text-black">
              <div className="border-2 border-black px-4 py-2 bg-[#93E905]/10">12 D</div>
              <div className="border-2 border-black px-4 py-2 bg-[#93E905]/10">08 H</div>
              <div className="border-2 border-black px-4 py-2 bg-[#93E905]/10">53 M</div>
            </div>
          </div>

          {/* Featured Print */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold mb-4 font-mono text-black">SLOTH AI<br />PLATFORM</h1>
            <p className="text-black/80 mb-8 font-mono">
              A pioneering platform designed to revolutionize the meme coin and decentralized finance (DeFi) space by providing an intuitive, AI-powered ecosystem for token creation and automated trading.
            </p>
            
            <div className="flex gap-4">
              <Button className="bg-[#93E905] text-black hover:bg-[#93E905]/90 rounded-none font-mono border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
                Create Agent
              </Button>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-[#93E905] hover:text-black rounded-none font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
                Explore Agents
              </Button>
            </div>
          </div>

          {/* Prints Grid*/}
          <div className="mt-auto">
            <div className="grid grid-cols-4 gap-6">
              {prints.map((print) => (
                <Card key={print.id} className="bg-[#93E905]/10 hover:bg-[#93E905]/20 transition-colors cursor-pointer border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
                  <CardContent className="p-1">
                    <div className="aspect-square relative">
                      <Image
                        src={print.image}
                        alt={print.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                        <h3 className="font-bold text-white text-sm font-mono">{print.name}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 