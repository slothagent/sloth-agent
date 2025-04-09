import { toast } from "react-hot-toast";
import { FullMath } from "./fullMath";

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



const formatNumber = (num: number, decimals: number = 2): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(2)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(decimals);
};

const formatAddress = (address: string) => {
  if (!address) return '-';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};


const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard');
};

const calculateAmount = (amount: number, nativeOffset: number, saleAmount: number, totalNativeCollected: number, tokenOffset: number) => {
  return FullMath.mulDiv(
    BigInt(amount) + BigInt(nativeOffset),
    BigInt(saleAmount),
    BigInt(totalNativeCollected) + BigInt(tokenOffset)
  );
}

const calculateNativeAmount = (tokenAmount: number, tokenOffset: number, totalNativeCollected: number, saleAmount: number) => {
  return FullMath.mulDiv(
      BigInt(tokenAmount) + BigInt(tokenOffset),
      BigInt(totalNativeCollected),
      BigInt(saleAmount)
  );
}


export { 
  timeAgo, 
  formatNumber, 
  formatAddress, 
  copyToClipboard, 
  calculateAmount, 
  calculateNativeAmount 
};