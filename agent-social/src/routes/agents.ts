import { Router, RequestHandler } from 'express';
import { Character, elizaLogger, Clients, ModelProviderName, AgentRuntime } from '@elizaos/core';
import { DirectClient } from '@elizaos/client-direct';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { settings } from '@elizaos/core';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHARACTERS_DIR = path.join(__dirname, '../../characters');

interface AgentConfig {
  name: string;
  clients: Clients[];
  modelProvider: ModelProviderName;
  platforms?: string[];
  settings?: {
    secrets?: Record<string, string>;
    platforms?: string[];
    platformCredentials?: {
      twitter?: {
        username: string;
        password: string;
        email: string;
        cookies?: string;
        dryRun?: boolean;
      };
      telegram?: {
        botToken: string;
      };
    };
  };
}

interface PlatformConfig {
  enabled: boolean;
  requiredCredentials: string[];
}

// Platform configuration mapping
const platformConfigs: Record<string, PlatformConfig> = {
  twitter: {
    enabled: true,
    requiredCredentials: ['username', 'password', 'email']
  },
  telegram: {
    enabled: true,
    requiredCredentials: ['botToken']
  }
  // Add more platforms as needed
};

interface AgentProcess {
  agentId: string;
  process: any;
  character: Character;
  credentials: Record<string, string>;
}

const router: Router = Router();
const runningAgents = new Map<string, AgentProcess>();

// Get all running agents
const getAgents: RequestHandler = (req, res) => {
  const agents = Array.from(runningAgents.values()).map(agentData => ({
    id: agentData.agentId,
    name: agentData.character.name,
    clients: agentData.character.clients,
    modelProvider: agentData.character.modelProvider,
    platforms: Object.keys(agentData.credentials)
      .map(key => key.split('_')[0].toLowerCase())
      .filter((value, index, self) => self.indexOf(value) === index)
  }));
  
  res.json(agents);
};

