import Image from "next/image";
import ProgressBar from './ProgressBar';
import { Token } from '@/data/tokens';
import Link from "next/link";

interface TokenCardProps {
  token: Token;
}

export default function TokenCard({ token }: TokenCardProps) {
  return (
    <Link 
      href={`/token/${token.tokenAddress}`} 
      className="block border border-gray-200 rounded-xl p-3 sm:p-4 bg-white hover:shadow-md transition-shadow"
    >
      {/* Banner Image */}
      <div className="relative w-full h-16 sm:h-24 mb-3 sm:mb-4 rounded-lg overflow-hidden">
        <Image
          src={token.image}
          alt={`${token.name} Banner`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Token Info */}
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="relative flex-shrink-0">
          <Image
            src={token.image}
            alt={token.name}
            width={40}
            height={40}
            className="rounded-full border-2 border-white shadow-sm sm:w-12 sm:h-12"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">{token.name}</h3>
            <span className="text-gray-500 text-xs sm:text-sm">{token.symbol}</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">
            {token.description}
          </p>
        </div>
      </div>
            
            
      {/* Progress Bar */}
      {/* <div className="mt-3 sm:mt-4">
        <ProgressBar percentage={token.percentage} mcap={token.mcap} />
      </div> */}

    </Link>
  );
} 