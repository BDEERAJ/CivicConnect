from pymongo import MongoClient
import gridfs
from settings.configs import settings
MONGO_URI = settings.get_api_key("MONGO_DB_URI")
client = MongoClient(MONGO_URI)
db = client["your_database_name"]

fs = gridfs.GridFS(db)