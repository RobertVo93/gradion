import { StatusBadge } from "@/components/status-badge";
import { Report } from "@/lib/types";

type AdminReportSummaryCardProps = {
  report: Report;
  acting: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export function AdminReportSummaryCard({ report, acting, onApprove, onReject }: AdminReportSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">{report.title}</h2>
          <p className="mt-1 text-sm text-black/60">Owner User #{report.user_id}</p>
          {report.description && <p className="mt-3 max-w-3xl text-sm text-black/75">{report.description}</p>}
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-black/70 md:grid-cols-3">
        <div className="rounded-xl bg-orange-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-black/45">Total Amount</p>
          <p className="mt-1 text-lg font-black text-black">${report.total_amount}</p>
        </div>
        <div className="rounded-xl bg-orange-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-black/45">Created</p>
          <p className="mt-1 font-semibold text-black">{new Date(report.created_at).toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-orange-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-black/45">Updated</p>
          <p className="mt-1 font-semibold text-black">{new Date(report.updated_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          disabled={report.status !== "SUBMITTED" || acting}
          onClick={onApprove}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
        >
          Approve
        </button>
        <button
          disabled={report.status !== "SUBMITTED" || acting}
          onClick={onReject}
          className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
        >
          Reject
        </button>
      </div>
    </section>
  );
}
