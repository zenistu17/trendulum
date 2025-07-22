import requests
import json

BASE_URL = "http://localhost:8000"
USER_EMAIL = "test.creator3@example.com"
USER_PASSWORD = "password123"

def main():
    session = requests.Session()
    access_token = None
    creator_profile_id = None

    try:
        # 1. Register User
        print("1. Registering new user...")
        register_payload = {
            "email": USER_EMAIL,
            "username": "e2e_tester",
            "password": USER_PASSWORD
        }
        response = session.post(f"{BASE_URL}/register", json=register_payload)
        if response.status_code != 200:
            # Try to login if registration fails (e.g., user already exists)
            print("Registration failed, attempting to log in...")
            # Fall through to login
        else:
            print("User registered successfully.")
            print(response.json())

        # 2. Login User
        print("\n2. Logging in...")
        login_payload = {
            "username": USER_EMAIL,
            "password": USER_PASSWORD
        }
        response = session.post(f"{BASE_URL}/token", data=login_payload)
        response.raise_for_status()
        access_token = response.json()["access_token"]
        session.headers.update({"Authorization": f"Bearer {access_token}"})
        print("Login successful.")
        
        # 3. Create Creator Profile
        print("\n3. Creating creator profile...")
        profile_payload = {
            "niche_description": "A channel dedicated to reviewing obscure 1980s science fiction novels.",
            "keywords": ["William Gibson", "Blade Runner"],
            "social_links": {"youtube": "https://youtube.com/c/scifiretroreviews"},
            "audience_data": "My audience loves classic cyberpunk themes, discussions about vintage technology, and the philosophical implications of AI in old novels. They often mention authors like William Gibson and Philip K. Dick."
        }
        response = session.post(f"{BASE_URL}/creator-profiles", json=profile_payload)
        response.raise_for_status()
        creator_profile_id = response.json()["id"]
        print("Creator profile created successfully.")
        print(response.json())

        # 4. Analyze Audience
        print("\n4. Analyzing audience with Qloo...")
        analysis_payload = {"creator_profile_id": creator_profile_id}
        response = session.post(f"{BASE_URL}/analyze-audience", json=analysis_payload)
        response.raise_for_status()
        print("Audience analysis complete.")
        print(json.dumps(response.json(), indent=2))

        # 5. Generate Content Ideas
        print("\n5. Generating content ideas with OpenAI...")
        content_payload = {
            "creator_profile_id": creator_profile_id,
            "content_type": "YouTube Video"
        }
        response = session.post(f"{BASE_URL}/generate-content", json=content_payload)
        response.raise_for_status()
        print("Content ideas generated successfully.")
        print(json.dumps(response.json(), indent=2))

        # 6. Generate Monetization Ideas
        print("\n6. Generating monetization ideas with OpenAI...")
        monetization_payload = {
            "creator_profile_id": creator_profile_id,
            "collaboration_type": "sponsorship"
        }
        response = session.post(f"{BASE_URL}/generate-monetization", json=monetization_payload)
        response.raise_for_status()
        print("Monetization ideas generated successfully.")
        print(json.dumps(response.json(), indent=2))

        print("\n✅ End-to-end test completed successfully!")

    except requests.exceptions.RequestException as e:
        print(f"\n❌ Test failed: {e}")
        if e.response:
            print(f"Response status: {e.response.status_code}")
            print(f"Response text: {e.response.text}")

if __name__ == "__main__":
    main() 