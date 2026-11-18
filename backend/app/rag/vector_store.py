import logging
import os
import math
from typing import List, Dict, Any, Optional

from app.config import settings
from app.rag.embeddings import embedding_service
from app.models import PropertySourceCitation

logger = logging.getLogger(__name__)

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

class VectorStore:
    def __init__(self):
        self.chroma_client = None
        self.chroma_collection = None
        self.in_memory_docs: List[Dict[str, Any]] = []
        self.in_memory_embeddings: List[List[float]] = []
        self.use_chroma = False
        self._init_store()

    def _init_store(self):
        os.makedirs(settings.CHROMA_DIR, exist_ok=True)
        try:
            import chromadb
            from chromadb.config import Settings as ChromaSettings
            logger.info("Initializing ChromaDB PersistentClient...")
            self.chroma_client = chromadb.PersistentClient(path=settings.CHROMA_DIR)
            self.chroma_collection = self.chroma_client.get_or_create_collection(
                name="properties_catalog",
                metadata={"hnsw:space": "cosine"}
            )
            self.use_chroma = True
            logger.info("ChromaDB initialized successfully.")
        except Exception as e:
            logger.warning(f"ChromaDB initialization bypassed ({e}). Operating in High-Performance In-Memory Vector Mode.")
            self.use_chroma = False

    def property_to_text(self, prop: Dict[str, Any]) -> str:
        """Constructs rich semantic representation of a property for embedding."""
        parts = [
            f"Title: {prop.get('title', '')}",
            f"Developer / Platform: {prop.get('source', '')}",
            f"Project: {prop.get('project_name', '')}",
            f"Location: {prop.get('location', '')}, {prop.get('city', '')}, {prop.get('country', '')}",
            f"Type: {prop.get('property_type', '')}",
            f"Price: {prop.get('price_formatted', '')}",
            f"Bedrooms: {prop.get('bedrooms', '')}",
            f"Bathrooms: {prop.get('bathrooms', '')}",
            f"Area: {prop.get('area_sqm', '')} SQM",
            f"Brand / Designer: {prop.get('designer_or_brand', '')}",
            f"Features: {', '.join(prop.get('features', []))}",
            f"Description: {prop.get('description', '')}"
        ]
        return "\n".join(parts)

    def index_properties(self, properties: List[Dict[str, Any]]):
        """Indexes properties into the vector store."""
        if not properties:
            logger.warning("No properties to index.")
            return

        logger.info(f"Indexing {len(properties)} properties...")
        texts = [self.property_to_text(p) for p in properties]
        embeddings = embedding_service.embed_texts(texts)

        # Store in-memory for instant cosine similarity
        self.in_memory_docs = properties
        self.in_memory_embeddings = embeddings

        if self.use_chroma and self.chroma_collection:
            try:
                ids = [p["id"] for p in properties]
                metadatas = [
                    {
                        "source": p.get("source", ""),
                        "city": p.get("city", "") or "",
                        "property_type": p.get("property_type", "") or "",
                        "price": str(p.get("price_numeric") or 0.0),
                    }
                    for p in properties
                ]
                
                # Delete existing to update cleanly
                existing_ids = self.chroma_collection.get().get("ids", [])
                if existing_ids:
                    self.chroma_collection.delete(ids=existing_ids)
                
                self.chroma_collection.add(
                    ids=ids,
                    documents=texts,
                    embeddings=embeddings,
                    metadatas=metadatas
                )
                logger.info(f"Indexed {len(properties)} properties into ChromaDB collection.")
            except Exception as e:
                logger.error(f"ChromaDB indexing error ({e}). In-memory index active.")

    def search(
        self,
        query: str,
        top_k: int = 5,
        source_filter: Optional[str] = "ALL"
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top-k most relevant properties matching the query.
        Applies semantic similarity + metadata source filtering.
        """
        if not self.in_memory_docs:
            return []

        query_embedding = embedding_service.embed_query(query)
        scored_results = []

        query_lower = query.lower()
        # Extract keywords for lexical boost
        keywords = set(query_lower.split())

        for idx, (doc, doc_emb) in enumerate(zip(self.in_memory_docs, self.in_memory_embeddings)):
            doc_source = doc.get("source", "")
            if source_filter and source_filter != "ALL" and doc_source.lower() != source_filter.lower():
                continue

            sim = cosine_similarity(query_embedding, doc_emb)
            
            # Lexical boost for direct matches (e.g. "DG1", "Riyadh", "Lamborghini", "Elie Saab", "Wasalt", "Trump")
            title_lower = doc.get("title", "").lower()
            location_lower = doc.get("location", "").lower()
            brand_lower = (doc.get("designer_or_brand") or "").lower()
            
            boost = 0.0
            for kw in keywords:
                if len(kw) > 2:
                    if kw in title_lower:
                        boost += 0.15
                    if kw in location_lower:
                        boost += 0.10
                    if kw in brand_lower:
                        boost += 0.15

            total_score = sim + boost
            scored_results.append((total_score, doc))

        # Sort descending by score
        scored_results.sort(key=lambda x: x[0], reverse=True)

        top_matches = []
        for score, doc in scored_results[:top_k]:
            match_doc = dict(doc)
            match_doc["relevance_score"] = round(float(score), 4)
            top_matches.append(match_doc)

        return top_matches

    def format_citations(self, properties: List[Dict[str, Any]]) -> List[PropertySourceCitation]:
        citations = []
        for p in properties:
            citations.append(
                PropertySourceCitation(
                    id=p.get("id", ""),
                    title=p.get("title", ""),
                    source=p.get("source", ""),
                    location=p.get("location", ""),
                    price=p.get("price_formatted", ""),
                    bedrooms=p.get("bedrooms"),
                    area=f"{p.get('area_sqm')} SQM" if p.get("area_sqm") else None,
                    property_type=p.get("property_type", "Apartment"),
                    image_url=p.get("image_url"),
                    source_url=p.get("source_url", ""),
                    relevance_score=p.get("relevance_score")
                )
            )
        return citations

vector_store = VectorStore()
