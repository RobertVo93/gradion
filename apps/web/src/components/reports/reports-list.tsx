import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { Report } from "@/lib/types";

type ReportsListProps = {
  reports: Report[];
  loading: boolean;
};

export function ReportsList({ reports, loading }: ReportsListProps) {
  if (loading) return <p>Loading...</p>;

  return (
    <ul className="space-y-3">
      {reports.map((report) => (
        <li key={report.id} className="rounded-xl border border-black/10 p-4 hover:bg-black/[0.02]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">{report.title}</h3>
              <p className="text-sm text-black/60">Total: ${report.total_amount}</p>
            </div>
            <StatusBadge status={report.status} />
          </div>
          <div className="mt-3">
            <Link href={`/reports/${report.id}`} className="text-sm font-bold underline">
              Open detail
            </Link>
          </div>
        </li>
      ))}
      {!reports.length && <li className="rounded-xl border border-dashed border-black/20 p-6 text-sm text-black/60">No reports found.</li>}
    </ul>
  );
}
