from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.ai_analyzer import router as ai_router
from routers.mongo_images import router as images_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers with /api prefix to match frontend expectations
app.include_router(ai_router, prefix="/api")
app.include_router(images_router, prefix="/api")