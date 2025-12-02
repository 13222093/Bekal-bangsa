import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from database import supabase

# Explicitly load .env from the backend directory (parent of services)
load_dotenv(Path(__file__).parent.parent / ".env")

# --- SETUP CLIENTS ---
kolosal_client = OpenAI(
    api_key=os.getenv("KOLOSAL_API_KEY"),
    base_url=os.getenv("KOLOSAL_BASE_URL")
)
