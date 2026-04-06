from app.models.expense_report import ReportStatus


class ReportStateMachine:
    _TRANSITIONS: dict[ReportStatus, set[ReportStatus]] = {
        ReportStatus.DRAFT: {ReportStatus.SUBMITTED},
        ReportStatus.SUBMITTED: {ReportStatus.APPROVED, ReportStatus.REJECTED},
        ReportStatus.REJECTED: {ReportStatus.SUBMITTED},
        ReportStatus.APPROVED: set(),
    }

    _EDITABLE_STATUSES = {ReportStatus.DRAFT, ReportStatus.REJECTED}

    @classmethod
    def can_transition(cls, current: ReportStatus, target: ReportStatus) -> bool:
        return target in cls._TRANSITIONS[current]

    @classmethod
    def ensure_transition(cls, current: ReportStatus, target: ReportStatus) -> None:
        if not cls.can_transition(current, target):
            raise ValueError(f"Invalid status transition: {current} -> {target}")

    @classmethod
    def is_editable(cls, status: ReportStatus) -> bool:
        return status in cls._EDITABLE_STATUSES
