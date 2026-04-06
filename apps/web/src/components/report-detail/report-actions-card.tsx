import { Report } from "@/lib/types";
import { formatTotal } from "@/lib/utils";

type ReportActionsCardProps = {
  report: Report;
  reportCurrency: string | null;
  onSubmit: () => void;
  onReedit: () => void;
  onDelete: () => void;
};

export function ReportActionsCard({ report, reportCurrency, onSubmit, onReedit, onDelete }: ReportActionsCardProps) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h1 className="text-3xl font-black">{report.title}</h1>
      <p className="mt-1 text-black/70">{report.description || "No description"}</p>
      <p className="mt-2 text-sm font-bold">Total: {formatTotal(report.total_amount, reportCurrency)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={onSubmit} hidden={report.status !== "DRAFT"} className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white disabled:opacity-40">
          Submit
        </button>
        <button onClick={onReedit} hidden={report.status !== "REJECTED"} className="rounded-lg border border-black/15 px-4 py-2 text-sm font-bold disabled:opacity-40">
          Re-edit
        </button>
        <button onClick={onDelete} hidden={report.status !== "DRAFT"} className="rounded-lg border border-black/15 px-4 py-2 text-sm font-bold disabled:opacity-40">
          Delete (Draft only)
        </button>
      </div>
    </section>
  );
}
