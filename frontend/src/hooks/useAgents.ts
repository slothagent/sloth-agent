import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Agent } from '../models/agent';

export interface AgentResponse {
  data: Agent[];
  metadata: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
}

interface UseAgentsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  owner?: string;
}

export const useAgents = (options: UseAgentsOptions = {}) => {
  const { page = 1, pageSize = 10, search = '', owner = '' } = options;
  const queryClient = useQueryClient();
  
  return useQuery<AgentResponse>({
    queryKey: ['agents', page, pageSize, search, owner],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(owner && { owner }),
      });
      
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/agent?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      return response.json();
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (agentData: Partial<Agent>) => {
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create agent');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Agent> }) => {
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/agent/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update agent');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/agent/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}; 