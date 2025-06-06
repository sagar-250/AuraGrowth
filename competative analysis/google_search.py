import requests



def google_search(query, api_key=API_KEY, cse_id=CSE_ID, num_results=1):
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": api_key,
        "cx": cse_id,
        "q": query,
        "num": num_results,
    }
    response = requests.get(url, params=params)
    data = response.json()
    
    results = []
    for item in data.get("items", []):
        results.append(item.get("link"))
    return results

# 🔍 Example usage
# query = "open ai"
# search_results = google_search(query)
# print(search_results)
