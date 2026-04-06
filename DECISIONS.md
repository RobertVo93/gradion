# Implementation Decisions

## Report Re-Edit Transition

- Decision: `REJECTED -> DRAFT` is explicit and user-triggered.
- Trigger: User clicks **Re-edit** on a rejected report.
- API: `POST /reports/{report_id}/reedit`.
- Rationale: This preserves a clear audit trail and avoids implicit state changes when the user only views or attempts an edit.

## Receipt Extraction Execution

- Decision: Receipt extraction uses an immediate request-response flow.
- Trigger: User uploads/selects a receipt and clicks **Process receipt and auto-fill**.
- Rationale: Simpler UX and implementation for this scope, while still allowing user review and override before saving the item.
