import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Central configuration class for API keys and other settings"""

    def __init__(self):
        # Automatically collect all environment variables ending with _API_KEY
        self.api_keys = {
            key.split("_API_KEY")[0].lower(): value
            for key, value in os.environ.items()
            if key.endswith("_API_KEY")
        }
        print(f"Loaded API keys for: {', '.join(self.api_keys.keys())}")

    def get_api_key(self, name: str) -> str:
        """Return the API key for the given service"""
        key = self.api_keys.get(name.lower())
        if not key:
            raise ValueError(f"No API key found for '{name}'")
        return key

settings = Config()