from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status


class ReceiptStorageService:
    ALLOWED_CONTENT_TYPES = {
        "application/pdf": ".pdf",
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    def __init__(self, upload_dir: str):
        self.base_dir = Path(upload_dir).resolve()
        self.receipts_dir = self.base_dir / "receipts"
        self.receipts_dir.mkdir(parents=True, exist_ok=True)

    async def save(self, upload_file: UploadFile) -> tuple[str, Path]:
        extension = self._get_extension(upload_file.content_type)
        filename = f"{uuid4().hex}{extension}"
        destination = self.receipts_dir / filename

        content = await upload_file.read()
        destination.write_bytes(content)

        receipt_url = f"/uploads/receipts/{filename}"
        return receipt_url, destination

    async def save_temp(self, upload_file: UploadFile) -> Path:
        extension = self._get_extension(upload_file.content_type)
        tmp_dir = self.base_dir / "tmp"
        tmp_dir.mkdir(parents=True, exist_ok=True)
        destination = tmp_dir / f"{uuid4().hex}{extension}"
        destination.write_bytes(await upload_file.read())
        return destination

    def _get_extension(self, content_type: str | None) -> str:
        extension = self.ALLOWED_CONTENT_TYPES.get(content_type or "")
        if not extension:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Allowed: PDF, JPG, PNG, WEBP",
            )
        return extension
