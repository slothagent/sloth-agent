import { useQuery } from '@tanstack/react-query';

type Item = {
  id: string;
  image_url: string;
  is_unique: null;
  metadata: any;
  token: {
    address: string;
  };
};

export const useMyNFT = (address?: string) => {

  return useQuery({
    queryKey: ['my-nft', address],
    queryFn: async () => {
      const res = await fetch(`https://scanv2-testnet.ancient8.gg/api/v2/addresses/${address}/nft?type=ERC-721`);
      return (await res.json()).items as Item[];
    },
    initialData: [],
    enabled: !!address,
  });
};