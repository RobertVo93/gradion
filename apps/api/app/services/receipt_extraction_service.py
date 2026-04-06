import json
from datetime import date
from decimal import Decimal
from pathlib import Path

import httpx

from app.core.config import settings
from app.schemas.receipt import ReceiptExtractedFields


class ReceiptExtractionService:
    def extract(self, file_path: Path, content_type: str | None) -> tuple[str, ReceiptExtractedFields]:
        if settings.openai_api_key:
            extracted = self._extract_with_llm(file_path=file_path, content_type=content_type)
            if extracted:
                return "completed", extracted
        return "completed", self._mock_extract(file_path)

    def _extract_with_llm(self, file_path: Path, content_type: str | None) -> ReceiptExtractedFields | None:
        prompt = (
            "Extract receipt fields into strict JSON with keys: "
            "merchant_name (string|null), amount (number|null), currency (string|null), "
            "transaction_date (YYYY-MM-DD|null). "
            "If unknown, return null."
        )
        file_info = f"filename={file_path.name}; content_type={content_type or 'unknown'}"

        payload = {
            "model": settings.openai_model,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": file_info},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0,
        }

        try:
            response = httpx.post(
                f"{settings.openai_base_url.rstrip('/')}/chat/completions",
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                json=payload,
                timeout=20,
            )
            response.raise_for_status()
            body = response.json()
            raw_content = body["choices"][0]["message"]["content"]
            parsed = json.loads(raw_content)
            return self._to_fields(parsed)
        except Exception:
            return None

    @staticmethod
    def _to_fields(parsed: dict) -> ReceiptExtractedFields:
        amount_raw = parsed.get("amount")
        date_raw = parsed.get("transaction_date")
        return ReceiptExtractedFields(
            merchant_name=parsed.get("merchant_name"),
            amount=Decimal(str(amount_raw)) if amount_raw is not None else None,
            currency=(parsed.get("currency") or None),
            transaction_date=date.fromisoformat(date_raw) if date_raw else None,
        )

    @staticmethod
    def _mock_extract(file_path: Path) -> ReceiptExtractedFields:
        stem = file_path.stem.lower()
        merchant = "Unknown Merchant"
        if "grab" in stem:
            merchant = "Grab"
        elif "starbucks" in stem:
            merchant = "Starbucks"

        return ReceiptExtractedFields(
            merchant_name=merchant,
            amount=None,
            currency="USD",
            transaction_date=None,
        )
