import requests
import json
import base64
from PIL import Image
from io import BytesIO

# Base URL for the API
BASE_URL = "http://localhost:8000"

def generate_ad_example():
    """
    Example of using the generate-ad endpoint
    """
    print("=== GENERATING ADVERTISEMENT ===")
    
    # Sample product data
    product_data = {
        "name": "EcoFresh Water Bottle",
        "description": "Sustainable stainless steel water bottle with double-wall vacuum insulation that keeps drinks cold for 24 hours or hot for 12 hours. Features a leak-proof lid and comes in various colors.",
        "tagline": "Stay hydrated, stay sustainable",
        "brand_style": "Modern, eco-friendly, minimalist"
    }
    
    # Make API call to generate ad
    response = requests.post(
        f"{BASE_URL}/generate-ad",
        json=product_data
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"Ad Title: {result['title']}")
        print(f"Ad Caption: {result['caption']}")
        print(f"Image received: {len(result['image_base64'])} bytes of base64 data")
        
        # Optional: Display the image
        try:
            image_data = base64.b64decode(result['image_base64'])
            image = Image.open(BytesIO(image_data))
            image.save("sample_generated_ad.png")
            print("Image saved as sample_generated_ad.png")
        except Exception as e:
            print(f"Error displaying image: {e}")
        
        return result
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None

def post_to_reddit_example(title, caption, image_base64, subreddit="test"):
    """
    Example of using the post-to-reddit endpoint
    """
    print("=== POSTING TO REDDIT ===")
    
    # Prepare form data
    form_data = {
        "subreddit": subreddit,
        "title": title,
        "caption": caption,
        "image_base64": image_base64
    }
    
    # Make API call to post to Reddit
    response = requests.post(
        f"{BASE_URL}/post-to-reddit",
        data=form_data  # Note: using data instead of json for Form parameters
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"Success! Post URL: {result['post_url']}")
        print(f"Post ID: {result['post_id']}")
        return result
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None

def run_complete_example():
    """
    Run a complete example: generate an ad and then post it to Reddit
    """
    print("Running complete example workflow...")
    
    # First generate the ad
    ad_result = generate_ad_example()
    
    if ad_result:
        print("\nAd generated successfully. Now posting to Reddit...\n")
        
        # Then post it to Reddit (using 'test' subreddit by default)
        post_result = post_to_reddit_example(
            title=ad_result['title'],
            caption=ad_result['caption'],
            image_base64=ad_result['image_base64']
        )
        
        if post_result:
            print("\nComplete workflow successful!")
    
if __name__ == "__main__":
    run_complete_example()