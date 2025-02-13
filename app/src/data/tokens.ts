export interface TokenData {
  id: number;
  token: {
    name: string;
    symbol: string;
    address: string;
    logo: string;
    network: string;
  };
  age: string;
  liquidity: {
    amount: string;
    value: string;
    change24h: string;
  };
  marketCap: string;
  blueChipHolding: string;
  holders: {
    count: string;
    change24h: string;
  };
  smartMoney: {
    value: string;
    kol: string;
  };
  transactions: {
    total: string;
    buys: string;
    sells: string;
    unique: string;
  };
  volume: {
    h1: string;
    h24: string;
    d7: string;
  };
  price: {
    current: string;
    ath: string;
    atl: string;
  };
  priceChanges: {
    m1: { value: string; isPositive: boolean };
    m5: { value: string; isPositive: boolean };
    h1: { value: string; isPositive: boolean };
    h24: { value: string; isPositive: boolean };
    d7: { value: string; isPositive: boolean };
  };
  audit: {
    noMint: boolean;
    blacklist: boolean;
    burn: boolean;
    kyc: boolean;
    audit: boolean;
  };
}

export const trendingTokens: TokenData[] = [
  {
    id: 1,
    token: {
      name: "SLOTH AI",
      symbol: "SLTH",
      address: "0xFknP...3oo",
      logo: "/assets/tokens/slothai.png",
      network: "BSC"
    },
    age: "257d",
    liquidity: {
      amount: "7.1K",
      value: "$3.6K",
      change24h: "+5.2%"
    },
    marketCap: "$42.8K",
    blueChipHolding: "8.6%",
    holders: {
      count: "58",
      change24h: "+12"
    },
    smartMoney: {
      value: "$1.2K",
      kol: "3"
    },
    transactions: {
      total: "21,767",
      buys: "14,671",
      sells: "7,096",
      unique: "892"
    },
    volume: {
      h1: "$100.1K",
      h24: "$450.3K",
      d7: "$2.1M"
    },
    price: {
      current: "$0.03648",
      ath: "$0.05123",
      atl: "$0.00892"
    },
    priceChanges: {
      m1: { value: "+0.8%", isPositive: true },
      m5: { value: "+2.3%", isPositive: true },
      h1: { value: "+3.4%", isPositive: true },
      h24: { value: "+15.2%", isPositive: true },
      d7: { value: "-8.5%", isPositive: false }
    },
    audit: {
      noMint: true,
      blacklist: false,
      burn: true,
      kyc: true,
      audit: true
    }
  },
  {
    id: 2,
    token: {
      name: "AIXBT",
      symbol: "AIXBT",
      address: "0xJ5Tq...ump",
      logo: "/assets/tokens/aixbt.png",
      network: "BSC"
    },
    age: "19d",
    liquidity: {
      amount: "84K",
      value: "$596.9K",
      change24h: "+1.8%"
    },
    marketCap: "$892.5K",
    blueChipHolding: "2.1%",
    holders: {
      count: "5.6K",
      change24h: "+234"
    },
    smartMoney: {
      value: "$25.3K",
      kol: "8"
    },
    transactions: {
      total: "24,351",
      buys: "12,188",
      sells: "12,163",
      unique: "1,523"
    },
    volume: {
      h1: "$3.7K",
      h24: "$52.8K",
      d7: "$412.3K"
    },
    price: {
      current: "$0.0003",
      ath: "$0.0012",
      atl: "$0.00015"
    },
    priceChanges: {
      m1: { value: "+0.1%", isPositive: true },
      m5: { value: "+0.6%", isPositive: true },
      h1: { value: "+1.7%", isPositive: true },
      h24: { value: "-5.2%", isPositive: false },
      d7: { value: "+32.1%", isPositive: true }
    },
    audit: {
      noMint: true,
      blacklist: false,
      burn: true,
      kyc: false,
      audit: true
    }
  },
  {
    id: 3,
    token: {
      name: "ELIZA",
      symbol: "ELIZA",
      address: "0xCKM4...ump",
      logo: "/assets/tokens/eliza.png",
      network: "BSC"
    },
    age: "36d",
    liquidity: {
      amount: "33.4K",
      value: "$65.2K",
      change24h: "+8.9%"
    },
    marketCap: "$128.7K",
    blueChipHolding: "0.3%",
    holders: {
      count: "1.1K",
      change24h: "+45"
    },
    smartMoney: {
      value: "$8.2K",
      kol: "5"
    },
    transactions: {
      total: "19,488",
      buys: "10,056",
      sells: "9,432",
      unique: "892"
    },
    volume: {
      h1: "$3.2M",
      h24: "$8.5M",
      d7: "$42.1M"
    },
    price: {
      current: "$0.06637",
      ath: "$0.12589",
      atl: "$0.02341"
    },
    priceChanges: {
      m1: { value: "+5%", isPositive: true },
      m5: { value: "-39.5%", isPositive: false },
      h1: { value: "+995.8%", isPositive: true },
      h24: { value: "+125.3%", isPositive: true },
      d7: { value: "-15.8%", isPositive: false }
    },
    audit: {
      noMint: true,
      blacklist: false,
      burn: true,
      kyc: true,
      audit: false
    }
  },
  {
    id: 4,
    token: {
      name: "VITURAL",
      symbol: "VIT",
      address: "0xHpsF...ump",
      logo: "/assets/tokens/vitural.png",
      network: "BSC"
    },
    age: "53d",
    liquidity: {
      amount: "11.6K",
      value: "$9.5K",
      change24h: "-2.3%"
    },
    marketCap: "$85.2K",
    blueChipHolding: "1.7%",
    holders: {
      count: "402",
      change24h: "+18"
    },
    smartMoney: {
      value: "$5.1K",
      kol: "2"
    },
    transactions: {
      total: "15,137",
      buys: "13,606",
      sells: "1,531",
      unique: "623"
    },
    volume: {
      h1: "$668.1K",
      h24: "$1.2M",
      d7: "$8.5M"
    },
    price: {
      current: "$0.09542",
      ath: "$0.15234",
      atl: "$0.03891"
    },
    priceChanges: {
      m1: { value: "-0.5%", isPositive: false },
      m5: { value: "+10.9%", isPositive: true },
      h1: { value: "-56.2%", isPositive: false },
      h24: { value: "+82.3%", isPositive: true },
      d7: { value: "-23.5%", isPositive: false }
    },
    audit: {
      noMint: true,
      blacklist: false,
      burn: true,
      kyc: true,
      audit: true
    }
  }
]; 