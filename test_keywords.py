import requests
import os
import json

# It's recommended to load sensitive data like API keys from environment variables
# to avoid hardcoding them in the script.
QLOO_API_KEY = os.getenv("QLOO_API_KEY")
if not QLOO_API_KEY:
    raise ValueError("QLOO_API_KEY environment variable not set. Please set it before running the script.")

HEADERS = {
    "x-api-key": QLOO_API_KEY,
    "Content-Type": "application/json"
}

QLOO_API_URL = "https://hackathon.api.qloo.com/v2"

def test_search(keyword, filter_type):
    """Tests a single keyword and type against the Qloo search API."""
    print(f"Testing keyword: '{keyword}' with filter.type: '{filter_type}'")
    search_url = f"{QLOO_API_URL}/search"
    params = {
        "q": keyword,
        "filter.type": filter_type,
        "take": 3
    }
    try:
        response = requests.get(search_url, headers=HEADERS, params=params)
        response.raise_for_status()
        results = response.json().get("data", [])
        if results:
            print(f"  SUCCESS: Found {len(results)} entity/entities.")
            print(json.dumps(results, indent=2))
        else:
            print(f"  WARNING: No entities found for '{keyword}'.")
        return results
    except requests.exceptions.RequestException as e:
        print(f"  ERROR: API request failed: {e}")
        if e.response:
            print(f"  Response: {e.response.status_code} - {e.response.text}")
        return None

if __name__ == "__main__":
    print("--- Starting Qloo Keyword Search Test ---")
    
    # Your provided example
    test_search("Minneapolis", "urn:entity:destination")
    print("-" * 20)

    # An example relevant to the app's domain
    test_search("Blade Runner", "urn:entity:movie")
    print("-" * 20)
    
    # An example for a genre keyword
    test_search("sci-fi", "urn:tag:genre") # This type is a guess
    print("-" * 20)

    print("--- Qloo Keyword Test Finished ---") 