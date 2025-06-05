from fastapi import FastAPI, HTTPException
import praw
import logging
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Reddit Post Metrics API")

# Initialize Reddit client
try:
    reddit = praw.Reddit(
        client_id="bBZ-feRIlepOug9fnKm49w",
        client_secret="y3n2BiJXBLGYPbh0swH0OUq8L1CCRw",
        user_agent="post bot by u/Any_Honeydew1252",
        username="Any_Honeydew1252",
        password="lightspeed_Hack",
    )
    logger.info("Reddit client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Reddit instance: {str(e)}")
    # We'll handle this in the endpoint instead of raising here
    reddit = None

@app.get("/")
def read_root():
    return {"message": "Welcome to the Reddit Post Metrics API"}

@app.get("/metrics/{subreddit_name}", response_model=List[Dict[str, Any]])
async def get_post_metrics(subreddit_name: str, limit: int = 100):
    """
    Get metrics for top posts from a specified subreddit.
    
    Parameters:
    - subreddit_name: Name of the subreddit to analyze
    - limit: Maximum number of posts to analyze (default: 100)
    
    Returns:
    - List of post metrics including title, upvotes, views, comments, and URL
    """
    # Check if Reddit client is properly initialized
    if not reddit:
        logger.error("Reddit client not initialized")
        raise HTTPException(status_code=500, detail="Reddit client not initialized")
    
    try:
        # Get the subreddit
        subreddit = reddit.subreddit(subreddit_name)
        
        # Get hot posts
        hot_posts = subreddit.hot(limit=limit)
        
        # Collect metrics
        metrics = []
        for post in hot_posts:
            try:
                # Calculate views based on upvote ratio and score
                views = int((1/post.upvote_ratio) * post.score) if post.upvote_ratio > 0 else 0
                
                metrics.append({
                    "title": post.title,
                    "upvotes": post.score,
                    "views": views,
                    "comments": post.num_comments,
                    "url": post.url,
                    "created_utc": post.created_utc,
                    "id": post.id
                })
            except Exception as e:
                logger.warning(f"Error processing post {post.id}: {str(e)}")
                continue
        
        return metrics
    
    except Exception as e:
        logger.error(f"Error getting metrics from subreddit {subreddit_name}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")

@app.get("/reddit_metrics")
async def get_single_post_metrics(post_id: str):
    """
    Get metrics for a specific post by its ID.
    
    Parameters:
    - post_id: Reddit post ID
    
    Returns:
    - Post metrics including title, upvotes, views, comments, and URL
    """
    if not reddit:
        logger.error("Reddit client not initialized")
        raise HTTPException(status_code=500, detail="Reddit client not initialized")
    
    try:
        # Get the submission
        post = reddit.submission(post_id)
        
        # Calculate views based on upvote ratio and score
        views = int((1/post.upvote_ratio) * post.score) if post.upvote_ratio > 0 else 0
        
        metrics = {
            "title": post.title,
            "upvotes": post.score,
            "views": views,
            "comments": post.num_comments,
            "url": post.url,
            "created_utc": post.created_utc,
            "subreddit": post.subreddit.display_name
        }
        
        return metrics
    
    except Exception as e:
        logger.error(f"Error getting metrics for post {post_id}: {str(e)}")
        raise HTTPException(status_code=404, detail=f"Post not found or error occurred: {str(e)}")

@app.get("/top_post")
async def get_top_post_metrics():
    if not reddit:
        logger.error("Reddit client not initialized")
        raise HTTPException(status_code=500, detail="Reddit client not initialized")
    
    try:
        # Get the subreddit
        subreddit_name = "lightspeed007"
        subreddit = reddit.subreddit(subreddit_name)
        
        # Get only the top hot post (limit=1)
        hot_posts = list(subreddit.hot(limit=1))
        
        if not hot_posts:
            raise HTTPException(status_code=404, detail=f"No posts found in subreddit {subreddit_name}")
        
        post = hot_posts[0]
        
        # Calculate views based on upvote ratio and score
        views = int((1/post.upvote_ratio) * post.score) if post.upvote_ratio > 0 else 0
        
        metrics = {
            "title": post.title,
            "upvotes": post.score,
            "views": views,
            "comments": post.num_comments,
            "url": post.url,
            "created_utc": post.created_utc,
            "id": post.id,
            "subreddit": subreddit_name
        }
        
        return metrics
    
    except Exception as e:
        logger.error(f"Error getting top post metrics from subreddit {subreddit_name}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get top post metrics: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)