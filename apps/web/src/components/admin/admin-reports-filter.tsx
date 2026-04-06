import { ReportStatus } from "@/lib/types";

type AdminReportsFilterProps = {
  value: ReportStatus | "ALL";
  onChange: (value: ReportStatus | "ALL") => void;
};

export function AdminReportsFilter({ value, onChange }: AdminReportsFilterProps) {
  return (
    <select
      className="rounded-lg border border-black/15 px-3 py-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value as ReportStatus | "ALL")}
    >
      <option value="ALL">All</option>
      <option value="SUBMITTED">Submitted</option>
      <option value="APPROVED">Approved</option>
      <option value="REJECTED">Rejected</option>
      <option value="DRAFT">Draft</option>
    </select>
  );
}
