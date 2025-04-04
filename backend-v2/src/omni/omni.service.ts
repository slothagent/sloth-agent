import { Injectable, OnModuleInit } from '@nestjs/common';
import { OpenAI } from "openai";
import { PromptTemplate } from '@langchain/core/prompts';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { ActionService } from '../action/action.service';
import { PriceService } from '../price/price.service';
import Moralis from 'moralis';
import { SuiService } from '../sui/sui.service';
import { Pinecone } from '@pinecone-database/pinecone';
import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { functionTools } from './lib/tools';
import { webSearchTool } from './lib/functions';

interface DocumentMetadata {
  type: string;
  category: string;
  chain?: string;
  timestamp: string;
  source: string;
  confidence?: number;
}

@Injectable()
export class OmniService implements OnModuleInit {
  private openai: OpenAI;
  private agentPrompt: PromptTemplate;
  private messageHistory: Map<string, Array<HumanMessage | AIMessage>>;
  private pinecone: Pinecone;
  private vectorStore: PineconeStore;
  private embeddings: OpenAIEmbeddings;
  private index: any;

  private readonly namespaces = {
    actions: "actions",
    blockchain: "blockchain",
    market: "market",
    user: "user"
  };

  // Add chain mapping
  private readonly chainIdMap = {
    'eth': '0x1',
    'ethereum': '0x1',
    'sepolia': '0xaa36a7',
    'holesky': '0x4268',
    'polygon': '0x89',
    'polygon_amoy': '0x13882',
    'bsc': '0x38',
    'bsc_testnet': '0x61',
    'arbitrum': '0xa4b1',
    'arbitrum_sepolia': '0x66eee',
    'base': '0x2105',
    'base_sepolia': '0x14a34',
    'optimism': '0xa',
    'optimism_sepolia': '0xaa37dc',
    'linea': '0xe708',
    'linea_sepolia': '0xe705',
    'avalanche': '0xa86a',
    'fantom': '0xfa',
    'fantom_testnet': '0xfa2',
    'cronos': '0x19',
    'gnosis': '0x64',
    'gnosis_testnet': '0x27d8'
  };

  private getChainId(chain: string): string {
    const chainLower = chain.toLowerCase();
    const chainId = this.chainIdMap[chainLower];
    if (!chainId) {
      throw new Error(`Unsupported chain: ${chain}`);
    }
    return chainId;
  }


