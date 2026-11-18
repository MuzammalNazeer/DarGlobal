import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "DarGlobal & Wasalt Real Estate AI Assistant"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # OpenRouter LLM Configuration
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "openrouter/free")
    FALLBACK_MODELS: list = [
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemini-2.0-flash-exp:free",
        "google/gemini-2.0-flash-thinking-exp:free",
        "deepseek/deepseek-r1:free",
        "qwen/qwen-2.5-72b-instruct:free",
        "mistralai/mistral-7b-instruct:free"
    ]
    
    # RAG & Embedding Settings
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    CHROMA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "chroma_db")
    PROPERTIES_FILE: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "properties.json")
    
    # Embedding Model: sentence-transformers or fast fallback
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
    TOP_K_RESULTS: int = int(os.getenv("TOP_K_RESULTS", "6"))

settings = Settings()
