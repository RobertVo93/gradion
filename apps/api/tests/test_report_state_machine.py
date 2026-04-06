import pytest

from app.models.expense_report import ReportStatus
from app.services.report_state_machine import ReportStateMachine


def test_valid_state_transitions() -> None:
    assert ReportStateMachine.can_transition(ReportStatus.DRAFT, ReportStatus.SUBMITTED)
    assert ReportStateMachine.can_transition(ReportStatus.SUBMITTED, ReportStatus.APPROVED)
    assert ReportStateMachine.can_transition(ReportStatus.SUBMITTED, ReportStatus.REJECTED)
    assert ReportStateMachine.can_transition(ReportStatus.REJECTED, ReportStatus.DRAFT)


def test_invalid_transition_raises() -> None:
    with pytest.raises(ValueError):
        ReportStateMachine.ensure_transition(ReportStatus.DRAFT, ReportStatus.APPROVED)


def test_editable_statuses() -> None:
    assert ReportStateMachine.is_editable(ReportStatus.DRAFT)
    assert not ReportStateMachine.is_editable(ReportStatus.REJECTED)
    assert not ReportStateMachine.is_editable(ReportStatus.SUBMITTED)
    assert not ReportStateMachine.is_editable(ReportStatus.APPROVED)
