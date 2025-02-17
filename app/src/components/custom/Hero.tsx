import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

interface Print {
  id: string;
  name: string;
  image: string;
  code: string;
} 

const prints: Print[] = [
  {
    id: 'griffain',
    name: 'Griffain',
    image: '/assets/tokens/griffain.png',
    code: '07044',
  },  
  {
    id: 'eliza',
    name: 'eliza',
    image: '/assets/tokens/eliza.png',
    code: '07045',
  },    
  {
    id: 'aixbt',
    name: 'aiXBT',
    image: '/assets/tokens/aixbt.png',
    code: '07046',
  },  
  {
    id: 'vitural',
    name: 'VITURAL',
    image: '/assets/tokens/vitural.png',
    code: '07047',
  },
];
 
const Hero = () => {
  const router = useRouter();
  return (
    <div className="flex max-h-[700px] bg-[#0A0D16]">
      <div className="container mx-auto relative flex items-center gap-4 py-8 pt-16">
        <Card className="w-full md:w-[400px] max-h-[700px]  rounded-none border-2 border-white ">
          <CardContent className="p-0">
            <div className="w-full h-[600px] relative">
              <div className="w-full h-full relative overflow-hidden">
                <Image
                  src="https://pbs.twimg.com/profile_images/1881065252776767488/IeGmkIiT_400x400.jpg"
                  alt="whispersai"
                  fill
                  className="object-cover" 
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-[#0A0D16]/50 to-transparent">
                  <div className="flex flex-col">
                    <h2 className="text-3xl font-bold text-white mb-1 font-mono">whispersai</h2>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-white text-lg font-mono">
                        <span>Total Market Cap</span>
                        <span className="text-2xl">•</span>
                        <span>$100,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>              
          
            <Button variant="outline" className="text-white py-3 rounded-none w-full font-mono border-2  hover:bg-[#93E905] hover:text-black">
              BUY NOW
            </Button>
          </CardContent>
        </Card>

        {/* Right Content */}
        <div className="flex-1 flex flex-col justify-between p-10">
          {/* Timer */}
          <div className="mb-12">
            <div className="flex gap-4 text-2xl font-bold font-mono text-black">
              <div className="px-4 py-2  text-white">12 D</div>
              <div className="px-4 py-2  text-white">08 H</div>
              <div className="px-4 py-2  text-white">53 M</div>
            </div>
          </div>

          {/* Featured Print */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold mb-4 font-mono text-white">SLOTH AGENT</h1>
            <p className="text-white mb-8 font-mono">
              A pioneering platform designed to revolutionize the meme coin and decentralized finance (DeFi) space by providing an intuitive, AI-powered ecosystem for token creation and automated trading.
            </p>
            
            <div className="flex gap-4">
              <Button variant="outline" className="text-white rounded-none font-mono " onClick={() => router.push('/agent/create')}>
                Create Agent
              </Button>
              <Button variant="outline" className="text-white rounded-none font-mono ">
                Explore Agents
              </Button>
            </div>
          </div>

          {/* Prints Grid*/}
          <div className="mt-auto">
            <div className="grid grid-cols-4 gap-6">
              {prints.map((print) => (
                <Card key={print.id} className="  cursor-pointer border-2 border-white rounded-none ">
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