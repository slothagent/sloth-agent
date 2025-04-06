import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { LRUCache } from 'lru-cache';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { BASE_PROMPT } from './prompts/base.prompt';

@Injectable()
export class ActionService implements OnModuleInit {
  private model: ChatOpenAI;
  private promptTemplate: PromptTemplate;
  private outputParser: JsonOutputParser;
  private cache: LRUCache<string, any>;
  private pinecone: Pinecone;
  private index: any;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    try {
      // Initialize the OpenAI model with API key
      this.model = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0,
        maxTokens: 150,
        cache: true,
      });

      // Initialize cache with 1 hour TTL
      this.cache = new LRUCache({
        max: 500,
        ttl: 1000 * 60 * 60,
      });

      // Create prompt template with BASE_PROMPT
      this.promptTemplate = PromptTemplate.fromTemplate(
        `Given the input: "{input}" and the following relevant context: {context}, identify the blockchain context and extract the appropriate API function name and parameters.

        {base_prompt}
        
        Remember:
        1. For general information or research queries about blockchain projects, companies, or market trends, use "webSearch"
        2. For specific blockchain operations (balances, transfers, etc), use the appropriate chain-specific functions
        3. Always validate addresses and coin types before selecting functions
        `
      );

      // Initialize JSON output parser with strict validation
      this.outputParser = new JsonOutputParser();

      // Initialize Pinecone
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
      });

      // Initialize embeddings
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "text-embedding-3-small"
      });

    } catch (error) {
      console.error('Error initializing ActionService:', error);
      throw error;
    }
  }

  async onModuleInit() {
    try {
      // Initialize Pinecone index
      this.index = this.pinecone.Index(process.env.PINECONE_INDEX_NAME || 'default-index');

      // Initialize action-specific data
      await this.initializeActionVectorStore();
      
      console.log('ActionService initialized successfully');
    } catch (error) {
      console.error('Error in ActionService onModuleInit:', error);
    }
  }

  private async initializeActionVectorStore() {
    const actionData = [
      // Web Search Actions
      {
        id: 'web_search',
        values: await this.embeddings.embedQuery("General information, research, and news about blockchain projects and companies"),
        metadata: { function: "webSearch", type: "information" }
      },
      // EVM Actions
      {
        id: 'evm_balance',
        values: await this.embeddings.embedQuery("Get wallet token balances and prices for EVM chains"),
        metadata: { function: "getWalletTokenBalancesPrices", type: "wallet_analysis", chain: "evm" }
      },
      // Sui Actions
      {
        id: 'sui_all_balances',
        values: await this.embeddings.embedQuery("Get all token balances for Sui wallet"),
        metadata: { function: "sui_getAllBalances", type: "wallet_analysis", chain: "sui" }
      },
      {
        id: 'sui_specific_balance',
        values: await this.embeddings.embedQuery("Get specific token balance for Sui wallet"),
        metadata: { function: "sui_getBalance", type: "wallet_analysis", chain: "sui" }
      }
    ];

    try {
      await this.index.namespace('actions').upsert(actionData);
      console.log('Action vector store initialized');
    } catch (error) {
      console.error('Error initializing action vector store:', error);
    }
  }

  private async searchSimilarActions(query: string): Promise<any[]> {
    try {
      const queryEmbedding = await this.embeddings.embedQuery(query);
      const results = await this.index.namespace('actions').query({
        topK: 3,
        vector: queryEmbedding,
        includeMetadata: true
      });
      return results.matches || [];
    } catch (error) {
      console.error('Error searching similar actions:', error);
      return [];
    }
  }

  async parseUserInput(userInput: string) {
    try {
      // Check if it's a conversational query
      const conversationalPatterns = [
        /^hi+\s*$/i,
        /^hello+\s*$/i,
        /^hey+\s*$/i,
        /^how are you/i,
        /^can you help/i,
        /^what can you do/i,
        /^help me/i,
        /^who are you/i,
        /^what are you/i,
        /^tell me about yourself/i
      ];

      // If input matches any conversational pattern, return null
      if (conversationalPatterns.some(pattern => pattern.test(userInput.trim()))) {
        return null;
      }

      // Check cache first
      const cacheKey = userInput.toLowerCase().trim();
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Get relevant context from vector store
      const similarActions = await this.searchSimilarActions(userInput);
      const context = similarActions.map(doc => doc.metadata.function).join('\n');

      // Create the chain with context
      const chain = this.promptTemplate
        .pipe(this.model)
        .pipe(this.outputParser);

      // Run the chain with context and base prompt
      const result = await chain.invoke({
        input: userInput,
        context: context,
        base_prompt: BASE_PROMPT
      });

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error parsing user input:', error);
      return { error: 'Failed to process input' };
    }
  }
} 