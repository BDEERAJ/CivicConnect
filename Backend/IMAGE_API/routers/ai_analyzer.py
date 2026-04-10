from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from http import HTTPStatus

# Import your newly created service and your dependency injector
# (Adjust these import paths based on your actual folder structure)
from services.ai_service import GeminiAnalyzerService 
from dependencies import get_ai_service 

router = APIRouter(prefix="/ai", tags=["AI Analysis & Verification"])

# --- Pydantic Models for clean API responses ---
class ProblemReport(BaseModel):
    problem_type: str
    confidence: int
    description: str
    suggested_solution: str

class ResolutionReport(BaseModel):
    is_resolved: bool
    accuracy_score: int
    what_is_missing: str
    remarks: str


# --- 1. The Analysis Route ---
@router.post("/analyze", response_model=ProblemReport, status_code=HTTPStatus.OK)
async def analyze_problem_route(
    file: UploadFile = File(...),
    ai_service: GeminiAnalyzerService = Depends(get_ai_service)
):
    """Upload a new image to detect the problem."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="File must be an image")

    try:
        # Read the bytes and pass directly to your service
        image_bytes = await file.read()
        print(f"[AI] Analyzing image, size: {len(image_bytes)} bytes")
        result = ai_service.analyze_problem(image_bytes)
        print(f"[AI] Analysis result: {result}")
        
        # Ensure result has all required fields
        if not all(key in result for key in ["problem_type", "confidence", "description", "suggested_solution"]):
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR, 
                detail=f"Invalid AI response structure. Got keys: {list(result.keys())}"
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"[AI ERROR] {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail=f"AI Analysis failed: {str(e)}")


# --- 2. The Verification Route ---
@router.post("/verify-resolution", response_model=ResolutionReport, status_code=HTTPStatus.OK)
async def verify_resolution_route(
    original_image: UploadFile = File(...),
    resolved_image: UploadFile = File(...),
    ai_service: GeminiAnalyzerService = Depends(get_ai_service)
):
    """Upload the original problem image and the 'fixed' image to verify the work."""
    
    # Check that both uploads are actually images
    if not original_image.content_type.startswith("image/") or not resolved_image.content_type.startswith("image/"):
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Both files must be images")

    try:
        # Read both files into memory
        orig_bytes = await original_image.read()
        res_bytes = await resolved_image.read()
        
        # Pass both sets of bytes to your new service function
        result = ai_service.verify_resolution(orig_bytes, res_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail=str(e))