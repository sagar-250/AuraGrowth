import requests
import json
from pprint import pprint

# Base URL for the API - update this if your server runs on a different host/port
BASE_URL = "http://localhost:8000"

def print_response(response):
    """Helper function to print API responses nicely"""
    print(f"Status Code: {response.status_code}")
    try:
        pprint(response.json())
    except json.JSONDecodeError:
        print(response.text)
    print("-" * 50)


# Example 6: Get metrics for just the top post from a subreddit
print("\nExample 6: Get metrics for only the top post from r/programming")
subreddit = "programming"  # Change this to any subreddit you're interested in
response = requests.get(f"{BASE_URL}/top_post")
print_response(response)

print("\nSample usage completed.")