import json
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import Settings

try:
    from minio import Minio
    from minio.error import S3Error
except ImportError:  # pragma: no cover - optional dependency for non-minio local runs
    Minio = None  # type: ignore[assignment]
    S3Error = Exception  # type: ignore[assignment]


class ReceiptStorageService:
    ALLOWED_CONTENT_TYPES = {
        "application/pdf": ".pdf",
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    def __init__(self, app_settings: Settings):
        self.settings = app_settings
        self.base_dir = Path(app_settings.upload_dir).resolve()
        self.receipts_dir = self.base_dir / "receipts"
        self.receipts_dir.mkdir(parents=True, exist_ok=True)
        self.tmp_dir = self.base_dir / "tmp"
        self.tmp_dir.mkdir(parents=True, exist_ok=True)
        self.storage_backend = app_settings.storage_backend.lower()

        self.minio_client: Minio | None = None
        if self.storage_backend == "minio":
            if Minio is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="MinIO client dependency is missing",
                )
            self.minio_client = Minio(
                endpoint=app_settings.minio_endpoint,
                access_key=app_settings.minio_access_key,
                secret_key=app_settings.minio_secret_key,
                secure=app_settings.minio_secure,
            )
            self._ensure_minio_bucket()

    async def save(self, upload_file: UploadFile) -> tuple[str, Path]:
        extension = self._get_extension(upload_file.content_type)
        content = await upload_file.read()
        file_path = self.tmp_dir / f"{uuid4().hex}{extension}"
        file_path.write_bytes(content)

        if self.storage_backend == "minio" and self.minio_client:
            object_name = f"receipts/{uuid4().hex}{extension}"
            self.minio_client.put_object(
                bucket_name=self.settings.minio_bucket,
                object_name=object_name,
                data=BytesIO(content),
                length=len(content),
                content_type=upload_file.content_type or "application/octet-stream",
            )
            public_url = self.settings.minio_public_url.rstrip("/")
            receipt_url = f"{public_url}/{self.settings.minio_bucket}/{object_name}"
            return receipt_url, file_path

        filename = f"{uuid4().hex}{extension}"
        destination = self.receipts_dir / filename
        destination.write_bytes(content)
        return f"/uploads/receipts/{filename}", destination

    async def save_temp(self, upload_file: UploadFile) -> Path:
        extension = self._get_extension(upload_file.content_type)
        destination = self.tmp_dir / f"{uuid4().hex}{extension}"
        destination.write_bytes(await upload_file.read())
        return destination

    def _ensure_minio_bucket(self) -> None:
        if not self.minio_client:
            return
        bucket = self.settings.minio_bucket
        try:
            if not self.minio_client.bucket_exists(bucket):
                self.minio_client.make_bucket(bucket)

            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{bucket}/*"],
                    }
                ],
            }
            self.minio_client.set_bucket_policy(bucket, json.dumps(policy))
        except S3Error as exc:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"MinIO setup failed: {exc.code}") from exc

    def _get_extension(self, content_type: str | None) -> str:
        extension = self.ALLOWED_CONTENT_TYPES.get(content_type or "")
        if not extension:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Allowed: PDF, JPG, PNG, WEBP",
            )
        return extension
