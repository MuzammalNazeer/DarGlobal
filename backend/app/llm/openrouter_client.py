import logging
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional

from app.config import settings
from app.llm.prompts import SYSTEM_PROMPT, build_rag_user_prompt

logger = logging.getLogger(__name__)

class OpenRouterClient:
    def __init__(self):
        self.base_url = settings.OPENROUTER_BASE_URL
        self.default_model = settings.DEFAULT_MODEL
        self.fallback_models = settings.FALLBACK_MODELS

    def generate_chat_response(
        self,
        query: str,
        retrieved_properties: List[Dict[str, Any]],
        history: Optional[List[Dict[str, str]]] = None,
        api_key_override: Optional[str] = None,
        model_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates grounded LLM response using OpenRouter API.
        Attempts primary model and falls back through available free models on rate limits.
        If no API key is provided, uses structured deterministic synthesis.
        """
        api_key = api_key_override or settings.OPENROUTER_API_KEY
        
        # Build prompt
        user_prompt = build_rag_user_prompt(query, retrieved_properties)
        
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        if history:
            for msg in history[-4:]:  # last 4 turns for context
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        messages.append({"role": "user", "content": user_prompt})

        # If user did not configure an OpenRouter API key, use rich intelligent local grounding
        if not api_key:
            logger.info("No OpenRouter API key provided. Using intelligent grounded synthesis.")
            answer = self._generate_local_synthesis(query, retrieved_properties)
            return {
                "answer": answer,
                "model_used": "Local Grounded Engine (No OpenRouter Key Configured)",
                "grounded": True
            }

        # Models to try
        selected_model = model_override or self.default_model
        candidate_models = [selected_model] + [m for m in self.fallback_models if m != selected_model]

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://darglobal-wasalt-assistant.com",
            "X-Title": "DarGlobal Real Estate AI Assistant"
        }

        last_error = None
        for model in candidate_models:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.4,
                "max_tokens": 1200
            }

            try:
                logger.info(f"Attempting OpenRouter completion with model: {model}...")
                req = urllib.request.Request(
                    f"{self.base_url}/chat/completions",
                    data=json.dumps(payload).encode("utf-8"),
                    headers=headers,
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    answer = resp_data["choices"][0]["message"]["content"]
                    logger.info(f"Successfully received response from {model}")
                    return {
                        "answer": answer,
                        "model_used": model,
                        "grounded": True
                    }
            except urllib.error.HTTPError as e:
                err_body = e.read().decode("utf-8", errors="ignore")
                logger.warning(f"OpenRouter model {model} failed with HTTP {e.code}: {err_body}")
                last_error = f"HTTP {e.code}: {err_body}"
                continue
            except Exception as e:
                logger.warning(f"OpenRouter model {model} error: {e}")
                last_error = str(e)
                continue

        # If all OpenRouter free model calls failed (e.g. rate limit), fall back gracefully
        logger.warning(f"All OpenRouter attempts failed ({last_error}). Falling back to local grounded synthesis.")
        fallback_answer = self._generate_local_synthesis(query, retrieved_properties, note_fallback=True)
        return {
            "answer": fallback_answer,
            "model_used": f"Grounded Fallback (OpenRouter API Error: {last_error})",
            "grounded": True
        }

    def _generate_local_synthesis(
        self,
        query: str,
        retrieved_properties: List[Dict[str, Any]],
        note_fallback: bool = False
    ) -> str:
        """
        Creates an elegant, grounded answer when OpenRouter key is not set or rate-limited.
        """
        if not retrieved_properties:
            return (
                "### Property Search Notice\n\n"
                "I searched the active database for **DarGlobal** and **Wasalt**, but could not find properties "
                "strictly matching your query criteria.\n\n"
                "**Suggestions:**\n"
                "- Inquire about flagship developments such as **DG1 Living**, **Tierra Viva by Lamborghini**, "
                "**AIDA Trump Villas**, or **Les Vagues by Elie Saab**.\n"
                "- Inquire about Saudi properties in **Riyadh (Al Malqa, King Abdullah)**, **Jeddah (Corniche)**, "
                "or **Al Khobar**."
            )

        header = "### Verified Property Insights\n\n"
        if note_fallback:
            header += "> *Note: OpenRouter API free routing was temporarily busy or rate-limited. Serving immediate grounded response from the real-time vector database.*\n\n"

        body = f"Based on your query **\"{query}\"**, here are the most relevant properties and developments retrieved from our database:\n\n"

        for i, p in enumerate(retrieved_properties[:4], 1):
            source_badge = "🌟 **DarGlobal Luxury International**" if p.get("source") == "DarGlobal" else "🇸🇦 **Wasalt Saudi Arabia**"
            body += f"#### {i}. {p.get('title')}\n"
            body += f"- **Platform / Developer:** {source_badge}\n"
            body += f"- **Location:** {p.get('location')} ({p.get('city')}, {p.get('country')})\n"
            body += f"- **Price:** `{p.get('price_formatted')}`\n"
            if p.get("bedrooms"):
                body += f"- **Bedrooms / Area:** {p.get('bedrooms')} | {p.get('area_sqm', 'N/A')} SQM\n"
            if p.get("designer_or_brand"):
                body += f"- **Brand / Designer:** {p.get('designer_or_brand')}\n"
            body += f"- **Overview:** {p.get('description')}\n"
            
            features = p.get("features", [])
            if features:
                body += f"- **Key Highlights:** {'; '.join(features[:3])}\n"
            body += f"- **Source Link:** [{p.get('source_url')}]({p.get('source_url')})\n\n"

        body += "\n---\n**Summary & Advisory:**\n"
        body += "For international trophy luxury assets, **DarGlobal** properties offer high capital appreciation, world-class co-branded architecture (Lamborghini, Trump, Pagani, Missoni), and eligibility for Golden Visas (such as the 10-year Oman Golden Visa at AIDA).\n"
        body += "For domestic Saudi real estate, **Wasalt** listings provide verified REGA-licensed residential villas and apartments in high-growth districts of Riyadh, Jeddah, and Eastern Province."

        return header + body

openrouter_client = OpenRouterClient()
