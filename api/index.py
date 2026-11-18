import sys
import os

# Add backend directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, os.path.join(parent_dir, "backend"))

# Ensure USE_SENTENCE_TRANSFORMERS is false for serverless fast execution
os.environ["USE_SENTENCE_TRANSFORMERS"] = "false"

from app.main import app
