import os
import requests
from PIL import Image
from io import BytesIO
import tempfile
import base64
import logging
from typing import Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types
from openai import AzureOpenAI
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import praw
from praw.models import InlineImage
import uvicorn

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Ad Generation & Reddit API", 
             description="API for generating advertisements and posting to Reddit",
             version="1.0.0")


# Allow specific origins (or use ["*"] to allow all)
origins = ["*"]

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use ["*"] to allow all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Create a directory to store generated images
IMAGES_DIR = "generated_ads"
os.makedirs(IMAGES_DIR, exist_ok=True)

# Define models for API requests and responses
class ProductDescription(BaseModel):
    name: str
    description: str
    tagline: str
    brand_style: str = "Modern and professional"

class AdResponse(BaseModel):
    caption: str
    image_base64: str


# Initialize API clients
try:
    gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
except Exception as e:
    logger.error(f"Error initializing Gemini client: {e}")

try:
    openai_client = AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),  
        api_version="2024-07-01-preview",
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
    )
except Exception as e:
    logger.error(f"Error initializing Azure OpenAI client: {e}")

# Initialize Reddit instance
def get_reddit_instance():
    try:
        reddit = praw.Reddit(
            client_id="abc",
            client_secret="ABC",
            user_agent="post bot by u/Any_Honeydew1252",
            username="Any_Honeydew1252",
            password="lightspeed_Hack",
        )
        return reddit
    except Exception as e:
        logger.error(f"Failed to initialize Reddit instance: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to connect to Reddit API")
class AdContent(BaseModel):
  title: str
  caption: str

def get_ad_title_caption(description: dict) -> Optional[dict]:
    system_message = """You are an expert advertisement writer for social media. 
    Your task is to create catchy, stylish advertisement titles and captions based on product description.
    Make sure to be friendly and engaging. Talk in a way that is relatable to the audience.
    The title should be short and attention-grabbing, ideally under 10 words.
    The caption should be short, ideally under 50 words.
    Give only the title and caption without any additional text or explanation, separated by a newline.""" 
    
    product_info = f"Product Name: {description.get('name', 'N/A')}\n"
    product_info += f"Product Description: {description.get('description', 'N/A')}\n"
    product_info += f"Product Tagline: {description.get('tagline', 'N/A')}\n"
    product_info += f"Image Style: {description.get('brand_style', 'Modern and professional')}\n"
    
    user_message = f"Create a title and caption for an advertisement for the following product:\n{product_info}"

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.0-flash",
            config=types.GenerateContentConfig(
                system_instruction=system_message,
                max_output_tokens=400,
                temperature=0.7,
                response_mime_type='application/json',
                response_schema=AdContent,
            ),
            contents=user_message        
        )
        response_data = response.parsed

        return {
            "title": response_data.title,
            "caption": response_data.caption
        }
    
    except Exception as e:
        logger.error(f"Error generating title and caption with Gemini: {e}")
        return None


def get_ad_prompt(description):
    system_message = """You are an expert advertising copywriter. 
    Your task is to create detailed, vivid image generation prompts for advertising based on product description.
    Focus on visual elements that would make an effective advertisement.
    Include description about style, mood, colors, composition, and focus.
    Add catchy, stylish taglines in the advertisement to make it engaging.
    The color of the tagline should compliment the advertisement.
    Keep the prompt under 200 words but make it detailed and specific.
    Give only the prompt without any additional text or explanation."""
    
    product_info = f"Product Name: {description.get('name', 'N/A')}\n"
    product_info += f"Product Description: {description.get('description', 'N/A')}\n"
    product_info += f"Product Tagline: {description.get('tagline', 'N/A')}\n"
    product_info += f"Image Style: {description.get('brand_style', 'Modern and professional')}\n"
    
    user_message = f"Create a detailed prompt for generating an advertisement image for the following product:\n{product_info}"

    try:
        response = gemini_client.models.generate_content(
            model = "gemini-2.0-flash",
            config = types.GenerateContentConfig(
            system_instruction=system_message,
            max_output_tokens=400,
            temperature=0.7
            ),
            contents=user_message        
            )
        
        return response.text + "\nMake sure to include the tagline in the image."
    
    except Exception as e:
        logger.error(f"Error generating prompt with Gemini: {e}")
        return None
    
def generate_gemini_image(ad_prompt):
    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.0-flash-exp-image-generation",
            contents=(ad_prompt),
            config=types.GenerateContentConfig(
                response_modalities=['Text', 'Image']
            )
        )
        
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                logger.info(part.text)
            elif part.inline_data is not None:
                ad_image = Image.open(BytesIO((part.inline_data.data)))
                return ad_image
        
    except Exception as e:
        logger.error(f"Error generating image with Gemini: {e}")
        return None

