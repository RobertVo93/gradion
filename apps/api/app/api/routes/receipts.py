from fastapi import APIRouter, Depends, File, UploadFile

from app.api.deps import get_current_user
from app.core.config import settings
from app.schemas.receipt import ReceiptPreviewResponse
from app.services.receipt_extraction_service import ReceiptExtractionService
from app.services.receipt_storage_service import ReceiptStorageService

router = APIRouter(prefix="/receipts", tags=["receipts"])


@router.post("/extract-preview", response_model=ReceiptPreviewResponse)
async def extract_preview(
    file: UploadFile = File(...),
    _=Depends(get_current_user),
) -> ReceiptPreviewResponse:
    storage = ReceiptStorageService(settings)
    extractor = ReceiptExtractionService()

    temp_path = await storage.save_temp(file)
    try:
        extraction_status, extracted = extractor.extract(file_path=temp_path, content_type=file.content_type)
        return ReceiptPreviewResponse(extraction_status=extraction_status, extracted=extracted)
    finally:
        temp_path.unlink(missing_ok=True)
