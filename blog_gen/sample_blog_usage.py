import requests
import json

# URL of the blog generation service when running locally
BASE_URL = "http://localhost:8000"  # Change this if your API is deployed elsewhere

def generate_blog_post(product_data):
    """
    Generate a blog post about a product using the API
    
    Args:
        product_data (dict): Dictionary containing product information
        
    Returns:
        dict: API response as a dictionary
    """
    try:
        response = requests.post(
            f"{BASE_URL}/generate-blog/", 
            json=product_data
        )
        response.raise_for_status()  # Raise an exception for 4XX/5XX responses
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error calling API: {e}")
        return None

if __name__ == "__main__":
    # Sample product data
    sample_product = {
        "name": "LightSpeed Pro",
        "description": "A powerful AI-driven productivity tool that helps you finish tasks in half the time.",
        "tagline": "Work smarter, not harder",
        "points": [
            "AI-powered task suggestions", 
            "Smart time management", 
            "Integration with popular productivity tools"
        ]
    }
    
    # Example usage
    print("Generating blog post for LightSpeed Pro...")
    result = generate_blog_post(sample_product)
    
    if result and result.get("success"):
        print("\n--- Generated Blog Post ---\n")
        print(result["blog_content"])
        print("\n--------------------------\n")
    else:
        print("Failed to generate blog post")
        
    # Example of another product
    another_product = {
        "name": "EcoFresh Air Purifier",
        "description": "An energy-efficient air purifier that removes 99.9% of allergens and pollutants.",
        "tagline": "Breathe easy, live healthy",
        "points": [
            "HEPA filtration technology",
            "Energy-saving eco mode",
            "Real-time air quality monitoring",
            "Silent operation for bedrooms"
        ]
    }
    
    print("\nGenerating blog post for EcoFresh Air Purifier...")
    result = generate_blog_post(another_product)
    
    if result and result.get("success"):
        print("\n--- Generated Blog Post ---\n")
        print(result["blog_content"])
        print("\n--------------------------\n")
    else:
        print("Failed to generate blog post")