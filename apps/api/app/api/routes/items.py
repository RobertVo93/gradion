from fastapi import APIRouter, Depends, File, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import Permission, require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.expense_item import ExpenseItemCreateRequest, ExpenseItemResponse, ExpenseItemUpdateRequest
from app.schemas.receipt import ReceiptUploadResponse
from app.services.expense_item_service import ExpenseItemService

router = APIRouter(prefix="/reports", tags=["expense-items"])


@router.get("/{report_id}/items", response_model=list[ExpenseItemResponse])
def list_items(
    report_id: int,
    current_user: User = Depends(require_permission(Permission.EXPENSE_ITEM_READ, "own")),
    db: Session = Depends(get_db),
) -> list[ExpenseItemResponse]:
    items = ExpenseItemService(db).list_items(report_id=report_id, current_user=current_user)
    return [ExpenseItemResponse.model_validate(item) for item in items]


@router.post("/{report_id}/items", response_model=ExpenseItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    report_id: int,
    payload: ExpenseItemCreateRequest,
    current_user: User = Depends(require_permission(Permission.EXPENSE_ITEM_CREATE, "own")),
    db: Session = Depends(get_db),
) -> ExpenseItemResponse:
    item = ExpenseItemService(db).create_item(report_id=report_id, payload=payload, current_user=current_user)
    return ExpenseItemResponse.model_validate(item)


@router.patch("/{report_id}/items/{item_id}", response_model=ExpenseItemResponse)
def update_item(
    report_id: int,
    item_id: int,
    payload: ExpenseItemUpdateRequest,
    current_user: User = Depends(require_permission(Permission.EXPENSE_ITEM_UPDATE, "own")),
    db: Session = Depends(get_db),
) -> ExpenseItemResponse:
    item = ExpenseItemService(db).update_item(
        report_id=report_id,
        item_id=item_id,
        payload=payload,
        current_user=current_user,
    )
    return ExpenseItemResponse.model_validate(item)


@router.delete("/{report_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    report_id: int,
    item_id: int,
    current_user: User = Depends(require_permission(Permission.EXPENSE_ITEM_DELETE, "own")),
    db: Session = Depends(get_db),
) -> Response:
    ExpenseItemService(db).delete_item(report_id=report_id, item_id=item_id, current_user=current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{report_id}/items/{item_id}/receipt", response_model=ReceiptUploadResponse)
async def upload_receipt(
    report_id: int,
    item_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_permission(Permission.EXPENSE_ITEM_UPDATE, "own")),
    db: Session = Depends(get_db),
) -> ReceiptUploadResponse:
    return await ExpenseItemService(db).upload_receipt(
        report_id=report_id,
        item_id=item_id,
        file=file,
        current_user=current_user,
    )
