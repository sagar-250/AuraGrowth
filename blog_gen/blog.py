import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from google import genai
from google.genai import types

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Gemini client
try:
    gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    logger.info("Gemini client initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Gemini client: {e}")

# FastAPI app
app = FastAPI(title="Blog Post Generator API", description="API to generate blog posts using Gemini AI")

class ProductDescription(BaseModel):
    name: str = Field(..., description="Name of the product")
    description: str = Field(..., description="Description of the product")
    tagline: Optional[str] = Field(None, description="Tagline for the product")
    points: Optional[List[str]] = Field(None, description="Key points to highlight in the blog")


class BlogResponse(BaseModel):
    success: bool
    blog_content: Optional[str] = None
    error: Optional[str] = None


def get_blog_post(description):
    system_message = """You are an expert blog writer.
    You will be given a product description and you will write a blog post about it.
    The blog post should be engaging, informative, and should include the product's features and benefits.
    The blog post should be at least 500 words long and should be suitable for a general audience.
    The blog post should be written in a friendly and conversational tone.
    The blog post should include a catchy title."""
    
    product_info = f"Product Name: {description.get('name', 'N/A')}\n"
    product_info += f"Product Description: {description.get('description', 'N/A')}\n"
    product_info += f"Product Tagline: {description.get('tagline', 'N/A')}\n"
    product_info += f"Blog points: {description.get('points', 'N/A')}\n"
    
    user_message = f"Create a blog post for the following product:\n{product_info}"
    logger.info(f"Generating blog post for product: {description.get('name', 'N/A')}")

    try:
        response = gemini_client.models.generate_content(
            model = "gemini-2.0-flash",
            config = types.GenerateContentConfig(
            system_instruction=system_message,
            max_output_tokens=3000,
            temperature=0.7
            ),
            contents=user_message        
            )
        
        logger.info(f"Blog post generated successfully for {description.get('name', 'N/A')}")
        return response.text
    
    except Exception as e:
        logger.error(f"Error generating prompt with Gemini: {e}")
        return None


@app.post("/generate-blog/", response_model=BlogResponse)
async def generate_blog(product: ProductDescription):
    logger.info(f"Received request to generate blog for product: {product.name}")
    try:
        # Convert Pydantic model to dict
        product_dict = product.dict()
        
        # Generate blog post
        blog_content = get_blog_post(product_dict)
        
        if not blog_content:
            logger.error("Failed to generate blog content")
            raise HTTPException(status_code=500, detail="Failed to generate blog content")
            
        return BlogResponse(success=True, blog_content=blog_content)
    
    except Exception as e:
        logger.error(f"Error in generate_blog endpoint: {str(e)}")
        return BlogResponse(success=False, error=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)