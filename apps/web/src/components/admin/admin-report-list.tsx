import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { Report } from "@/lib/types";

type AdminReportListProps = {
  reports: Report[];
  onApprove: (reportId: number) => void;
  onReject: (reportId: number) => void;
};

export function AdminReportList({ reports, onApprove, onReject }: AdminReportListProps) {
  return (
    <ul className="space-y-3">
      {reports.map((report) => (
        <li key={report.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold">{report.title}</p>
              <p className="text-sm text-black/60">User #{report.user_id} · Total ${report.total_amount}</p>
            </div>
            <StatusBadge status={report.status} />
          </div>

          <div className="mt-3 flex gap-2">
            <Link href={`/admin/reports/${report.id}`} className="rounded-lg border border-black/20 px-3 py-2 text-sm font-bold hover:bg-black hover:!text-white">
              View Detail
            </Link>
            <button
              disabled={report.status !== "SUBMITTED"}
              onClick={() => onApprove(report.id)}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              Approve
            </button>
            <button
              disabled={report.status !== "SUBMITTED"}
              onClick={() => onReject(report.id)}
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              Reject
            </button>
          </div>
        </li>
      ))}
      {!reports.length && <li className="rounded-xl border border-dashed border-black/20 bg-white p-6 text-sm text-black/60">No reports found.</li>}
    </ul>
  );
}
