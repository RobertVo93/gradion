"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { AdminExpenseItemsTable } from "@/components/admin/admin-expense-items-table";
import { AdminReportSummaryCard } from "@/components/admin/admin-report-summary-card";
import { useAdminReportDetail } from "@/components/admin/use-admin-report-detail";
import { AppHeader } from "@/components/app-header";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { LoadingOverlay } from "@/components/loading-overlay";

export default function AdminReportDetailPage() {
  const params = useParams<{ id: string }>();
  const reportId = Number(params.id);
  const { report, items, error, loading, acting, confirmType, resolveReceiptUrl, setConfirmType, confirmAction } = useAdminReportDetail(reportId);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffe9d8_0%,_#fff8ef_46%,_#fff_100%)]">
      <ConfirmActionDialog
        open={confirmType !== null}
        title={confirmType === "approve" ? "Approve this report?" : "Reject this report?"}
        description={
          confirmType === "approve"
            ? "This will finalize the report as APPROVED. Continue?"
            : "This will mark the report as REJECTED and return it to the user for revision. Continue?"
        }
        confirmLabel={confirmType === "approve" ? "Yes, Approve" : "Yes, Reject"}
        tone={confirmType === "approve" ? "approve" : "reject"}
        busy={acting}
        onCancel={() => setConfirmType(null)}
        onConfirm={confirmAction}
      />
      <LoadingOverlay show={loading || acting} label={acting ? "Updating report status..." : "Loading report details..."} />
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-black/50">Admin Review</p>
            <h1 className="text-3xl font-black tracking-tight">Report Detail</h1>
          </div>
          <Link href="/admin" className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm font-bold hover:bg-black hover:!text-white">
            Back to List
          </Link>
        </div>

        {error && <p className="mb-3 text-sm text-rose-700">{error}</p>}

        {report && (
          <AdminReportSummaryCard report={report} acting={acting} onApprove={() => setConfirmType("approve")} onReject={() => setConfirmType("reject")} />
        )}

        <AdminExpenseItemsTable items={items} resolveReceiptUrl={resolveReceiptUrl} />
      </main>
    </div>
  );
}
