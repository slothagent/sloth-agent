import { Injectable, OnModuleInit } from '@nestjs/common';
import { OpenAI } from "openai";
import { PriceService } from '../price/price.service';
import Moralis from 'moralis';
import { SuiService } from '../sui/sui.service';
import { Pinecone } from '@pinecone-database/pinecone';
import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai'; // @ts-ignore
import { PineconeStore } from '@langchain/pinecone';
import { functionTools } from './lib/tools';
import { getTokenAnalytics, getTopGainersTokens, getTokenHolderStats, getTrendingTokens, getWalletNFTs, getWalletNetWorth, getWalletProfitabilitySummary, getWalletTokenBalancesPrices, webSearchTool,suiGetAllBalances, suiGetAllCoins, suiGetCoinMetadata, suiGetBalance, suiGetCoins, suiGetStakes, suiGetTotalSupply, suiGetValidatorsApy, suiGetCoinsWithPagination, suiGetCoinBalance } from './lib/functions';

interface DocumentMetadata {
  type: string;
  category: string;
  chain?: string;
  timestamp: string;
  source: string;
  confidence?: number;
}

interface ToolCall {
  arguments: string;
  call_id: string;
  name: string;
  type: string;
}

@Injectable()
export class OmniService implements OnModuleInit {
  private openai: OpenAI;
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
    private suiService: SuiService
  ) {
    // Initialize Moralis
    Moralis.start({
      apiKey: process.env.MORALIS_API_KEY
    });
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

  private readonly actionSteps = {
    'getTrendingTokens': 'Getting trending tokens',
    'getTokenPrice': 'Fetching token price',
    'getWalletTokenBalancesPrices': 'Getting wallet token balances',
    'getWalletNFTs': 'Fetching wallet NFTs',
    'getWalletNetWorth': 'Calculating wallet net worth',
    'getWalletProfitabilitySummary': 'Analyzing DeFi positions',
    'getTokenHolderStats': 'Getting token holder statistics',
    'getTopGainersTokens': 'Finding top gaining tokens',
    'getTokenAnalytics': 'Analyzing token metrics',
    'getTokenStats': 'Getting token statistics',
    'getTopERC20TokensByMarketCap': 'Getting top tokens by market cap',
    'searchTokens': 'Searching for tokens',
    'suiGetAllBalances': 'Getting all Sui token balances',
    'suiGetAllCoins': 'Fetching all Sui coins',
    'suiGetBalance': 'Getting Sui coin balance',
    'suiGetCoinMetadata': 'Fetching Sui coin metadata',
    'suiGetCoins': 'Getting specific Sui coins',
    'suiGetTotalSupply': 'Checking Sui coin total supply',
    'suiGetStakes': 'Fetching Sui staking information',
    'suiGetValidatorsApy': 'Getting Sui validators APY',
    'suiGetCoinsWithPagination': 'Fetching Sui coins with pagination',
    'suiGetCoinBalance': 'Checking Sui coin balance',
    'web_search': 'Searching the web'
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
      patterns: ['what is crypto', 'explain cryptocurrency', 'how does blockchain work', 'what is bitcoin', 'what is sui', 'explain sui blockchain'],
      steps: ['Gathering educational resources', 'Preparing simplified explanation', 'Compiling relevant examples']
    },
    market_overview: {
      patterns: ['how is the market', 'market overview', 'crypto market status', 'market condition', 'sui market', 'sui price'],
      steps: ['Analyzing market data', 'Gathering trend information', 'Preparing market summary']
    },
    investment_advice: {
      patterns: ['should i invest', 'investment strategy', 'portfolio advice', 'how to invest', 'sui staking', 'stake sui'],
      steps: ['Analyzing query context', 'Preparing educational information', 'Gathering general guidelines']
    },
    security: {
      patterns: ['how to secure', 'wallet security', 'protect crypto', 'security tips', 'secure sui wallet'],
      steps: ['Analyzing security context', 'Gathering best practices', 'Preparing security recommendations']
    },
    sui_wallet: {
      patterns: ['sui wallet', 'check sui balance', 'sui coins', 'sui tokens', 'sui nft'],
      steps: ['Connecting to Sui network', 'Fetching wallet information', 'Preparing balance summary']
    },
    sui_staking: {
      patterns: ['sui validator', 'sui apy', 'sui staking rewards', 'stake rewards', 'validator apy'],
      steps: ['Fetching validator data', 'Calculating staking rewards', 'Preparing staking information']
    },
    sui_transactions: {
      patterns: ['sui transaction', 'transfer sui', 'send sui', 'sui gas', 'sui fees'],
      steps: ['Analyzing transaction requirements', 'Calculating gas fees', 'Preparing transaction guidance']
    },
    sui_defi: {
      patterns: ['sui defi', 'sui swap', 'sui liquidity', 'sui yield', 'sui farming'],
      steps: ['Gathering DeFi protocols', 'Analyzing yield opportunities', 'Preparing DeFi recommendations']
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
          store: true
      });

      const toolCall = response.output[0] as ToolCall;
      const nameFunction = toolCall.name;

      if (nameFunction && nameFunction) {
        const step = this.actionSteps[nameFunction] || 'Searching for information';
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

        // Process tool calls if not a simple message
        const finalToolCalls = {};

        // Check for simple message responses first
        for await (const event of stream1) {
            if (event.type === 'response.output_item.added') {
                if (event.item.type === 'message') {
                    return {
                        success: true,
                        stream: true,
                        streamResponse: stream2
                    }
                }else{
                  finalToolCalls[event.output_index] = event.item;
                }
            }
            else if (event.type === 'response.function_call_arguments.delta') {
              const index = event.output_index;
              if (finalToolCalls[index]) {
                  finalToolCalls[index].arguments += event.delta;
              }
          }
        }

        const toolCall = finalToolCalls[0] as ToolCall;
        console.log("toolCall", toolCall);
        const nameFunction = toolCall.name;
        const args = JSON.parse(toolCall.arguments || '{}');

        let responseFunction;

        switch (nameFunction) {
          case "web_search":
            responseFunction = await webSearchTool(args.query);
            break;
          case "getTrendingTokens":
            responseFunction = await getTrendingTokens();
            break;
          case "getWalletTokenBalancesPrices":
            responseFunction = await getWalletTokenBalancesPrices(args.chain, args.wallet);
            break;
          case "getWalletNFTs":
            responseFunction = await getWalletNFTs(args.chain, args.wallet);
            break;
          case "getWalletNetWorth":
            responseFunction = await getWalletNetWorth(args.wallet);
            break;
          case "getWalletProfitabilitySummary":
            responseFunction = await getWalletProfitabilitySummary(args.chain, args.wallet);
            break;
          case "getTokenHolderStats":
            responseFunction = await getTokenHolderStats(args.chain, args.tokenAddress);
            break;
          case "getTopGainersTokens":
            responseFunction = await getTopGainersTokens();
            break;
          case "getTokenAnalytics":
            responseFunction = await getTokenAnalytics(args.chain, args.tokenAddress);
            break;
          case "suiGetAllBalances":
            responseFunction = await suiGetAllBalances(this.suiService, args.wallet);
            break;
          case "suiGetAllCoins":
            responseFunction = await suiGetAllCoins(this.suiService, args.wallet);
            break;
          case "suiGetCoinMetadata":
            responseFunction = await suiGetCoinMetadata(this.suiService, args.coinType);
            break;
          case "suiGetBalance":
            responseFunction = await suiGetBalance(this.suiService, args.wallet, args.coinType);
            break;
          case "suiGetCoins":
            responseFunction = await suiGetCoins(this.suiService, args.wallet, args.coinType);
            break;
          case "suiGetTotalSupply":
            responseFunction = await suiGetTotalSupply(this.suiService, args.coinType);
            break;
          case "suiGetStakes":
            responseFunction = await suiGetStakes(this.suiService, args.wallet);
            break;
          case "suiGetValidatorsApy":
            responseFunction = await suiGetValidatorsApy(this.suiService);
            break;
          case "suiGetCoinsWithPagination":
            responseFunction = await suiGetCoinsWithPagination(this.suiService, args.wallet, args.page, args.size);
            break;
          case "suiGetCoinBalance":
            responseFunction = await suiGetCoinBalance(this.suiService, args.wallet, args.coinType);
            break;
          case "suiGetCoinMetadata":
            responseFunction = await suiGetCoinMetadata(this.suiService, args.coinType);
            break;
        }

        console.log(responseFunction);
        if(responseFunction === undefined){
          responseFunction = "❌ Agent is currently experiencing issues. Please try again later.";
        }
        // @ts-ignore
        input.push(toolCall);
        input.push({
            // @ts-ignore
            type: "function_call_output",
            call_id: toolCall.call_id,
            output: JSON.stringify(responseFunction)
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
