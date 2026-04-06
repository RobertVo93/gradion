import { ReportStatus } from "@/lib/types";

const statusStyles: Record<ReportStatus, string> = {
  DRAFT: "bg-amber-100 text-amber-900 border-amber-300",
  SUBMITTED: "bg-sky-100 text-sky-900 border-sky-300",
  APPROVED: "bg-emerald-100 text-emerald-900 border-emerald-300",
  REJECTED: "bg-rose-100 text-rose-900 border-rose-300",
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
