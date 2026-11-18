import json
import logging
import os
import threading
from datetime import datetime
from typing import List, Dict, Any

from app.config import settings
from app.scraper.darglobal_scraper import DarGlobalScraper
from app.scraper.wasalt_scraper import WasaltScraper
from app.scraper.seed_data import ALL_SEED_PROPERTIES

logger = logging.getLogger(__name__)

class ScraperManager:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(ScraperManager, cls).__new__(cls)
                    cls._instance._init_manager()
        return cls._instance

    def _init_manager(self):
        self.darglobal_scraper = DarGlobalScraper()
        self.wasalt_scraper = WasaltScraper()
        self.is_scraping = False
        self.last_scraped_at = None
        self.status_message = "Ready"
        os.makedirs(settings.DATA_DIR, exist_ok=True)
        self._ensure_properties_file()

    def _ensure_properties_file(self):
        """Ensures properties.json exists with seed data initially."""
        if not os.path.exists(settings.PROPERTIES_FILE):
            logger.info("Initializing properties.json with seed data...")
            with open(settings.PROPERTIES_FILE, "w", encoding="utf-8") as f:
                json.dump(ALL_SEED_PROPERTIES, f, indent=2, ensure_ascii=False)
            self.last_scraped_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            self.status_message = f"Seeded with {len(ALL_SEED_PROPERTIES)} properties"

    def load_properties(self) -> List[Dict[str, Any]]:
        self._ensure_properties_file()
        try:
            with open(settings.PROPERTIES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading properties.json: {e}")
            return ALL_SEED_PROPERTIES

    def save_properties(self, properties: List[Dict[str, Any]]):
        os.makedirs(settings.DATA_DIR, exist_ok=True)
        with open(settings.PROPERTIES_FILE, "w", encoding="utf-8") as f:
            json.dump(properties, f, indent=2, ensure_ascii=False)
        self.last_scraped_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    def run_full_scrape(self, background: bool = False, on_complete_callback = None) -> Dict[str, Any]:
        """Runs the scraping process for both DarGlobal and Wasalt."""
        if self.is_scraping:
            return {"status": "in_progress", "message": "Scraping already running"}

        def _task():
            self.is_scraping = True
            self.status_message = "Scraping DarGlobal and Wasalt..."
            try:
                dg_props = self.darglobal_scraper.scrape()
                wasalt_props = self.wasalt_scraper.scrape(max_per_city=12)
                
                # Combine & deduplicate by ID
                all_props_dict = {}
                for p in dg_props:
                    all_props_dict[p["id"]] = p
                for p in wasalt_props:
                    all_props_dict[p["id"]] = p
                
                final_list = list(all_props_dict.values())
                self.save_properties(final_list)
                self.status_message = f"Successfully scraped {len(final_list)} total properties ({len(dg_props)} DarGlobal, {len(wasalt_props)} Wasalt)"
                logger.info(self.status_message)
                
                if on_complete_callback:
                    on_complete_callback(final_list)
                    
            except Exception as e:
                logger.error(f"Scrape task failed: {e}")
                self.status_message = f"Error during scrape: {str(e)}"
            finally:
                self.is_scraping = False

        if background:
            t = threading.Thread(target=_task, daemon=True)
            t.start()
            return {"status": "started", "message": "Scraping started in background"}
        else:
            _task()
            return {"status": "completed", "message": self.status_message}

    def get_status(self) -> Dict[str, Any]:
        props = self.load_properties()
        dg_count = sum(1 for p in props if p.get("source") == "DarGlobal")
        wasalt_count = sum(1 for p in props if p.get("source") == "Wasalt")
        return {
            "total_properties": len(props),
            "darglobal_count": dg_count,
            "wasalt_count": wasalt_count,
            "last_scraped_at": self.last_scraped_at,
            "is_scraping": self.is_scraping,
            "status_message": self.status_message
        }

scraper_manager = ScraperManager()
