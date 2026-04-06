"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/app-header";
import { LoadingOverlay } from "@/components/loading-overlay";
import { StatusBadge } from "@/components/status-badge";
import { apiRequest } from "@/lib/api";
import { getStoredUser, getToken } from "@/lib/auth";
import { ExpenseItem, ReceiptPreviewResponse, ReceiptUploadResponse, Report, User } from "@/lib/types";

type ExtractionState = "idle" | "uploading" | "extracting" | "completed" | "failed";

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const token = getToken();
  const reportId = Number(params.id);

  const [report, setReport] = useState<Report | null>(null);
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [category, setCategory] = useState("Meal");
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [extractionState, setExtractionState] = useState<ExtractionState>("idle");

  const isLocked = useMemo(() => report?.status === "SUBMITTED" || report?.status === "APPROVED", [report]);
  const isProcessingReceipt = extractionState === "uploading" || extractionState === "extracting";

  async function loadAll() {
    if (!token) return;
    const [reportData, itemData] = await Promise.all([
      apiRequest<Report>(`/reports/${reportId}`, { token }),
      apiRequest<ExpenseItem[]>(`/reports/${reportId}/items`, { token }),
    ]);
    setReport(reportData);
    setItems(itemData);
  }

  useEffect(() => {
    const user = getStoredUser<User>();
    if (!token || !user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    loadAll()
      .catch((err) => setError(err instanceof Error ? err.message : "Failed loading report"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  async function onSubmitReport() {
    if (!token) return;
    setError("");
    try {
      const next = await apiRequest<Report>(`/reports/${reportId}/submit`, { method: "POST", token });
      setReport(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    }
  }

  async function onDeleteReport() {
    if (!token) return;
    setError("");
    try {
      await apiRequest(`/reports/${reportId}`, { method: "DELETE", token });
      router.push("/reports");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function addItem(e: FormEvent) {
    e.preventDefault();
    if (!token || isLocked) return;

    try {
      await apiRequest<ExpenseItem>(`/reports/${reportId}/items`, {
        method: "POST",
        token,
        body: JSON.stringify({
          amount: Number(amount),
          currency,
          category,
          merchant_name: merchant || null,
          transaction_date: date,
          receipt_url: null,
        }),
      });

      setAmount("");
      setCurrency("USD");
      setCategory("Meal");
      setMerchant("");
      setDate("");
      setReceiptFile(null);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add item failed");
    }
  }

  async function processReceipt() {
    if (!token || !receiptFile || isLocked) return;
    setError("");
    try {
      setExtractionState("uploading");
      const formData = new FormData();
      formData.append("file", receiptFile);

      setExtractionState("extracting");
      const extracted = await apiRequest<ReceiptPreviewResponse>("/receipts/extract-preview", {
        method: "POST",
        token,
        body: formData,
        headers: {},
      });

      if (extracted.extracted.amount !== null) setAmount(String(extracted.extracted.amount));
      if (extracted.extracted.currency) setCurrency(extracted.extracted.currency);
      if (extracted.extracted.merchant_name) setMerchant(extracted.extracted.merchant_name);
      if (extracted.extracted.transaction_date) setDate(extracted.extracted.transaction_date);

      setExtractionState("completed");
    } catch (err) {
      setExtractionState("failed");
      setError(err instanceof Error ? err.message : "Receipt processing failed");
    }
  }

  async function deleteItem(itemId: number) {
    if (!token || isLocked) return;
    try {
      await apiRequest(`/reports/${reportId}/items/${itemId}`, { method: "DELETE", token });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete item failed");
    }
  }

  if (loading) return <main className="p-6">Loading...</main>;
  if (!report) return <main className="p-6">Report not found</main>;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffe4cf_0%,_#fff8ef_40%,_#fff_100%)]">
      <LoadingOverlay show={isProcessingReceipt} label="Processing receipt with AI" />
      <LoadingOverlay show={loading} label="Loading..." />
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/reports" className="text-sm font-bold underline">← Back to reports</Link>
          <StatusBadge status={report.status} />
        </div>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h1 className="text-3xl font-black">{report.title}</h1>
          <p className="mt-1 text-black/70">{report.description || "No description"}</p>
          <p className="mt-2 text-sm font-bold">Total: ${report.total_amount}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={onSubmitReport} disabled={report.status !== "DRAFT" && report.status !== "REJECTED"} className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Submit</button>
            <button onClick={onDeleteReport} disabled={report.status !== "DRAFT"} className="rounded-lg border border-black/15 px-4 py-2 text-sm font-bold disabled:opacity-40">Delete (Draft only)</button>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Expense Items</h2>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.id} className="rounded-xl border border-black/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold">{item.category} · {item.currency} {item.amount}</p>
                      <p className="text-sm text-black/60">{item.merchant_name || "Unknown merchant"} · {item.transaction_date}</p>
                      {item.receipt_url && <a className="text-xs font-bold underline" href={`${process.env.NEXT_PUBLIC_API_URL}${item.receipt_url}`} target="_blank">View receipt</a>}
                    </div>
                    <button onClick={() => deleteItem(item.id)} disabled={isLocked} className="rounded-md border border-black/15 px-3 py-1 text-xs font-bold disabled:opacity-40">Delete</button>
                  </div>
                </li>
              ))}
              {!items.length && <li className="rounded-xl border border-dashed border-black/20 p-6 text-sm text-black/60">No items yet.</li>}
            </ul>
          </div>

          <form onSubmit={addItem} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Add / Edit Item</h2>
            <p className="mt-1 text-sm text-black/60">Upload receipt to trigger AI extraction state.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input className="rounded-xl border border-black/15 px-4 py-3" placeholder="Amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              <input className="rounded-xl border border-black/15 px-4 py-3" placeholder="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} required />
              <input className="rounded-xl border border-black/15 px-4 py-3" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
              <input className="rounded-xl border border-black/15 px-4 py-3" placeholder="Merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} />
              <input className="rounded-xl border border-black/15 px-4 py-3 sm:col-span-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              <input
                className="rounded-xl border border-black/15 px-4 py-3 sm:col-span-2"
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  setReceiptFile(e.target.files?.[0] || null);
                  setExtractionState("idle");
                }}
              />
            </div>

            <div className="mt-3 rounded-lg border border-black/10 bg-black/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-wide">AI extraction: {extractionState}</div>
            <button
              type="button"
              onClick={processReceipt}
              disabled={!receiptFile || isLocked}
              className="mt-3 w-full rounded-xl border border-black/20 px-4 py-3 text-sm font-bold disabled:opacity-40"
            >
              Process receipt and auto-fill
            </button>

            {isLocked && <p className="mt-2 text-sm text-rose-700">This report is locked and cannot be edited.</p>}
            <p className="mt-2 text-xs text-black/60">Flow: Upload receipt -&gt; Process -&gt; verify autofill -&gt; Add item.</p>
            {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}

            <button disabled={isLocked} className="mt-4 w-full rounded-xl bg-black px-4 py-3 font-bold text-white disabled:opacity-40">Add item</button>
          </form>
        </section>
      </main>
    </div>
  );
}
