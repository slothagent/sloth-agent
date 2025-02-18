# Import the required libraries
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from agno.agent import Agent
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.models.openai import OpenAIChat
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get OpenAI API key from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

# Create FastAPI app
app = FastAPI(
    title="AI Web Search Assistant",
    description="API for searching the web using GPT-4"
)

class SearchRequest(BaseModel):
    query: str

@app.post("/search")
async def search(request: SearchRequest):
    try:
        # Create an instance of the Assistant
        assistant = Agent(
            model=OpenAIChat(
                id="gpt-4o",
                max_tokens=1024,
                temperature=0.9,
                api_key=OPENAI_API_KEY
            ),
            tools=[DuckDuckGoTools()],
            show_tool_calls=True
        )

        # Search the web using the AI Assistant
        response = assistant.run(request.query, stream=False)
        return {"result": response.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)