// Start a new agent
const startNewAgent: RequestHandler<{}, {}, AgentConfig> = async (req, res) => {
  const { name, clients, modelProvider, platforms = [], settings: userSettings } = req.body;

  if (!name || !clients || !modelProvider) {
    res.status(400).json({
      error: 'Missing required fields: name, clients, and modelProvider are required'
    });
    return;
  }

  try {
    // Collect all credentials for the agent
    const agentCredentials: Record<string, string> = {
      // Core settings
      OPENAI_API_KEY: userSettings?.secrets?.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '',
      // Generate unique port for each agent starting from base port
      SERVER_PORT: (parseInt(process.env.BASE_PORT || '5000') + runningAgents.size).toString(),
      
      // Image generation settings
      IMAGE_GEN: userSettings?.imageSettings?.IMAGE_GEN || process.env.IMAGE_GEN || 'false',
      
      // Post interval settings
      POST_INTERVAL_MIN: userSettings?.postInterval?.POST_INTERVAL_MIN || process.env.POST_INTERVAL_MIN || '90',
      POST_INTERVAL_MAX: userSettings?.postInterval?.POST_INTERVAL_MAX || process.env.POST_INTERVAL_MAX || '180',
      
      // Add workspace ID
      WORKSPACE_ID: `workspace-${name.toLowerCase()}-${Date.now()}`
    };
    
    platforms.forEach(platform => {
      const platformCreds = userSettings?.platformCredentials?.[platform.toLowerCase()];
      if (platformCreds) {
        switch (platform.toLowerCase()) {
          case 'twitter':
            // Set the base Twitter credentials that ElizaOS expects
            agentCredentials['TWITTER_USERNAME'] = platformCreds.username;
            agentCredentials['TWITTER_PASSWORD'] = platformCreds.password;
            agentCredentials['TWITTER_EMAIL'] = platformCreds.email;
            if (platformCreds.cookies) {
              agentCredentials['TWITTER_COOKIES'] = platformCreds.cookies;
            }
            if (platformCreds.dryRun !== undefined) {
              agentCredentials['TWITTER_DRY_RUN'] = platformCreds.dryRun.toString();
            }
            
            // Also store workspaced credentials for future use if needed
            const workspacePrefix = `TWITTER_${agentCredentials.WORKSPACE_ID}`;
            agentCredentials[`${workspacePrefix}_USERNAME`] = platformCreds.username;
            agentCredentials[`${workspacePrefix}_PASSWORD`] = platformCreds.password;
            agentCredentials[`${workspacePrefix}_EMAIL`] = platformCreds.email;
            break;
          case 'telegram':
            agentCredentials['TELEGRAM_BOT_TOKEN'] = platformCreds.botToken;
            break;
        }
      }
    });

    // Load social agent character template
    const socialAgentPath = path.join(CHARACTERS_DIR, 'template.character.json');
    const socialAgentContent = await fs.readFile(socialAgentPath, 'utf-8');
    const socialAgentTemplate = JSON.parse(socialAgentContent);

    // Filter and validate requested platforms
    const enabledPlatforms = platforms.filter(platform => {
      const config = platformConfigs[platform.toLowerCase()];
      if (!config) {
        elizaLogger.warn(`Unsupported platform: ${platform}`);
        return false;
      }

      // Check if all required credentials are provided
      const platformCreds = userSettings?.platformCredentials?.[platform.toLowerCase()];
      if (!platformCreds) {
        elizaLogger.warn(`Missing credentials for platform: ${platform}`);
        return false;
      }

      const missingCreds = config.requiredCredentials.filter(
        cred => !platformCreds[cred]
      );

      if (missingCreds.length > 0) {
        elizaLogger.warn(`Missing required credentials for ${platform}: ${missingCreds.join(', ')}`);
        return false;
      }

      return true;
    });

    if (enabledPlatforms.length === 0) {
      elizaLogger.warn('No valid platforms configured');
    }

    // Create character by merging user input with social agent template
    //character.settings?.secrets?.OPENAI_API_KE
    const character: Partial<Character> = {
      name,
      plugins: [],
      clients,
      modelProvider,
      system: socialAgentTemplate.system,
      bio: socialAgentTemplate.bio || [],
      lore: socialAgentTemplate.lore || [],
      messageExamples: socialAgentTemplate.messageExamples || [],
      postExamples: socialAgentTemplate.postExamples || [],
      adjectives: socialAgentTemplate.adjectives || [],
      topics: socialAgentTemplate.topics || [],
      style: socialAgentTemplate.style || {
        all: [],
        chat: [],
        post: []
      }
    };

    // Save the new agent character file
    const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.character.json`;
    const characterFilePath = path.join(CHARACTERS_DIR, filename);
    await fs.writeFile(
      characterFilePath,
      JSON.stringify(character, null, 2),
      'utf-8'
    );


    // Start agent process with its own environment and env file
    const agentProcess = spawn('pnpm', ['start', `--characters=${characterFilePath}`], {
      stdio: 'pipe',
      env: { ...process.env, ...agentCredentials }
    });

    const agentId = `${name}-${Date.now()}`;
    
    // Store agent process and its credentials
    runningAgents.set(agentId, {
      agentId,
      process: agentProcess,
      character: character as Character,
      credentials: agentCredentials
    });

    // Handle agent process events
    agentProcess.stdout.on('data', (data) => {
      elizaLogger.info(`[Workspace: ${agentCredentials.WORKSPACE_ID}] Agent ${agentId}: ${data}`);
    });

    agentProcess.stderr.on('data', (data) => {
      elizaLogger.error(`[Workspace: ${agentCredentials.WORKSPACE_ID}] Agent ${agentId} error: ${data}`);
    });

    agentProcess.on('exit', (code) => {
      elizaLogger.info(`[Workspace: ${agentCredentials.WORKSPACE_ID}] Agent ${agentId} exited with code ${code}`);
      runningAgents.delete(agentId);
    });

    res.json({
      message: 'Agent started successfully',
      agent: {
        id: agentId,
        name: character.name,
        clients: character.clients,
        platforms: enabledPlatforms,
        characterFile: filename,
        port: agentCredentials.SERVER_PORT,
        workspace: agentCredentials.WORKSPACE_ID
      }
    });
  } catch (error) {
    elizaLogger.error('Failed to start agent:', error);
    res.status(500).json({
      error: 'Failed to start agent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Stop an agent
const stopAgent: RequestHandler<{ id: string }> = (req, res) => {
  const { id } = req.params;
  
  try {
    const agentData = runningAgents.get(id);
    if (!agentData) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    // Kill the agent process
    agentData.process.kill();
    runningAgents.delete(id);
    
    res.json({ message: 'Agent stopped successfully' });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to stop agent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

router.get('/agents', getAgents);
router.post('/agents', startNewAgent);
router.delete('/agents/:id', stopAgent);

export default router; 
