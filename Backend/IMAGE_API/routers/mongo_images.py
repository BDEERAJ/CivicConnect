from fastapi import APIRouter, HTTPException, Depends , UploadFile, File
from fastapi.responses import StreamingResponse
from http import HTTPStatus

import io

from dependencies import get_storage_service
from services.storage_service import MongoStorageService

router = APIRouter(prefix="/images", tags=["Image Retrieval"])


@router.put("/{filename}", status_code=HTTPStatus.OK)
async def upload_image(
    filename: str,
    file: UploadFile = File(...),
    storage_service: "MongoStorageService" = Depends(get_storage_service),
):
    if not file:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="File not provided")

    # Read file content (async)
    content = await file.read()

    storage_service.save_file(content, filename=filename)

    return {"status": "success", "filename": filename}

@router.post("/{filename}", status_code=HTTPStatus.OK)
async def upload_image_post(
    filename: str,
    file: UploadFile = File(...),
    storage_service: "MongoStorageService" = Depends(get_storage_service),
):
    if not file:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="File not provided")

    # Read file content (async)
    content = await file.read()
    
    try:
        storage_service.save_file(content, filename=filename)
        return {"status": "success", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail=f"Failed to save image: {str(e)}")

@router.get("/{filename}", status_code=HTTPStatus.OK)
def get_image_content(
    filename: str,
    storage_service: MongoStorageService = Depends(get_storage_service)
):
    file = storage_service.get_file_by_name(filename)
    if not file:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="File not found")
    return StreamingResponse(io.BytesIO(file.read()), media_type=file.content_type)