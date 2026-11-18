import os
import logging
from typing import Optional, List
from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.models import (
    ChatRequest, ChatResponse,
    Property, PropertySourceCitation,
    ScrapeStatusResponse, SearchRequest
)
from app.scraper.scraper_manager import scraper_manager
from app.rag.vector_store import vector_store
from app.llm.openrouter_client import openrouter_client

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("DarGlobal-API")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Real Estate AI Assistant for DarGlobal & Wasalt"
)

# Enable CORS for local development and live domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initializes property data and vector index on startup."""
    logger.info("Initializing DarGlobal & Wasalt Real Estate Assistant...")
    properties = scraper_manager.load_properties()
    logger.info(f"Loaded {len(properties)} properties from storage.")
    vector_store.index_properties(properties)
    logger.info("System startup sequence complete.")

@app.get("/api/health")
def health_check():
    status = scraper_manager.get_status()
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": {
            "total_properties": status["total_properties"],
            "darglobal_count": status["darglobal_count"],
            "wasalt_count": status["wasalt_count"],
            "use_chroma": vector_store.use_chroma
        },
        "openrouter": {
            "api_key_configured": bool(settings.OPENROUTER_API_KEY),
            "default_model": settings.DEFAULT_MODEL
        }
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    RAG-grounded chat endpoint answering user queries about DarGlobal & Wasalt.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    logger.info(f"Incoming chat query: '{request.message}', filter: {request.source_filter}")
    
    # 1. Retrieve top matching properties from vector store
    retrieved_properties = vector_store.search(
        query=request.message,
        top_k=settings.TOP_K_RESULTS,
        source_filter=request.source_filter or "ALL"
    )
    
    # 2. Format citations
    citations = vector_store.format_citations(retrieved_properties)

    # 3. Call OpenRouter client with grounded RAG context
    history_dicts = [{"role": m.role, "content": m.content} for m in request.history]
    llm_result = openrouter_client.generate_chat_response(
        query=request.message,
        retrieved_properties=retrieved_properties,
        history=history_dicts,
        api_key_override=request.api_key,
        model_override=request.model
    )

    return ChatResponse(
        answer=llm_result["answer"],
        sources=citations,
        model_used=llm_result["model_used"],
        grounded=llm_result.get("grounded", True)
    )

@app.get("/api/properties")
def list_properties(
    source: Optional[str] = Query("ALL", description="ALL, DarGlobal, or Wasalt"),
    city: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 50
):
    """Lists properties with optional filtering."""
    props = scraper_manager.load_properties()
    
    if source and source != "ALL":
        props = [p for p in props if p.get("source", "").lower() == source.lower()]
    
    if city:
        props = [p for p in props if city.lower() in (p.get("city") or "").lower()]
        
    if q:
        query_lower = q.lower()
        props = [
            p for p in props
            if query_lower in p.get("title", "").lower()
            or query_lower in p.get("location", "").lower()
            or query_lower in (p.get("designer_or_brand") or "").lower()
            or query_lower in p.get("description", "").lower()
        ]
        
    return {
        "count": len(props[:limit]),
        "total": len(props),
        "properties": props[:limit]
    }

@app.get("/api/properties/{property_id}")
def get_property(property_id: str):
    props = scraper_manager.load_properties()
    for p in props:
        if p["id"] == property_id:
            return p
    raise HTTPException(status_code=404, detail="Property not found")

@app.post("/api/search")
def semantic_search(request: SearchRequest):
    """Semantic vector search over property catalog."""
    matches = vector_store.search(
        query=request.query,
        top_k=request.limit,
        source_filter=request.source or "ALL"
    )
    citations = vector_store.format_citations(matches)
    return {
        "query": request.query,
        "count": len(matches),
        "results": matches,
        "citations": citations
    }

@app.post("/api/scrape/run")
def run_scrape(background_tasks: BackgroundTasks):
    """Triggers scraping of both DarGlobal and Wasalt websites."""
    def on_complete(updated_props):
        logger.info("Scraping finished. Refreshing vector store index...")
        vector_store.index_properties(updated_props)

    result = scraper_manager.run_full_scrape(background=True, on_complete_callback=on_complete)
    return result

@app.get("/api/scrape/status", response_model=ScrapeStatusResponse)
def get_scrape_status():
    return scraper_manager.get_status()

# Serve React static build if present
dist_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")
if os.path.exists(dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Endpoint not found")
        file_path = os.path.join(dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_path, "index.html"))
