import os
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from twitter.search import Search
from httpx import Client
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='twitter_debug.log'
)

# Create FastAPI app
app = FastAPI(title="Twitter Search API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://www.slothai.xyz"],  # List of allowed origins (frontend URL)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Define request model
class SearchQuery(BaseModel):
    category: str = "Latest"
    query: str
    limit: int = 10
    retries: int = 7

class SearchRequest(BaseModel):
    queries: List[SearchQuery] = None
    query: List[SearchQuery] = None  # Alternative field name for backward compatibility
    
    def get_queries(self):
        """Return the queries regardless of which field was used"""
        if self.queries is not None:
            return self.queries
        if self.query is not None:
            return self.query
        return []

# Define response models
class TweetInfo(BaseModel):
    tweet_id: str
    text: str
    user_name: Optional[str] = None
    user_screen_name: Optional[str] = None
    created_at: Optional[str] = None
    retweet_count: Optional[int] = None
    favorite_count: Optional[int] = None
    
class SearchResponse(BaseModel):
    total_results: int
    tweets: List[TweetInfo]

# Initialize Twitter search client
def get_twitter_client():
    # Get Twitter credentials from environment variables
    email = os.getenv("TWITTER_EMAIL")
    username = os.getenv("TWITTER_USERNAME")
    password = os.getenv("TWITTER_PASSWORD")
    
    # Check if credentials are available
    if not all([email, username, password]):
        raise ValueError("Twitter credentials not found in environment variables. "
                        "Please ensure TWITTER_EMAIL, TWITTER_USERNAME, and TWITTER_PASSWORD are set in your .env file.")
    
    # Check if browser cookie file exists
    browser_cookie_file = Path("twitter_browser_cookies.json")
    
    if browser_cookie_file.exists():
        logging.info("Using browser-generated cookies")
        cookies = json.loads(browser_cookie_file.read_text())
        
        # Create a client with the browser cookies
        client = Client(cookies=cookies, follow_redirects=True)
        return Search(session=client, debug=2)
    else:
        # Check if session file exists
        session_file = Path("twitter_session.cookies")
        
        if session_file.exists():
            logging.info("Using existing session file")
            return Search(cookies="twitter_session.cookies", debug=2)
        else:
            logging.info("No session file found, using direct login")
            search = Search(email, username, password, debug=2)
            # Save the session for future use
            search.save_cookies("twitter_session.cookies")
            logging.info("Session saved for future use")
            return search

# Extract tweet information
def extract_tweet_info(tweet):
    tweet_info = TweetInfo(tweet_id="unknown", text="")
    
    if 'content' in tweet and 'itemContent' in tweet['content']:
        tweet_content = tweet['content']['itemContent']
        if 'tweet_results' in tweet_content and 'result' in tweet_content['tweet_results']:
            result = tweet_content['tweet_results']['result']
            
            # Extract tweet ID
            if 'rest_id' in result:
                tweet_info.tweet_id = result['rest_id']
            
            # Extract tweet text and other metadata
            if 'legacy' in result:
                legacy = result['legacy']
                tweet_info.text = legacy.get('full_text', '')
                tweet_info.created_at = legacy.get('created_at')
                tweet_info.retweet_count = legacy.get('retweet_count')
                tweet_info.favorite_count = legacy.get('favorite_count')
                
                # Extract user information
                if 'core' in result and 'user_results' in result['core'] and 'result' in result['core']['user_results']:
                    user = result['core']['user_results']['result']
                    if 'legacy' in user:
                        tweet_info.user_name = user['legacy'].get('name')
                        tweet_info.user_screen_name = user['legacy'].get('screen_name')
    
    return tweet_info

# Create a thread pool executor for running synchronous code
executor = ThreadPoolExecutor()

# Run synchronous Twitter search in a separate thread
async def run_twitter_search(search, limit, retries, queries):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        executor,
        lambda: search.run(limit=limit, retries=retries, queries=queries)
    )

@app.post("/search", response_model=SearchResponse)
async def search_twitter(request: SearchRequest):
    try:
        # Log the incoming request for debugging
        logging.info(f"Received search request: {request}")
        
        # Get queries using the helper method
        request_queries = request.get_queries()
        
        if not request_queries:
            raise HTTPException(status_code=400, detail="No queries provided. Use either 'queries' or 'query' field.")
        
        # Initialize Twitter client
        search = get_twitter_client()
        
        # Convert request to format expected by Search.run
        queries = [
            {
                'category': q.category,
                'query': q.query
            } for q in request_queries
        ]
        logging.info(f"Queries: {queries}")
        
        # Get the limit and retries from the first query (or use defaults)
        limit = request_queries[0].limit if request_queries else 10
        retries = request_queries[0].retries if request_queries else 7
        
        # Run the search in a separate thread
        res = await run_twitter_search(search, limit, retries, queries)
        
        # Process results
        all_tweets = []
        
        for result_set in res:
            for tweet in result_set:
                tweet_info = extract_tweet_info(tweet)
                if tweet_info.tweet_id != "unknown":
                    all_tweets.append(tweet_info)
        
        # Create response without raw_data
        response = SearchResponse(
            total_results=len(all_tweets),
            tweets=all_tweets
        )
        
        return response
    
    except Exception as e:
        error_msg = f"Error during Twitter search: {e}"
        logging.error(error_msg)
        # Include the traceback for better debugging
        import traceback
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)

# Add a new endpoint to help debug request validation issues
@app.post("/validate_search")
async def validate_search_request(request: dict):
    """
    Endpoint to validate search requests without executing them.
    This helps identify validation issues with the request format.
    """
    try:
        # Try to parse the request using the Pydantic model
        parsed_request = SearchRequest.parse_obj(request)
        queries = parsed_request.get_queries()
        
        return {
            "valid": True,
            "parsed_request": parsed_request.dict(),
            "queries_found": len(queries),
            "field_used": "queries" if parsed_request.queries is not None else "query" if parsed_request.query is not None else "none"
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e),
            "request_received": request
        }

@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 