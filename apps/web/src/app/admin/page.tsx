"use client";

import { AppHeader } from "@/components/app-header";
import { AdminReportList } from "@/components/admin/admin-report-list";
import { AdminReportsFilter } from "@/components/admin/admin-reports-filter";
import { useAdminReports } from "@/components/admin/use-admin-reports";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";

export default function AdminPage() {
  const { reports, filter, error, confirmState, acting, setFilter, setConfirmState, action } = useAdminReports();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffe9d8_0%,_#fff8ef_46%,_#fff_100%)]">
      <ConfirmActionDialog
        open={!!confirmState}
        title={confirmState?.type === "approve" ? "Approve this report?" : "Reject this report?"}
        description={
          confirmState?.type === "approve"
            ? "This will finalize the report as APPROVED. Continue?"
            : "This will mark the report as REJECTED and send it back to the user for edits. Continue?"
        }
        confirmLabel={confirmState?.type === "approve" ? "Yes, Approve" : "Yes, Reject"}
        tone={confirmState?.type === "approve" ? "approve" : "reject"}
        busy={acting}
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          if (!confirmState) return;
          action(confirmState.reportId, confirmState.type);
        }}
      />
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-3xl font-black">Admin Review</h1>
          <AdminReportsFilter value={filter} onChange={setFilter} />
        </div>

        {error && <p className="mb-3 text-sm text-rose-700">{error}</p>}

        <AdminReportList
          reports={reports}
          onApprove={(reportId) => setConfirmState({ reportId, type: "approve" })}
          onReject={(reportId) => setConfirmState({ reportId, type: "reject" })}
        />
      </main>
    </div>
  );
}
