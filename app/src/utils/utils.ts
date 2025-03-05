const timeAgo = (date: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + 'y ago';
    
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + 'd ago';
    
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + 'h ago';
    
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + 'm ago';
    
    return Math.floor(seconds) + 's ago';
};



const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(2)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(6);
};

const formatAddress = (address: string) => {
  if (!address) return '-';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export { timeAgo, formatNumber, formatAddress };