import json
import os
from datetime import datetime

def parse_tweet_data(tweet_entry):
    """Extract relevant information from a tweet entry."""
    try:
        content = tweet_entry.get("content", {})
        tweet_content = content.get("itemContent", {})
        tweet_results = tweet_content.get("tweet_results", {}).get("result", {})
        
        # Get core tweet data
        legacy = tweet_results.get("legacy", {})
        tweet_id = legacy.get("id_str")
        full_text = legacy.get("full_text", "")
        created_at = legacy.get("created_at", "")
        
        # Format date
        if created_at:
            try:
                date_obj = datetime.strptime(created_at, "%a %b %d %H:%M:%S +0000 %Y")
                formatted_date = date_obj.strftime("%Y-%m-%d %H:%M:%S")
            except:
                formatted_date = created_at
        else:
            formatted_date = ""
        
        # Get user data
        user_data = tweet_results.get("core", {}).get("user_results", {}).get("result", {})
        user_legacy = user_data.get("legacy", {})
        username = user_legacy.get("screen_name", "")
        display_name = user_legacy.get("name", "")
        
        # Get engagement metrics
        favorite_count = legacy.get("favorite_count", 0)
        retweet_count = legacy.get("retweet_count", 0)
        reply_count = legacy.get("reply_count", 0)
        
        # Get media if available
        media = []
        if "extended_entities" in legacy and "media" in legacy["extended_entities"]:
            for media_item in legacy["extended_entities"]["media"]:
                media_type = media_item.get("type", "")
                media_url = media_item.get("media_url_https", "")
                if media_type and media_url:
                    media.append({
                        "type": media_type,
                        "url": media_url
                    })
        
        # Get hashtags
        hashtags = []
        if "entities" in legacy and "hashtags" in legacy["entities"]:
            hashtags = [tag.get("text", "") for tag in legacy["entities"]["hashtags"]]
        
        # Get URLs
        urls = []
        if "entities" in legacy and "urls" in legacy["entities"]:
            urls = [url.get("expanded_url", "") for url in legacy["entities"]["urls"]]
        
        return {
            "tweet_id": tweet_id,
            "username": username,
            "display_name": display_name,
            "date": formatted_date,
            "text": full_text,
            "likes": favorite_count,
            "retweets": retweet_count,
            "replies": reply_count,
            "media": media,
            "hashtags": hashtags,
            "urls": urls
        }
    except Exception as e:
        return {"error": str(e)}

def parse_search_results(file_path):
    """Parse Twitter search results and convert to a more readable format."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        parsed_tweets = []
        for entry in data:
            parsed_tweet = parse_tweet_data(entry)
            if parsed_tweet:
                parsed_tweets.append(parsed_tweet)
        
        return parsed_tweets
    except Exception as e:
        return {"error": f"Failed to parse file: {str(e)}"}

def main():
    # Create output directory if it doesn't exist
    output_dir = os.path.join("data", "parsed_tweets")
    os.makedirs(output_dir, exist_ok=True)
    
    # Get all JSON files in the search_results directory
    search_results_dir = os.path.join("data", "search_results")
    json_files = [f for f in os.listdir(search_results_dir) if f.endswith('.json')]
    
    total_tweets = 0
    
    # Process each JSON file
    for json_file in json_files:
        input_file = os.path.join(search_results_dir, json_file)
        parsed_tweets = parse_search_results(input_file)
        
        # Create output filename based on input filename
        output_filename = f"parsed_{json_file}"
        output_file = os.path.join(output_dir, output_filename)
        
        # Save the parsed results
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(parsed_tweets, f, indent=2, ensure_ascii=False)
        
        tweet_count = len(parsed_tweets)
        total_tweets += tweet_count
        print(f"Parsed {tweet_count} tweets from {json_file} and saved to {output_file}")
    
    print(f"Total: Parsed {total_tweets} tweets from {len(json_files)} files")

if __name__ == "__main__":
    main() 