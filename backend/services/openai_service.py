import json
from openai import OpenAI
from config import settings
from typing import Dict, Any, List, Optional

class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = "gpt-4o"

    def _generate_chat_completion(self, prompt: str, response_format: str = "json_object") -> Dict[str, Any]:
        if not settings.openai_api_key or settings.openai_api_key == "YOUR_OPENAI_API_KEY":
            return {"error": "OpenAI API key not configured"}
        print("\n--- OpenAI Prompt Sent ---\n", prompt, "\n--- End Prompt ---\n")
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a world-class creative strategist and viral marketing expert for content creators."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": response_format},
                temperature=0.7,
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"OpenAI API request failed: {e}")
            return {"error": str(e)}

    def generate_content_ideas(
        self,
        niche_description: str,
        taste_profile: Dict[str, Any],
        content_type: str,
        brand_voice: str = "not specified",
        negative_keywords: Optional[List[str]] = None,
        additional_constraints: str = "",
        user_prompt: str = ""
    ) -> List[Dict[str, Any]]:
        negative_keywords_prompt = f"Avoid: {', '.join(negative_keywords)}." if negative_keywords else ""
        # Summarize and trim the taste_profile for the LLM (top 3 entities per domain, skip errors, remove analysis_notes)
        def summarize_taste_profile(tp: Dict[str, Any]) -> Dict[str, Any]:
            # Bulletproof: Only include allowed fields, never reference or mutate original dicts
            if not tp:
                return {}
            taste = tp.get("taste_profile", tp)
            summary = {}
            if isinstance(taste, dict):
                for domain, data in taste.items():
                    if not isinstance(data, dict):
                        continue
                    if data.get("error"):
                        continue
                    entities = data.get("entities") or data.get("results")
                    if isinstance(entities, list):
                        trimmed_entities = []
                        for e in entities[:3]:
                            if not isinstance(e, dict) or not e.get("name"):
                                continue
                            # Only allowed fields: name, short_description, tags, popularity
                            trimmed = {}
                            trimmed["name"] = e.get("name")
                            # Short description: prefer first value in short_descriptions, else fallback to short_description
                            sd = None
                            props = e.get("properties", {})
                            sds = props.get("short_descriptions")
                            if isinstance(sds, list) and sds and isinstance(sds[0], dict):
                                sd = sds[0].get("value")
                            elif isinstance(props.get("short_description"), str):
                                sd = props.get("short_description")
                            trimmed["short_description"] = sd
                            # Tags: up to 3 tag names
                            tags = e.get("tags")
                            if isinstance(tags, list):
                                trimmed["tags"] = [t.get("name") for t in tags[:3] if isinstance(t, dict) and t.get("name")]
                            else:
                                trimmed["tags"] = None
                            trimmed["popularity"] = e.get("popularity")
                            trimmed_entities.append(trimmed)
                        summary[domain] = {"entities": trimmed_entities}
            return summary

        trimmed_profile = summarize_taste_profile(taste_profile)
        # Format the profile as compact readable text (for both content and monetization prompts)
        def format_profile(profile: Dict[str, Any]) -> str:
            lines = []
            for domain, data in profile.items():
                # Section header for domain
                lines.append(f"\n=== {domain.title()} ===")
                for entity in data.get("entities", []):
                    name = entity.get("name", "")
                    desc = entity.get("short_description") or ""
                    tags = entity.get("tags") or []
                    pop = entity.get("popularity")
                    # Modal-style: each field on its own line, clear labels
                    lines.append(f"• Name: {name}")
                    if desc:
                        lines.append(f"  Description: {desc}")
                    if tags:
                        lines.append(f"  Tags: {', '.join(tags)}")
                    if isinstance(pop, (int, float)):
                        lines.append(f"  Popularity: {round(pop*100,1)}%")
                    lines.append("")
            return '\n'.join(lines)

        profile_text = format_profile(trimmed_profile)
        prompt = f"""
You are a world-class creative strategist for content creators.

Niche: {niche_description}
Brand Voice: {brand_voice}
Audience Taste Profile:
{profile_text}
{negative_keywords_prompt}
Content Type: {content_type}
Constraints: {additional_constraints or "None"}

User's Request: {user_prompt}

Instructions:
- Use the above audience taste profile and the user's request to generate 5 content ideas.
- For each idea, provide: title, concept, visual_elements (as a list), call_to_action, why_it_works (reference the audience taste profile).
- Output: JSON with key 'ideas', value is a list of idea objects. Each idea object must have keys: title, concept, visual_elements (list), call_to_action, why_it_works.
        """
        # Print prompt size in characters and tokens (approximate: 1 token ≈ 4 chars for English)
        prompt_len = len(prompt)
        approx_tokens = prompt_len // 4
        print(f"\n--- OpenAI Prompt Sent to LLM (for content ideas) ---\n(Prompt size: {prompt_len} chars, ~{approx_tokens} tokens)\n" + prompt + "\n--- End Prompt ---\n")
        response = self._generate_chat_completion(prompt)
        print("\n--- LLM Raw Response (for content ideas) ---\n" + json.dumps(response, indent=2) + "\n--- End LLM Response ---\n")
        # Defensive: If LLM returns ideas with visual_elements as empty string or missing, fix it here
        # Handle both dict with 'ideas' key and list directly
        # Defensive: always return a list of ideas, and always fix visual_elements
        if isinstance(response, dict) and "ideas" in response:
            ideas = response["ideas"]
        elif isinstance(response, list):
            ideas = response
        else:
            ideas = []
        required_keys = {"title", "concept", "visual_elements", "call_to_action", "why_it_works"}
        sanitized_ideas = []
        for idea in ideas:
            if not isinstance(idea, dict):
                continue
            # Ensure all required keys exist
            for key in required_keys:
                if key not in idea:
                    if key == "visual_elements":
                        idea[key] = []
                    else:
                        idea[key] = ""
            visual_elements = idea.get("visual_elements", None)
            if visual_elements is None or (isinstance(visual_elements, str) and not visual_elements.strip()):
                idea["visual_elements"] = []
            elif isinstance(visual_elements, str):
                idea["visual_elements"] = [visual_elements]
            elif not isinstance(visual_elements, list):
                idea["visual_elements"] = []
            sanitized_ideas.append(idea)
            if len(sanitized_ideas) == 5:
                break
        return sanitized_ideas

    def generate_monetization_ideas(
        self,
        niche_description: str,
        taste_profile: Dict[str, Any],
        collaboration_type: str,
        brand_voice: str = "not specified",
        negative_keywords: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        negative_keywords_prompt = f"The creator wants to AVOID brands or topics related to: {', '.join(negative_keywords)}." if negative_keywords else ""

        # Use the same summarization for monetization prompt
        def summarize_taste_profile(tp: Dict[str, Any]) -> Dict[str, Any]:
            # Bulletproof: Only include allowed fields, never reference or mutate original dicts
            if not tp:
                return {}
            taste = tp.get("taste_profile", tp)
            summary = {}
            if isinstance(taste, dict):
                for domain, data in taste.items():
                    if not isinstance(data, dict):
                        continue
                    if data.get("error"):
                        continue
                    entities = data.get("entities") or data.get("results")
                    if isinstance(entities, list):
                        trimmed_entities = []
                        for e in entities[:3]:
                            if not isinstance(e, dict) or not e.get("name"):
                                continue
                            trimmed = {}
                            trimmed["name"] = e.get("name")
                            sd = None
                            props = e.get("properties", {})
                            sds = props.get("short_descriptions")
                            if isinstance(sds, list) and sds and isinstance(sds[0], dict):
                                sd = sds[0].get("value")
                            elif isinstance(props.get("short_description"), str):
                                sd = props.get("short_description")
                            trimmed["short_description"] = sd
                            tags = e.get("tags")
                            if isinstance(tags, list):
                                trimmed["tags"] = [t.get("name") for t in tags[:3] if isinstance(t, dict) and t.get("name")]
                            else:
                                trimmed["tags"] = None
                            trimmed["popularity"] = e.get("popularity")
                            trimmed_entities.append(trimmed)
                        summary[domain] = {"entities": trimmed_entities}
            return summary

        trimmed_profile = summarize_taste_profile(taste_profile)
        def format_profile(profile: Dict[str, Any]) -> str:
            lines = []
            for domain, data in profile.items():
                lines.append(f"{domain.title()}")
                for entity in data.get("entities", []):
                    name = entity.get("name", "")
                    desc = entity.get("short_description") or ""
                    tags = entity.get("tags") or []
                    tags_str = f" [Tags: {', '.join(tags)}]" if tags else ""
                    pop = entity.get("popularity")
                    pop_str = f" (Popularity: {round(pop*100,1)}%)" if isinstance(pop, (int, float)) else ""
                    lines.append(f"- {name}: {desc}{tags_str}{pop_str}")
                lines.append("")
            return '\n'.join(lines)

        profile_text = format_profile(trimmed_profile)
        prompt = f"""
Analyze the following creator profile and generate 3 innovative monetization ideas.

Creator Profile:
Niche: {niche_description}
Brand Voice: {brand_voice}
Audience Taste Profile:
{profile_text}
{negative_keywords_prompt}

Task:
Generate 3 authentic and brand-aligned monetization ideas. For each idea, provide a potential brand name, the collaboration type, a concise pitch angle, a taste alignment explanation, and a "why_it_works" rationale.

Collaboration Type: {collaboration_type}

The "why_it_works" is crucial. It must be a concise sentence explaining why this collaboration makes sense for the audience, referencing their taste profile. For example: "This partnership is a natural fit because the audience's affinity for [Brand Category] and [Creator's Niche] overlap perfectly."

Output Format:
Return a JSON object with a single key "ideas", which is a list of 3 idea objects. Each object must have the following keys: "brand_name", "collaboration_type", "pitch_angle", "taste_alignment", "why_it_works".
        """
        prompt_len = len(prompt)
        approx_tokens = prompt_len // 4
        print(f"\n--- OpenAI Prompt Sent to LLM (for monetization ideas) ---\n(Prompt size: {prompt_len} chars, ~{approx_tokens} tokens)\n" + prompt + "\n--- End Prompt ---\n")
        response = self._generate_chat_completion(prompt)
        # Defensive: always return a list of ideas, and always fix required fields
        ideas = []
        if isinstance(response, dict) and "ideas" in response:
            ideas = response["ideas"]
        elif isinstance(response, list):
            ideas = response
        else:
            ideas = []
        required_keys = {"brand_name", "collaboration_type", "pitch_angle", "taste_alignment", "why_it_works"}
        sanitized_ideas = []
        for idea in ideas:
            if not isinstance(idea, dict):
                continue
            # Ensure all required keys exist
            for key in required_keys:
                if key not in idea:
                    idea[key] = ""
            sanitized_ideas.append(idea)
            if len(sanitized_ideas) == 3:
                break
        return sanitized_ideas