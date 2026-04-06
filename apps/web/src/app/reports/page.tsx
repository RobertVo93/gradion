"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { AppHeader } from "@/components/app-header";
import { StatusBadge } from "@/components/status-badge";
import { apiRequest } from "@/lib/api";
import { getStoredUser, getToken } from "@/lib/auth";
import { Report, ReportStatus, User } from "@/lib/types";

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = getToken();

  async function loadReports() {
    if (!token) return;
    const query = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
    const data = await apiRequest<Report[]>(`/reports${query}`, { token });
    setReports(data);
  }

  useEffect(() => {
    const user = getStoredUser<User>();
    if (!token || !user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    loadReports()
      .catch((err) => setError(err instanceof Error ? err.message : "Failed loading reports"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function createReport(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    try {
      await apiRequest<Report>("/reports", {
        method: "POST",
        token,
        body: JSON.stringify({ title, description: description || null }),
      });
      setTitle("");
      setDescription("");
      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create report failed");
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ffe2d2_0%,_#fff8ef_40%,_#fff_100%)]">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-black/10 bg-white/90 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">My Reports</h2>
              <select className="rounded-lg border border-black/15 px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "ALL") }>
                <option value="ALL">All</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="REJECTED">Rejected</option>
                <option value="APPROVED">Approved</option>
              </select>
            </div>
            {loading ? <p>Loading...</p> : (
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
                      <Link href={`/reports/${report.id}`} className="text-sm font-bold underline">Open detail</Link>
                    </div>
                  </li>
                ))}
                {!reports.length && <li className="rounded-xl border border-dashed border-black/20 p-6 text-sm text-black/60">No reports found.</li>}
              </ul>
            )}
          </div>

          <form onSubmit={createReport} className="rounded-2xl border border-black/10 bg-white/90 p-5 shadow-sm">
            <h2 className="text-2xl font-black">Create Report</h2>
            <p className="mt-1 text-sm text-black/60">Start from draft, add items, then submit.</p>
            <div className="mt-5 space-y-3">
              <input className="w-full rounded-xl border border-black/15 px-4 py-3" placeholder="Report title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <textarea className="h-28 w-full rounded-xl border border-black/15 px-4 py-3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              {error && <p className="text-sm text-rose-700">{error}</p>}
              <button className="w-full rounded-xl bg-black px-4 py-3 font-bold text-white">Create</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
