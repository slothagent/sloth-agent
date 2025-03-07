import os
import json
import logging
from pathlib import Path
from dotenv import load_dotenv
from twitter.search import Search
from httpx import Client

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='twitter_debug.log'
)

# Get Twitter credentials from environment variables
email = os.getenv("TWITTER_EMAIL")
username = os.getenv("TWITTER_USERNAME")
password = os.getenv("TWITTER_PASSWORD")

print(email, username, password)

# Check if credentials are available
if not all([email, username, password]):
    raise ValueError("Twitter credentials not found in environment variables. "
                    "Please ensure TWITTER_EMAIL, TWITTER_USERNAME, and TWITTER_PASSWORD are set in your .env file.")

try:
    # Check if browser cookie file exists
    browser_cookie_file = Path("twitter_browser_cookies.json")
    
    if browser_cookie_file.exists():
        logging.info("Using browser-generated cookies")
        cookies = json.loads(browser_cookie_file.read_text())
        
        # Create a client with the browser cookies
        client = Client(cookies=cookies, follow_redirects=True)
        search = Search(session=client, debug=2)
    else:
        # Check if session file exists
        session_file = Path("twitter_session.cookies")
        
        if session_file.exists():
            logging.info("Using existing session file")
            search = Search(cookies="twitter_session.cookies", debug=2)
        else:
            logging.info("No session file found, using direct login")
            search = Search(email, username, password, debug=2)
            # Save the session for future use
            search.save_cookies("twitter_session.cookies")
            logging.info("Session saved for future use")
    
    logging.debug(f"Attempting search with account: {username}")
    res = search.run(
        limit=10,
        retries=7,
        queries=[
            {
                'category': 'Latest',
                'query': '#SlothAgent #DOR'
            }
        ],
    )
    
    # Kiểm tra kết quả và hiển thị tổng số kết quả tìm được
    total_results = sum(len(result_set) for result_set in res)
    print(f"Successfully retrieved {total_results} results")
    
    # Print found tweets to help identify the specific one
    for i, result_set in enumerate(res):
        for tweet in result_set:
            if 'content' in tweet and 'itemContent' in tweet['content']:
                tweet_content = tweet['content']['itemContent']
                if 'tweet_results' in tweet_content and 'result' in tweet_content['tweet_results']:
                    result = tweet_content['tweet_results']['result']
                    if 'rest_id' in result:
                        tweet_id = result['rest_id']
                        if tweet_id == '1896652812253356395':
                            print(f"Found target tweet: {tweet_id}")
                    
                    if 'legacy' in result:
                        tweet_text = result['legacy'].get('full_text', '')
                        print(f"Tweet ID: {result.get('rest_id', 'unknown')}")
                        print(f"Text: {tweet_text[:100]}...")
                        print("-" * 50)
                        
                        
except Exception as e:
    error_msg = f"Error during Twitter search: {e}"
    print(error_msg)
    logging.error(error_msg)
    