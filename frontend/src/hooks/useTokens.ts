import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Token } from '../models/token';

export interface TokenResponse {
  data: Token[];
  metadata: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
}

interface UseTokensOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const useTokens = (options: UseTokensOptions = {}) => {
  const { page = 1, pageSize = 10, search = '' } = options;
  const queryClient = useQueryClient();
  
  return useQuery<TokenResponse>({
    queryKey: ['tokens', page, pageSize, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
      });
      
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/token?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }
      return response.json();
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tokenData: Partial<Token>) => {
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create token');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });
};

export const useUpdateToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Token> }) => {
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/token/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update token');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });
};

export const useDeleteToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/token/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete token');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });
}; 