  constructor(
    private actionService: ActionService,
    private priceService: PriceService,
    private suiService: SuiService
  ) {
    // Initialize Moralis
    Moralis.start({
      apiKey: process.env.MORALIS_API_KEY
    });

    this.messageHistory = new Map();

    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async onModuleInit() {
    try {
      // Initialize Pinecone
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
      });

      // Initialize OpenAI embeddings
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "text-embedding-3-small"
      });

      // Initialize Pinecone index with explicit name
      this.index = this.pinecone.Index(process.env.PINECONE_INDEX_NAME || 'default-index');

      // Initialize data for each namespace
      await this.initializeVectorStore();
      
      console.log('OmniService initialized successfully');
    } catch (error) {
      console.error('Error in OmniService onModuleInit:', error);
    }
  }

  private async initializeVectorStore() {
    try {
      // Initialize each namespace with relevant data
      for (const [type, namespace] of Object.entries(this.namespaces)) {
        const initialData = [];
        
        if (type === 'blockchain') {
          initialData.push(
            {
              id: 'eth1',
              values: await this.embeddings.embedQuery("Ethereum is a decentralized blockchain platform that enables smart contracts and DApps."),
              metadata: {
                type: "blockchain",
                category: "knowledge",
                chain: "ethereum",
                timestamp: new Date().toISOString(),
                source: "initialization",
                confidence: 1.0
              }
            },
            {
              id: 'btc1',
              values: await this.embeddings.embedQuery("Bitcoin is the first and most well-known cryptocurrency, created by Satoshi Nakamoto."),
              metadata: {
                type: "blockchain",
                category: "knowledge",
                chain: "bitcoin",
                timestamp: new Date().toISOString(),
                source: "initialization",
                confidence: 1.0
              }
            }
          );
        }

        if (initialData.length > 0) {
          await this.index.namespace(namespace).upsert(initialData);
        }
      }
      console.log('Vector store initialized successfully');
    } catch (error) {
      console.error('Error initializing vector store:', error);
    }
  }

  private async createErrorStream(): Promise<any> {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    return openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are an error message formatter. Present the error message in a clear and helpful way."
        },
        {
          role: "user",
          content: '❌ Agent is currently experiencing issues. Please try again later.'
        }
      ],
      stream: true
    });
  }

  private async performWebSearch(query: string): Promise<any> {
    try {
      const url = new URL('https://api.search.brave.com/res/v1/web/search');
      url.searchParams.append('q', query);
      url.searchParams.append('count', '5');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': process.env.BRAVE_API_KEY
        }
      });

      if (!response.ok) {
        throw new Error('❌ Agent is currently experiencing issues. Please try again later.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Web search error:', error);
      throw new Error('❌ Agent is currently experiencing issues. Please try again later.');
    }
  }

  fetchOptions() {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': process.env.MORALIS_API_KEY
      },
    }
    return options;
  }

  async execute(parsedAction: any) {
    try {
      const functionName = parsedAction.function;
      // console.log(parsedAction);

      // Add Sui cases
      if (functionName.startsWith('sui_')) {
        try {
          switch (functionName) {
            case 'sui_getAllBalances':
              const balances = await this.suiService.getAllBalances(parsedAction.wallet);
              const balancesWithMetadata = await Promise.all(
                balances.slice(0, 10).map(async (balance) => {
                  const metadata = await this.suiService.getCoinMetadata(balance.coinType);
                  console.log(metadata);
                  return {
                    coinType: balance.coinType,
                    totalBalance: balance.totalBalance,
                    metadata: metadata
                  };
                })
              );
              
              // console.log(balancesWithMetadata);

              return {
                success: true,
                result: balancesWithMetadata,
                totalToken: balances.length,
                url: `https://suiscan.xyz/mainnet/account/${parsedAction.wallet}/portfolio`
              };

            case 'sui_getAllCoins':
              const coins = await this.suiService.getAllCoins(
                parsedAction.wallet, 
                parsedAction.cursor, 
                parsedAction.limit
              );
              return {
                success: true,
                result: coins
              };

            case 'sui_getBalance':
              const balance = await this.suiService.getBalance(
                parsedAction.wallet,
                parsedAction.coinType
              );
              return {
                success: true,
                result: balance,
                url: `https://suiscan.xyz/mainnet/account/${parsedAction.wallet}/portfolio`
              };

            case 'sui_getCoinMetadata':
              const metadata = await this.suiService.getCoinMetadata(parsedAction.coinType);
              return {
                success: true,
                result: metadata
              };

            case 'sui_getCoins':
              const specificCoins = await this.suiService.getCoins(
                parsedAction.wallet,
                parsedAction.coinType,
                parsedAction.cursor,
                parsedAction.limit
              );
              return {
                success: true,
                result: specificCoins
              };

            case 'sui_getTotalSupply':
              const supply = await this.suiService.getTotalSupply(parsedAction.coinType);
              return {
                success: true,
                result: supply
              };

            case 'sui_getStakes':
              const stakes = await this.suiService.getStakes(parsedAction.wallet);
              return {
                success: true,
                result: stakes
              };

            case 'sui_getValidatorsApy':
              const apy = await this.suiService.getValidatorsApy();
              return {
                success: true,
                result: apy
              };

            case 'sui_getCoinsWithPagination':
              const paginatedCoins = await this.suiService.getCoinsWithPagination(
                parsedAction.wallet,
                parsedAction.page,
                parsedAction.size
              );
              return {
                success: true,
                result: paginatedCoins
              };

            case 'sui_getCoinBalance':
              const coinBalance = await this.suiService.getCoinBalance(
                parsedAction.wallet,
                parsedAction.coinType
              );
              return {
                success: true,
                result: coinBalance
              };
          }
        } catch (error) {
          console.error('Error executing Sui action:', error);
          return {
            success: false,
            error: error.message || 'Failed to execute Sui action'
          };
        }
      }

      // Add web search case
      if (functionName === 'webSearch') {
        try {
          const searchResults = await this.performWebSearch(parsedAction.query);
          return {
            success: true,
            result: searchResults
          };
        } catch (error) {
          return {
            success: false,
            error: new Error('❌ Agent is currently experiencing issues. Please try again later.')
          };
        }
      }

      // Execute the appropriate Moralis API call based on the action
      let selectedChain: string;
      try {
        selectedChain = this.getChainId(parsedAction.chain);
      } catch (error) {
        return {
          success: false,
          error: new Error('❌ Agent is currently experiencing issues. Please try again later.')
        };
      }

      switch (functionName) {
        case 'getTokenPrice':
          const response = await this.priceService.getTokenPrice(parsedAction.token);
          if (!response.success) {
            return {
              success: false,
              error: new Error(response.message || 'Failed to get token price')
            };
          }
          return response;
        
        case 'getWalletTokenBalancesPrices':
          try {
            const res = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
              "chain": selectedChain,
              "address": parsedAction.wallet
            });
            return {
              success: true,
              result: res.result
            };
          } catch (error) {
            return {
              success: false,
              error: error
            };
          }

        case 'getSolTokenPrice':
          return {
            success: false,
            error: new Error('Solana token price feature not implemented')
          };
        
        case 'getDefiPositionsSummary':
          try {
            const resDefi = await Moralis.EvmApi.wallets.getDefiPositionsSummary({
              "chain": selectedChain,
              "address": parsedAction.wallet
            });
            return {
              success: true,
              result: resDefi.result
            };
          } catch (error) {
            return {
              success: false,
              error: error
            };
          }

        // Wallet Analysis Functions
        case 'getWalletNFTs':
          try {
            const resNFTs = await Moralis.EvmApi.nft.getWalletNFTs({
              "chain": selectedChain,
              "address": parsedAction.wallet
            });
            return {
              success: true,
              result: resNFTs.result
            };
          } catch (error) {
            return {
              success: false,
              error: error
            };
          }

        case 'getWalletNetWorth':
          try {
            const resNetWorth = await Moralis.EvmApi.wallets.getWalletNetWorth({
              "excludeSpam": true,
              "excludeUnverifiedContracts": true,
              "maxTokenInactivity": 1,
              "address": parsedAction.wallet
            });
            return {
              success: true,
              result: resNetWorth.result
            };
          } catch (error) {
            return {
              success: false,
              error: error
            };
          }

        case 'getWalletProfitabilitySummary':
          const resProfitability = await Moralis.EvmApi.wallets.getWalletProfitabilitySummary({
            "chain": selectedChain,
            "address": parsedAction.wallet
          });
          return resProfitability.result;

        // Token Analysis Functions
        case 'getTokenHolderStats':
          const resHolderStats = await fetch(`https://deep-index.moralis.io/api/v2.2/erc20/${parsedAction.tokenAddress}/holders?chain=${selectedChain}`, this.fetchOptions());
          return{
            success: true,
            result: resHolderStats.json()
          };

        case 'getTrendingTokens':
          try {
            const resTrending = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`);
            const data = await resTrending.json();
            if (!data) {
              throw new Error('❌ Agent is currently experiencing issues. Please try again later.');
            }
            return {
              success: true,
              result: data.slice(0,10)
            };
          } catch (error) {
            return {
              success: false,
              error: new Error('❌ Agent is currently experiencing issues. Please try again later.')
            };
          }

        case 'getTopProfitableWalletPerToken':
          const resTopTraders = await Moralis.EvmApi.token.getTopProfitableWalletPerToken({
            "chain": selectedChain,
            "address": parsedAction.tokenAddress
          });
          return resTopTraders.result;

        case 'getTopGainersTokens':
          try {
            const resGainers = await fetch(`https://api.coinpaprika.com/v1/tickers`);
            const data = await resGainers.json();
            console.log(data);
            if (!data) {
              throw new Error('❌ Agent is currently experiencing issues. Please try again later.');
            }
            
            return {
              success: true,
              result: data.slice(0,10)
            };
          } catch (error) {
            return {
              success: false,
              error: new Error('❌ Agent is currently experiencing issues. Please try again later.')
            };
          }

        case 'getTokenAnalytics':
          const resAnalytics = await fetch(`https://deep-index.moralis.io/api/v2.2/tokens/${parsedAction.tokenAddress}/analytics?chain=${selectedChain}`, this.fetchOptions());
          return resAnalytics.json();

        case 'getTokenStats':
          const resStats = await Moralis.EvmApi.token.getTokenStats({
            "chain": selectedChain,
            "address": parsedAction.tokenAddress
          });
          return resStats.result;

        default:
          return {
            success: false,
            error: new Error(`Unsupported function: ${functionName}`)
          };
      }

    } catch (error) {
      console.error('Error executing action:', error);
      const errorStream = await this.createErrorStream();
      return {
        success: false,
        stream: true,
        streamResponse: errorStream
      };
    }
  }

  private readonly actionSteps = {
    'getTrendingTokens': 'Getting trending tokens',
    'getTokenPrice': 'Fetching token price',
    'getWalletTokenBalancesPrices': 'Getting wallet token balances',
    'getWalletNFTs': 'Fetching wallet NFTs',
    'getWalletNetWorth': 'Calculating wallet net worth',
    'getDefiPositionsSummary': 'Analyzing DeFi positions',
    'getTokenHolderStats': 'Getting token holder statistics',
    'getTopGainersTokens': 'Finding top gaining tokens',
    'getTokenAnalytics': 'Analyzing token metrics',
    'getTokenStats': 'Getting token statistics',
    'getTopERC20TokensByMarketCap': 'Getting top tokens by market cap',
    'searchTokens': 'Searching for tokens'
  };

  private readonly commonQuestionSteps = {
    greetings: {
      patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      steps: ['Initializing conversation', 'Preparing personalized greeting']
    },
    help: {
      patterns: ['help', 'what can you do', 'how can you help', 'capabilities', 'features'],
      steps: ['Analyzing available features', 'Preparing capability summary', 'Generating help information']
    },
    crypto_info: {
      patterns: ['what is crypto', 'explain cryptocurrency', 'how does blockchain work', 'what is bitcoin'],
      steps: ['Gathering educational resources', 'Preparing simplified explanation', 'Compiling relevant examples']
    },
    market_overview: {
      patterns: ['how is the market', 'market overview', 'crypto market status', 'market condition'],
      steps: ['Analyzing market data', 'Gathering trend information', 'Preparing market summary']
    },
    investment_advice: {
      patterns: ['should i invest', 'investment strategy', 'portfolio advice', 'how to invest'],
      steps: ['Analyzing query context', 'Preparing educational information', 'Gathering general guidelines']
    },
    security: {
      patterns: ['how to secure', 'wallet security', 'protect crypto', 'security tips'],
      steps: ['Analyzing security context', 'Gathering best practices', 'Preparing security recommendations']
    }
  };

  private identifyCommonQuestion(message: string): { type: string; steps: string[] } | null {
    const normalizedMessage = message.toLowerCase();
    
    for (const [type, data] of Object.entries(this.commonQuestionSteps)) {
      if (data.patterns.some(pattern => normalizedMessage.includes(pattern))) {
        return { type, steps: data.steps };
      }
    }
    
    // Default steps for unrecognized questions
    return {
      type: 'general',
      steps: [
        'Understanding your question',
        'Analyzing available information',
        'Preparing comprehensive response'
      ]
    };
  }

  async checkAction(message: string) {
    try {
      // Use actionService to parse the action
      const parsedAction = await this.actionService.parseUserInput(message);

      if (parsedAction && parsedAction.function) {
        const step = this.actionSteps[parsedAction.function] || 'Searching for information';
        return {
          success: true,
          step: step
        };
      }

      // Handle common questions if no specific action is found
      const commonQuestion = this.identifyCommonQuestion(message);
      return {
        success: true,
        step: commonQuestion.steps[0]
      };

    } catch (error) {
      console.error('Error checking action:', error);
      return {
        success: false,
        message: 'Error checking action',
        error: error
      };
    }
  }

  // Add method to update vector store with new information
  async updateVectorStore(text: string, metadata: Partial<DocumentMetadata>) {
    try {
      const store = new PineconeStore(this.embeddings, {
        pineconeIndex: this.vectorStore.pineconeIndex,
        namespace: this.namespaces[metadata.type],
        textKey: 'text',
      });

      const document = new Document({
        pageContent: text,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          source: metadata.source || 'user_interaction'
        } as DocumentMetadata
      });

      await store.addDocuments([document]);
      return true;
    } catch (error) {
      console.error('Error updating vector store:', error);
      return false;
    }
  }

  async resolveAction(message: string) {
    try {
        const input = [
            {
                role: "user",
                content: message
            }
        ];

        const response = await this.openai.responses.create({
            model: "gpt-4",
            // @ts-ignore
            input,
            tools: functionTools,
            stream: true,
            store: true,
        });

        const [stream1, stream2] = response.tee();

        // Check for simple message responses first
        for await (const event of stream1) {
            if (event.type === 'response.output_item.added') {
                if (event.item.type === 'message') {
                    return {
                        success: true,
                        stream: true,
                        streamResponse: stream2
                    }
                }
                break; // Exit loop if it's not a message type
            }
        }

        // Process tool calls if not a simple message
        const finalToolCalls = {};
        let hasToolCall = false;

        for await (const event of stream2) {
            if (event.type === 'response.output_item.added') {
                finalToolCalls[event.output_index] = event.item;
            } else if (event.type === 'response.function_call_arguments.delta') {
                const index = event.output_index;
                hasToolCall = true;

                if (finalToolCalls[index]) {
                    finalToolCalls[index].arguments += event.delta;
                }
            }
        }

        // If no valid tool calls found, create new stream for response
        if (!hasToolCall || !finalToolCalls[0]?.arguments) {
            const newResponse = await this.openai.responses.create({
                model: "gpt-4",
                // @ts-ignore
                input,
                tools: functionTools,
                stream: true,
                store: true,
            });
            return {
                success: true,
                stream: true,
                streamResponse: newResponse
            };
        }

        const toolCall = finalToolCalls[0] as ToolCall;
        const nameFunction = toolCall.name;
        const args = JSON.parse(toolCall.arguments || '{}');

        if (nameFunction === "web_search") {
            const webSearchResult = await webSearchTool(args.query);
            // @ts-ignore
            input.push(toolCall);
            input.push({
                // @ts-ignore
                type: "function_call_output",
                call_id: toolCall.call_id,
                output: webSearchResult.toString()
            });

            const response2 = await this.openai.responses.create({
                model: "gpt-4",
                // @ts-ignore 
                input,
                tools: functionTools,
                stream: true,
                store: true,
            });

            return {
                success: true,
                stream: true,
                streamResponse: response2
            }
        }

        // Create new stream for final response
        const finalResponse = await this.openai.responses.create({
            model: "gpt-4",
            // @ts-ignore
            input,
            tools: functionTools,
            stream: true,
            store: true,
        });

        return {
            success: true,
            stream: true,
            streamResponse: finalResponse
        };

    } catch (error) {
        console.error('Error executing action:', error);
        const errorStream = await this.createErrorStream();
        return {
            success: false,
            stream: true,
            streamResponse: errorStream
        };
    }
  }
} 

interface ToolCall {
  arguments: string;
  call_id: string;
  name: string;
  type: string;
}