def generate_dalle_image(ad_prompt):
    try:
        image_response = openai_client.images.generate(model="dall-e-3", prompt=ad_prompt, n=1, size="1024x1024")
        image_url = image_response.data[0].url
        response = requests.get(image_url)
        ad_image = Image.open(BytesIO(response.content))
        return ad_image
    
    except Exception as e:
        logger.error(f"Error generating image with DALL-E: {e}")
        return None

def generate_ad(product_description):
    try:
        prompt = get_ad_prompt(product_description)
        if not prompt:
            raise ValueError("Failed to generate ad prompt.")
        
        logger.info("Generated Prompt:")
        logger.info(prompt)
        logger.info("-" * 50)
        logger.info("Generating image...")

        # Use get_ad_title_caption instead of get_ad_caption
        ad_content = get_ad_title_caption(product_description)
        if not ad_content:
            raise ValueError("Failed to generate ad title and caption.")
            
        ad_caption = ad_content["caption"]
        ad_title = ad_content["title"]
        
        ad_image = generate_gemini_image(prompt)
        # return ad_image, ad_caption, ad_title
        return ad_caption, ad_title
    
    except Exception as e:
        logger.error(f"Error generating advertisement: {e}")
        return None, None, None

def image_to_base64(image):
    """Convert PIL Image to base64 string"""
    if not image:
        return None
    
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Advertisement Generation and Reddit Posting API"}

@app.post("/generate-ad")
async def generate_ad_endpoint(product: ProductDescription):
    """
    Generate an advertisement (image, title, and caption) based on product description
    """
    # try:
        # Generate ad image, caption and title
    ad_caption, ad_title = generate_ad(product.dict())
        
        # if not ad_image or not ad_caption or not ad_title:
        #     raise HTTPException(status_code=500, detail="Failed to generate advertisement")
        
        # Convert image to base64
        # image_base64 = image_to_base64(ad_image)
        # if not image_base64:
        #     raise HTTPException(status_code=500, detail="Failed to encode image")
        
    ad_img=Image.open("C:/Sagar/AI/ls/ad_gen/ad.png")

    return {
            "status": "success",
            "title": ad_title,
            "caption": ad_caption,
            "image_base64": ad_img
        }
    
    

@app.post("/post-to-reddit")
async def post_to_reddit_endpoint(
    title: str = Form(...),
    caption: str = Form(...),
    image_base64: str = Form(...)
):
    """
    Post an advertisement to a specified subreddit using provided title, caption and image in base64 format
    """
    try:
        # Decode the base64 image
        image_data = base64.b64decode(image_base64)
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
        temp_file.write(image_data)
        temp_file.close()

        # Prepare the content for Reddit
        reddit = get_reddit_instance()
        subreddit_obj = reddit.subreddit("lightspeed007")

        # Format post text with caption
        post_text = f"{caption}\n\n{{image}}"
        
        # Add image to media dict
        media = {
            "image": InlineImage(path=temp_file.name, caption=caption)
        }

        try:
            # Submit post to Reddit
            submission = subreddit_obj.submit(title, inline_media=media, selftext=post_text)
            post_url = f"https://www.reddit.com{submission.permalink}"

            return {
                "status": "success",
                "message": "Successfully posted ad to Reddit",
                "post_url": post_url,
                "post_id": submission.id
            }
        except praw.exceptions.RedditAPIException as e:
            error_details = ', '.join([f"{error.error_type}: {error.message}" for error in e.items])
            logger.error(f"Reddit API error: {error_details}")
            raise HTTPException(status_code=400, detail=f"Reddit API error: {error_details}")

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

    finally:
        # Clean up temporary file if it exists
        if 'temp_file' in locals() and os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
<<<<<<< HEAD
=======

app.post("/create_container")
def create_container(image_url: str, caption: str, alt_text: str, instagram_account_id: str, access_token: str):
    """Create a container for Instagram content."""
    url = f'https://graph.facebook.com/v22.0/{instagram_account_id}/media'
    params = {
        'image_url': image_url,
        'caption': caption,
        'alt_text': alt_text,
        'access_token': access_token
    }
    try:
        response = requests.post(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Error creating container: {str(e)}")

@app.post("/post-to-insta")
def publish_container(container_id: str, instagram_account_id: str, access_token: str):
    """Publish a container to Instagram."""
    url = f'https://graph.facebook.com/v22.0/{instagram_account_id}/media_publish'
    params = {
        'creation_id': container_id,
        'access_token': access_token
    }
    try:
        response = requests.post(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Error publishing container: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=3001)