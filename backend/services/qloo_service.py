import requests
from typing import Dict, List, Any
from config import settings

class QlooService:
    def __init__(self):
        self.api_key = settings.qloo_api_key
        # Define separate base URLs for the different API versions
        self.base_url_v1 = "https://hackathon.api.qloo.com"
        self.base_url_v2 = "https://hackathon.api.qloo.com/v2"
        self.headers = {
            "x-api-key": self.api_key
        }

    def _search_for_entity_ids(self, keywords: List[str]) -> List[str]:
        """
        Use the Qloo Search API (v1 endpoint) to convert keywords into entity IDs.
        """
        entity_ids = []
        # Use the correct v1 endpoint for search
        endpoint = f"{self.base_url_v1}/search"
        
        print(f"Searching for entity IDs for keywords: {keywords}")
        for keyword in keywords:
            try:
                # Corrected 'take' parameter to be greater than 1
                params = {"query": keyword, "take": 2}
                response = requests.get(endpoint, headers=self.headers, params=params)
                response.raise_for_status()
                results = response.json().get("results", []) # The key is 'results', not 'data'
                if results and results[0].get("entity_id"):
                    entity_id = results[0]["entity_id"]
                    print(f"  SUCCESS: Found entity for '{keyword}': {entity_id}")
                    entity_ids.append(entity_id)
                else:
                    print(f"  WARNING: No entity found for keyword '{keyword}'.")
            except requests.exceptions.RequestException as e:
                print(f"  ERROR: Could not find entity for keyword '{keyword}': {e}")
        
        return list(set(entity_ids))

    def analyze_audience_taste(self, audience_data: str, keywords: List[str]) -> Dict[str, Any]:
        """
        Analyze audience taste using a two-step process:
        1. Search for entity IDs (v1).
        2. Get insights for those IDs (v2).
        """
        if not self.api_key or self.api_key == "YOUR_QLOO_API_KEY":
            return self._get_mock_taste_profile(audience_data, keywords)

        entity_ids = self._search_for_entity_ids(keywords)

        if not entity_ids:
            return {
                "taste_profile": {},
                "analysis_notes": "Could not find any matching entities for the provided keywords in Qloo."
            }

        domain_to_filter_type = {
            "music": "urn:entity:artist",
            "film": "urn:entity:movie",
            "tv": "urn:entity:tv_show",
            "podcasts": "urn:entity:podcast",
            "books": "urn:entity:book",
            "fashion_brands": "urn:entity:brand",
            "video_games": "urn:entity:video_game"
        }

        taste_profile_results = {}
        
        print(f"Getting insights for entity IDs: {entity_ids}")
        for domain, filter_type in domain_to_filter_type.items():
            try:
                # Use the correct v2 endpoint for insights
                endpoint = f"{self.base_url_v2}/insights"
                
                params = {
                    "signal.interests.entities": ",".join(entity_ids),
                    "filter.type": filter_type,
                    "take": 5
                }

                response = requests.get(endpoint, headers=self.headers, params=params)

                if response.status_code == 403:
                    print(f"Qloo API access forbidden for domain '{domain}'. Skipping.")
                    taste_profile_results[domain] = {"error": "Access to this domain is restricted."}
                    continue
                
                response.raise_for_status()
                
                taste_profile_results[domain] = response.json().get("results", {})

            except requests.exceptions.RequestException as e:
                print(f"Qloo API request for domain '{domain}' failed: {e}")
                if e.response is not None:
                    print(f"Qloo API response status: {e.response.status_code}")
                    print(f"Qloo API response body: {e.response.text}")
                taste_profile_results[domain] = {"error": f"Failed to fetch data: {e.response.text if e.response else 'N/A'}"}

        return {
            "taste_profile": taste_profile_results,
            "analysis_notes": "Live cross-domain insights analysis using Qloo v2/insights API"
        }

    # --- Mock data methods for fallback and development ---
    def _get_mock_taste_profile(self, audience_data: str, keywords: List[str]) -> Dict[str, Any]:
        """
        Generate mock taste profile for demo purposes
        """
        print("Falling back to mock Qloo data.")
        return {
            "taste_profile": self._get_mock_affinities(keywords),
            "analysis_notes": "Mock analysis for demo purposes (API key may be missing or invalid)"
        }

    def _get_mock_affinities(self, entities: List[str]) -> Dict[str, Any]:
        """
        Mock taste affinities for demo purposes
        """
        mock_affinities = {
            "music": {
                "genres": ["indie folk", "ambient", "jazz fusion"],
                "artists": ["Bon Iver", "Tycho", "Khruangbin"],
                "affinity_score": 0.87
            },
            "film": {
                "genres": ["documentary", "indie drama", "foreign cinema"],
                "directors": ["Wes Anderson", "Greta Gerwig", "Bong Joon-ho"],
                "affinity_score": 0.82
            },
            "fashion": {
                "styles": ["minimalist", "sustainable", "vintage"],
                "brands": ["Everlane", "Reformation", "Patagonia"],
                "affinity_score": 0.79
            },
            "lifestyle": {
                "interests": ["mindfulness", "sustainability", "creativity"],
                "activities": ["yoga", "cooking", "photography"],
                "affinity_score": 0.91
            }
        }
        
        return {
            "primary_affinities": mock_affinities,
            "cross_domain_patterns": [
                "appreciation for craftsmanship and authenticity",
                "interest in sustainable and ethical choices",
                "preference for thoughtful, intentional experiences"
            ],
            "audience_persona": "conscious creators and mindful consumers"
        }