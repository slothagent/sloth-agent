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
    total: string;
  };
  marketCap: {
    current: string;
    total: string;
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
  followers: {
    count: string;
    change24h: string;
  };
  topTweets: {
    count: string;
  };
}

export interface PaginatedTokens {
  data: TokenData[];
  metadata: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
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
    marketCap: {
      current: "$42.8K",
      total: "$50.2K"
    },
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
      d7: "$2.1M",
      total: "$3.2M"
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
    followers: {
      count: "1.2K",
      change24h: "+123"
    },
    topTweets: {
      count: "15"
    }
  },
  {
    id: 2,
    token: {
      name: "Fartcoin",
      symbol: "fartcoin",
      address: "0xCK3E...9po",
      logo: "https://pbs.twimg.com/profile_images/1848028530099052545/urFxrFx__400x400.jpg",
      network: "BSC"
    },
    age: "124d",
    liquidity: {
      amount: "137.2K",
      value: "$11.7M",
      change24h: "+15.8%"
    },
    marketCap: {
      current: "$137.2M",
      total: "$150.5M"
    },
    blueChipHolding: "12.3%",
    holders: {
      count: "15.2K",
      change24h: "+234"
    },
    smartMoney: {
      value: "$850.3K",
      kol: "12"
    },
    transactions: {
      total: "45,234",
      buys: "28,123",
      sells: "17,111",
      unique: "3,234"
    },
    volume: {
      h1: "$1.2M",
      h24: "$11.7M",
      d7: "$82.3M",
      total: "$95.2M"
    },
    price: {
      current: "$0.1572",
      ath: "$0.4254",
      atl: "$0.0892"
    },
    priceChanges: {
      m1: { value: "+2.3%", isPositive: true },
      m5: { value: "+8.9%", isPositive: true },
      h1: { value: "+15.2%", isPositive: true },
      h24: { value: "+42.3%", isPositive: true },
      d7: { value: "-11.2%", isPositive: false }
    },
    followers: {
      count: "5.6K",
      change24h: "+892"
    },
    topTweets: {
      count: "45"
    }
  },
  {
    id: 3,
    token: {
      name: "Bankr",
      symbol: "bankr",
      address: "0xFUN4...7kp",
      logo: "https://pbs.twimg.com/profile_images/1867636732533125121/ml6EJHfa_400x400.jpg",
      network: "BSC"
    },
    age: "892d",
    liquidity: {
      amount: "234.5K",
      value: "$3.02M",
      change24h: "-2.3%"
    },
    marketCap: {
      current: "$15.8M",
      total: "$18.3M"
    },
    blueChipHolding: "5.6%",
    holders: {
      count: "45.6K",
      change24h: "+123"
    },
    smartMoney: {
      value: "$234.5K",
      kol: "8"
    },
    transactions: {
      total: "234,567",
      buys: "123,456",
      sells: "111,111",
      unique: "12,345"
    },
    volume: {
      h1: "$234.5K",
      h24: "$3.02M",
      d7: "$25.8M",
      total: "$29.1M"
    },
    price: {
      current: "$0.003037",
      ath: "$0.01234",
      atl: "$0.00123"
    },
    priceChanges: {
      m1: { value: "-1.2%", isPositive: false },
      m5: { value: "-3.4%", isPositive: false },
      h1: { value: "+2.3%", isPositive: true },
      h24: { value: "-5.6%", isPositive: false },
      d7: { value: "+15.8%", isPositive: true }
    },
    followers: {
      count: "12.3K",
      change24h: "+234"
    },
    topTweets: {
      count: "78"
    }
  },
  {
    id: 4,
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
    marketCap: {
      current: "$892.5K",
      total: "$1.2M"
    },
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
      d7: "$412.3K",
      total: "$468.8K"
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
    followers: {
      count: "892",
      change24h: "+45"
    },
    topTweets: {
      count: "12"
    }
  },
  {
    id: 5,
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
    marketCap: {
      current: "$128.7K",
      total: "$150.3K"
    },
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
      d7: "$42.1M",
      total: "$53.8M"
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
    followers: {
      count: "456",
      change24h: "+23"
    },
    topTweets: {
      count: "8"
    }
  },
  {
    id: 6,
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
    marketCap: {
      current: "$85.2K",
      total: "$92.7K"
    },
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
      d7: "$8.5M",
      total: "$10.4M"
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
    followers: {
      count: "234",
      change24h: "+12"
    },
    topTweets: {
      count: "5"
    }
  }
];

export const getPaginatedTokens = (page: number = 1, pageSize: number = 10): PaginatedTokens => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    data: trendingTokens.slice(start, end),
    metadata: {
      currentPage: page,
      totalPages: Math.ceil(trendingTokens.length / pageSize),
      pageSize: pageSize,
      totalCount: trendingTokens.length
    }
  };
}; 