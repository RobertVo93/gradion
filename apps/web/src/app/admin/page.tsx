"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppHeader } from "@/components/app-header";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { StatusBadge } from "@/components/status-badge";
import { apiRequest } from "@/lib/api";
import { getStoredUser, getToken } from "@/lib/auth";
import { Report, ReportStatus, User } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const token = getToken();

  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<ReportStatus | "ALL">("ALL");
  const [error, setError] = useState("");
  const [confirmState, setConfirmState] = useState<{ reportId: number; type: "approve" | "reject" } | null>(null);
  const [acting, setActing] = useState(false);

  async function loadReports() {
    if (!token) return;
    const query = filter === "ALL" ? "" : `?status=${filter}`;
    const data = await apiRequest<Report[]>(`/admin/reports${query}`, { token });
    setReports(data);
  }

  useEffect(() => {
    const user = getStoredUser<User>();
    if (!token || !user) {
      router.push("/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/reports");
      return;
    }

    loadReports().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function action(reportId: number, type: "approve" | "reject") {
    if (!token) return;
    setActing(true);
    try {
      await apiRequest<Report>(`/admin/reports/${reportId}/${type}`, { method: "POST", token });
      await loadReports();
      setConfirmState(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActing(false);
    }
  }

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
          <select className="rounded-lg border border-black/15 px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as ReportStatus | "ALL") }>
            <option value="ALL">All</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        {error && <p className="mb-3 text-sm text-rose-700">{error}</p>}

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
                <Link href={`/admin/reports/${report.id}`} className="rounded-lg border border-black/20 px-3 py-2 text-sm font-bold hover:bg-black hover:text-white">
                  View Detail
                </Link>
                <button disabled={report.status !== "SUBMITTED"} onClick={() => setConfirmState({ reportId: report.id, type: "approve" })} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40">Approve</button>
                <button disabled={report.status !== "SUBMITTED"} onClick={() => setConfirmState({ reportId: report.id, type: "reject" })} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40">Reject</button>
              </div>
            </li>
          ))}
          {!reports.length && <li className="rounded-xl border border-dashed border-black/20 bg-white p-6 text-sm text-black/60">No reports found.</li>}
        </ul>
      </main>
    </div>
  );
}
