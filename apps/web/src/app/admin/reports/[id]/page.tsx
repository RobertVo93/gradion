"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/app-header";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { LoadingOverlay } from "@/components/loading-overlay";
import { StatusBadge } from "@/components/status-badge";
import { apiRequest } from "@/lib/api";
import { getStoredUser, getToken } from "@/lib/auth";
import { ExpenseItem, Report, User } from "@/lib/types";

function toCurrency(amount: string, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(amount));
  } catch {
    return `${currency} ${amount}`;
  }
}

export default function AdminReportDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const reportId = useMemo(() => Number(params.id), [params.id]);
  const token = getToken();

  const [report, setReport] = useState<Report | null>(null);
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [confirmType, setConfirmType] = useState<"approve" | "reject" | null>(null);

  async function loadData() {
    if (!token || !Number.isFinite(reportId)) return;
    setLoading(true);
    setError("");
    try {
      const [reportData, itemData] = await Promise.all([
        apiRequest<Report>(`/admin/reports/${reportId}`, { token }),
        apiRequest<ExpenseItem[]>(`/admin/reports/${reportId}/items`, { token }),
      ]);
      setReport(reportData);
      setItems(itemData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report details");
    } finally {
      setLoading(false);
    }
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

    loadData().catch((err) => setError(err instanceof Error ? err.message : "Failed to load report details"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  async function action(type: "approve" | "reject") {
    if (!token || !report) return;
    setActing(true);
    setError("");
    try {
      const updated = await apiRequest<Report>(`/admin/reports/${report.id}/${type}`, { method: "POST", token });
      setReport(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActing(false);
    }
  }

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
        onConfirm={() => {
          if (!confirmType) return;
          action(confirmType).finally(() => setConfirmType(null));
        }}
      />
      <LoadingOverlay show={loading || acting} label={acting ? "Updating report status..." : "Loading report details..."} />
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-black/50">Admin Review</p>
            <h1 className="text-3xl font-black tracking-tight">Report Detail</h1>
          </div>
          <Link href="/admin" className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm font-bold hover:bg-black hover:text-white">
            Back to List
          </Link>
        </div>

        {error && <p className="mb-3 text-sm text-rose-700">{error}</p>}

        {report && (
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
                onClick={() => setConfirmType("approve")}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                Approve
              </button>
              <button
                disabled={report.status !== "SUBMITTED" || acting}
                onClick={() => setConfirmType("reject")}
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          </section>
        )}

        <section className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="border-b border-black/10 px-5 py-3">
            <h3 className="text-lg font-black">Expense Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#fff5eb] text-left text-xs font-bold uppercase tracking-wider text-black/60">
                <tr>
                  <th className="px-4 py-3">Merchant</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-black/10">
                    <td className="px-4 py-3 font-semibold text-black">{item.merchant_name || "-"}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3">{new Date(item.transaction_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-bold">{toCurrency(item.amount, item.currency)}</td>
                    <td className="px-4 py-3">
                      {item.receipt_url ? (
                        <a href={item.receipt_url} target="_blank" rel="noreferrer" className="font-semibold text-sky-700 hover:underline">
                          Open
                        </a>
                      ) : (
                        <span className="text-black/40">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-black/50">
                      No items in this report.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
