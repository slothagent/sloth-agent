import { Token } from '../token.service';
import { SuiToken } from '../interfaces/sui-token.interface';

export interface CoinGeckoToken {
  id: string;
  ticker: string;
  name: string;
  platforms: {
    [key: string]: string;  // chainId: contractAddress
  };
  imageUrl: string;
  market_data: {
    current_price: {
      usd: number;
    };
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    total_supply: number;
    max_supply: number | null;
    circulating_supply: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
  };
  description: string;
  categories: string[];
  links: {
    homepage: string;
    blockchain_site: string;
    twitter: string;
    telegram: string;
    github?: string;  // Make github optional
  };
}

export interface TokenSearchResponse {
  localTokens: Token[];
  marketTokens: CoinGeckoToken[];
  suiTokens: SuiToken[];
  total: number;
} 