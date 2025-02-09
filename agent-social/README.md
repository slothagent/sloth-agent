# Agent Social

## Overview

Agent Social is a tool that allows you to create and manage social media agents.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- pnpm package manager

### Installation

1. Configure your `.env` file with necessary API keys and settings

### Running the Server

Start the server in production mode:
```bash
pnpm start:server
```

The server will run on port 8080 by default (configurable via SERVER_PORT in .env)

## API Documentation

### Endpoints

#### 1. Get All Running Agents
```
GET /api/agents
```

Response example:
```json
[
  {
    "id": "agent-1234567890",
    "name": "Social Bot",
    "clients": ["direct"],
    "modelProvider": "openai",
    "platforms": ["twitter", "telegram"]
  }
]
```

#### 2. Start New Agent
```
POST /api/agents
```

Request body example:
```json
{
  "name": "MySocialAgent1",
  "clients": ["twitter"],
  "modelProvider": "openai",
  "platforms": ["twitter"],
  "settings": {
    "platformCredentials": {
      "twitter": {
        "username": "your-twitter-username",
        "password": "your-twitter-password", 
        "email": "your-twitter-email",
        "cookies": "optional",
        "dryRun": false
      }
    },
    "postInterval": {
      "POST_INTERVAL_MIN": "90",
      "POST_INTERVAL_MAX": "180"
    }
  }
}
```

Response example:
```json
{
  "message": "Agent started successfully",
  "agent": {
    "id": "my-social-agent-1234567890",
    "name": "My Social Agent",
    "clients": ["direct"],
    "platforms": ["twitter"],
    "characterFile": "my-social-agent.character.json",
    "port": "5000",
    "workspace": "workspace-my-social-agent-1234567890"
  }
}
```

#### 3. Stop Agent
```
DELETE /api/agents/:id
```

Response example:
```json
{
  "message": "Agent stopped successfully",
  "id": "agent-1234567890"
}
```

### Error Responses

In case of errors, the API will return appropriate HTTP status codes along with error messages:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common status codes:
- 400: Bad Request - Missing or invalid parameters
- 404: Not Found - Agent not found
- 500: Internal Server Error - Server-side issues

## Supported Platforms

Currently supported social media platforms:
- Twitter
- Telegram

Each platform requires specific credentials to be configured in the agent settings.


