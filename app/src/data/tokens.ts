export interface Token {
  _id: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  initialBuyAmount: boolean;
  initialBuyValue: string;
  website: string;
  telegram: string;
  facebook: string;
  twitter: string;
  github: string;
  instagram: string;
  discord: string;
  reddit: string;
  tokenAddress: string;
  explorerLink: string;
  addressOwner: string;
  createdAt: string;
  status: string;
}

export const tokens: Token[] = [
  {
    _id: '1',
    name: 'PUNGY DRAGONS',
    symbol: 'DENGO',
    description: 'Community-driven token focused on sustainable growth',
    image: '/assets/avatar.jpg',
    initialBuyAmount: true,
    initialBuyValue: '$37.8K',
    website: 'https://www.pungydragons.com',
    telegram: 'https://t.me/pungydragons',
    facebook: 'https://www.facebook.com/pungydragons',
    twitter: 'https://twitter.com/pungydragons',
    github: 'https://github.com/pungydragons',
    instagram: 'https://www.instagram.com/pungydragons',
    discord: 'https://discord.gg/pungydragons',
    reddit: 'https://www.reddit.com/r/pungydragons',
    tokenAddress: '0x123...abc',
    explorerLink: 'https://etherscan.io/token/0x123...abc',
    addressOwner: '0x123...abc',
    createdAt: '2023-01-01',
    status: 'verified'
  },
  // Thêm các token khác nếu cần
]; 