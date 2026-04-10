import google.generativeai as genai
from database import fs  # Your existing database connection
from settings.configs import settings
from services.ai_service import GeminiAnalyzerService
from services.storage_service import MongoStorageService

# Initialize the Gemini Model
try:
    gemini_key = settings.get_api_key("gemini")
except ValueError as e:
    raise

genai.configure(api_key=gemini_key)
model = genai.GenerativeModel("gemini-2.5-flash")

# Instantiate the Service Classes
ai_service_instance = GeminiAnalyzerService(model)
storage_service_instance = MongoStorageService(fs)
def get_ai_service() -> GeminiAnalyzerService:
    return ai_service_instance

def get_storage_service() -> MongoStorageService:
    return storage_service_instance