import { prisma } from '@/lib/prisma';
import { Agent } from '@/types/agent';

// Function to fetch all agents
export async function getAllAgents(): Promise<Agent[]> {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return agents;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
}

// Function to fetch a single agent by ID
export async function getAgentById(id: string): Promise<Agent | null> {
  try {
    const agent = await prisma.agent.findUnique({
      where: {
        id: id
      }
    });
    return agent;
  } catch (error) {
    console.error('Error fetching agent:', error);
    throw error;
  }
}

// Function to fetch a single agent by symbol
export async function getAgentBySymbol(symbol: string): Promise<Agent | null> {
  try {
    const agent = await prisma.agent.findFirst({
      where: {
        ticker: symbol
      },
      include: {
        twitterAuth: true
      }
    });
    return agent;
  } catch (error) {
    console.error('Error fetching agent by symbol:', error);
    throw error;
  }
}

// Function to fetch agents with pagination
export async function getPaginatedAgents(
  page: number = 1,
  pageSize: number = 10
): Promise<{ agents: Agent[]; total: number }> {
  try {
    const skip = (page - 1) * pageSize;
    
    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.agent.count()
    ]);

    return {
      agents,
      total
    };
  } catch (error) {
    console.error('Error fetching paginated agents:', error);
    throw error;
  }
}

// Function to search agents by name or ticker
export async function searchAgents(searchTerm: string): Promise<Agent[]> {
  try {
    const agents = await prisma.agent.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            ticker: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return agents;
  } catch (error) {
    console.error('Error searching agents:', error);
    throw error;
  }
}
