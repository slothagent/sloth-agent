import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import OpenAI from "openai";
import { PromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { ImageService } from '../image/image.service';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';

@Injectable()
export class OmniService {
  private openai: ChatOpenAI;
  private ai: OpenAI;
  private intentPrompt: PromptTemplate;
  private tokenPrompt: PromptTemplate;
  private imagePrompt: PromptTemplate;
  private searchPrompt: PromptTemplate;
  private agentPrompt: PromptTemplate;
  private messageHistory: Map<string, Array<HumanMessage | AIMessage>>;

  constructor(
    private configService: ConfigService,
    private imageService: ImageService
  ) {
    this.openai = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      modelName: 'gpt-4',
    });

    this.ai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.messageHistory = new Map();

    this.intentPrompt = PromptTemplate.fromTemplate(`
      Analyze if the following message is about creating/deploying/minting a new token or cryptocurrency.
      Consider various ways users might express this intent, including natural language requests.

      Message: {message}

      Respond with only "true" or "false".
      Consider it true if the message:
      1. Directly mentions token/coin creation:
         - Creating/deploying/minting/launching a token/coin
         - Making/generating a new token/coin
         - Starting/initiating a token/coin
         - Setting up a token/coin
      
      2. Uses natural language patterns like:
         - "I want a token named/called X"
         - "Can you create a token that..."
         - "Help me with a token..."
         - "I need a token for..."
         - "Make a token with..."

      3. Provides token details without explicit creation words:
         - "Token name X with description Y"
         - "A community token called X"
         - "Token X for my project"

      Examples that should return true:
      - "I want to make a new coin"
      - "Can you help me create a token?"
      - "Token name X with description Y"
      - "Create a token named TokenX with description This is a community token"
      - "I need a token for my community"
      - "Help me launch a new cryptocurrency"

      Examples that should return false:
      - "What's the price of Bitcoin?"
      - "How do I buy tokens?"
      - "Tell me about tokens"
      - "What is a token?"
      - "Show me my tokens"
      - "Token balance"

      Response (true/false):
    `);

    this.tokenPrompt = PromptTemplate.fromTemplate(`
      Create a detailed token deployment plan based on the following information:
      Name: {name}
      Description: {description}
      Chain: {chain}

      Please provide:
      1. Token symbol suggestion
      2. Initial supply recommendation
      3. Key features based on the description
      4. Deployment considerations for {chain} chain
    `);

    this.imagePrompt = PromptTemplate.fromTemplate(`
      Create a professional and modern token logo based on:
      Token Name: {name}
      Token Description: {description}

      The image should be:
      1. Minimalistic and memorable
      2. Suitable for a cryptocurrency token
      3. Incorporating elements from the description: {description}
      4. Using colors that reflect the token's purpose
    `);

    this.searchPrompt = PromptTemplate.fromTemplate(`
      Search for information about: {query}
      
      Please provide:
      1. Relevant and accurate information
      2. Sources if available
      3. Context about the search results
      4. Any additional related information that might be helpful

      Use web search to find the most up-to-date information.
    `);

    this.agentPrompt = PromptTemplate.fromTemplate(`
      You are an advanced AI agent named Omni, designed to assist users with various tasks.
      You have access to multiple capabilities including:
      1. Token creation and management
      2. Real-time information search
      3. Image generation
      4. Natural language understanding
      
      Current conversation context:
      {context}

      User query: {query}

      Please provide a helpful, informative, and engaging response. You can:
      1. Use web search for real-time information
      2. Process token-related requests
      3. Generate images when needed
      4. Maintain context of the conversation
      5. Ask clarifying questions if needed

      Remember to:
      - Be conversational but professional
      - Provide accurate and up-to-date information
      - Maintain conversation context
      - Use appropriate tools when needed
    `);
  }

  async checkIntent(message: string): Promise<boolean> {
    try {
      const formattedPrompt = await this.intentPrompt.format({
        message,
      });
      
      const response = await this.openai.invoke([
        new SystemMessage(formattedPrompt),
        new HumanMessage(message)
      ]);

      const content = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);

      return content.toLowerCase() === 'true';
    } catch (error) {
      console.error('Error checking intent:', error);
      throw error;
    }
  }

  async createToken(data: {
    name: string;
    description: string;
    chain: string;
    userAddress: string;
  }) {
    try {
      // Generate token details using LangChain
      // const formattedPrompt = await this.tokenPrompt.format({
      //   name: data.name,
      //   description: data.description,
      //   chain: data.chain,
      // });
      // const tokenResponse = await this.openai.invoke([
      //   new SystemMessage(formattedPrompt)
      // ]);

      // Generate image using ImageService
      // const imagePrompt = await this.imagePrompt.format({
      //   name: data.name,
      //   description: data.description,
      // });
      // const imageResponse = await this.openai.invoke([
      //   new SystemMessage(imagePrompt)
      // ]);

      // Generate image using ImageService await this.imageService.generateImage(imageResponse.content)
      const imageUrl = '';

      // Here you would add the actual token deployment logic for the specified chain
      // This is a placeholder for the actual deployment code
      const contractAddress = '0x...'; // Result from actual deployment

      return {
        success: true,
        name: data.name,
        description: data.description,
        chain: data.chain,
        contractAddress,
        imageUrl
      };
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  }

  async processTokenCreation(message: string, address: string) {
    // Check if message is about token creation using multiple keywords
    const tokenKeywords = [
      'deploy token',
      'create token',
      'mint token',
      'launch token',
      'generate token',
      'make token',
      'issue token',
      'new token',
      'token creation',
      'token deployment',
    ];

    const messageNormalized = message.toLowerCase();
    const isTokenCreation = tokenKeywords.some(keyword => messageNormalized.includes(keyword));

    // If basic keyword check fails, use AI to check intent
    if (!isTokenCreation) {
      const isTokenCreationIntent = await this.checkIntent(message);
      if (!isTokenCreationIntent) return false;
    }

    // Extract token details from message
    const { name, description, chain } = this.extractTokenDetails(message);

    // If we don't have required fields, return missing fields info
    if (!name || !description) {
      return {
        needsMoreInfo: true,
        missingFields: {
          name: !name,
          description: !description,
        },
      };
    }

    // Create token
    return await this.createToken({
      name,
      description,
      chain,
      userAddress: address,
    });
  }

  private extractTokenDetails(message: string) {
    const nameMatch = message.match(/(?:name|called|named)\s+([^\s,\.]+)/i);
    const descriptionMatch = message.match(/description\s+([^(on|chain|\.)]+)/i) ||
      message.match(/with description\s+([^(on|chain|\.)]+)/i) ||
      message.match(/described as\s+([^(on|chain|\.)]+)/i);
    const chainMatch = message.match(/(?:on|in|at|using|via)\s+(?:chain\s+)?([^\s,\.]+)\s+(?:chain|network)?/i) ||
      message.match(/chain\s+([^\s,\.]+)/i);

    return {
      name: nameMatch?.[1] || '',
      description: descriptionMatch?.[1]?.trim() || '',
      chain: chainMatch?.[1]?.toLowerCase() === 'sonic' ? 'sonic' : 'sonic', // Default to sonic if not specified or invalid
    };
  }

  async search(query: string) {
    try {
      const formattedPrompt = await this.searchPrompt.format({
        query,
      });
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const response = await openai.responses.create({
        model: "gpt-4o",
        tools: [{ type: "web_search_preview" }],
        input: formattedPrompt,
    });

      return {
        success: true,
        query,
        results: response,
      };
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  }

  async chat(userId: string, message: string) {
    try {
      // Get or initialize conversation history
      let history = this.messageHistory.get(userId) || [];
      
      // Add user message to history
      const userMessage = new HumanMessage(message);
      history.push(userMessage);

      // Format prompt with context
      const context = history
        .map(msg => `${msg._getType()}: ${msg.content}`)
        .join('\n');

      const formattedPrompt = await this.agentPrompt.format({
        context,
        query: message,
      });

      // Get AI response
      const response = await this.openai.invoke([
        new SystemMessage(formattedPrompt),
        ...history
      ]);

      // Convert response content to string if it's not already
      const responseContent = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);

      // Add AI response to history
      const aiMessage = new AIMessage({ content: responseContent });
      history.push(aiMessage);

      // Limit history to last 10 messages
      if (history.length > 10) {
        history = history.slice(-10);
      }

      // Update conversation history
      this.messageHistory.set(userId, history);

      return {
        success: true,
        message: responseContent,
        history: history.map(msg => ({
          role: msg._getType(),
          content: msg.content
        }))
      };
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  async clearChat(userId: string) {
    this.messageHistory.delete(userId);
    return {
      success: true,
      message: 'Chat history cleared'
    };
  }
} 