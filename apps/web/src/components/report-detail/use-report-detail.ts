"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { apiRequest } from "@/lib/api";
import { getStoredUser, getToken } from "@/lib/auth";
import { ExpenseItem, ReceiptPreviewResponse, ReceiptUploadResponse, Report, User } from "@/lib/types";

import { ExtractionState } from "./types";

export function useReportDetail(reportId: number) {
  const router = useRouter();
  const token = getToken();

  const [report, setReport] = useState<Report | null>(null);
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("VND");
  const [category, setCategory] = useState("Meal");
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [extractionState, setExtractionState] = useState<ExtractionState>("idle");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const receiptInputRef = useRef<HTMLInputElement | null>(null);
  const isLocked = useMemo(() => report?.status !== "DRAFT", [report]);
  const editingItem = useMemo(() => items.find((item) => item.id === editingItemId) || null, [editingItemId, items]);
  const reportCurrency = useMemo(() => {
    if (!items.length) return null;
    const firstItem = [...items].sort((a, b) => a.id - b.id)[0];
    return firstItem.currency.toUpperCase();
  }, [items]);
  const isProcessingReceipt = extractionState === "uploading" || extractionState === "extracting";
  const resolveReceiptUrl = useCallback(
    (url: string) => (url.startsWith("http://") || url.startsWith("https://") ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`),
    [],
  );

  const resetForm = useCallback(() => {
    setEditingItemId(null);
    setAmount("");
    setCurrency(reportCurrency ?? "VND");
    setCategory("Meal");
    setMerchant("");
    setDate("");
    setReceiptFile(null);
    setExtractionState("idle");
    if (receiptInputRef.current) receiptInputRef.current.value = "";
  }, [reportCurrency]);

  const startEdit = useCallback((item: ExpenseItem) => {
    setEditingItemId(item.id);
    setAmount(String(item.amount));
    setCurrency((reportCurrency ?? item.currency).toUpperCase());
    setCategory(item.category);
    setMerchant(item.merchant_name || "");
    setDate(item.transaction_date);
    setReceiptFile(null);
    setExtractionState("idle");
    if (receiptInputRef.current) receiptInputRef.current.value = "";
    setError("");
  }, [reportCurrency]);

  const loadAll = useCallback(async () => {
    if (!token) return;
    const [reportData, itemData] = await Promise.all([
      apiRequest<Report>(`/reports/${reportId}`, { token }),
      apiRequest<ExpenseItem[]>(`/reports/${reportId}/items`, { token }),
    ]);
    setReport(reportData);
    setItems(itemData);
  }, [reportId, token]);

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
  }, [loadAll, router, token]);

  useEffect(() => {
    if (editingItemId) return;
    setCurrency(reportCurrency ?? "VND");
  }, [editingItemId, reportCurrency]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(""), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const extractPreview = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest<ReceiptPreviewResponse>("/receipts/extract-preview", {
        method: "POST",
        token,
        body: formData,
        headers: {},
      });
    },
    [token],
  );

  const onSubmitReport = useCallback(async () => {
    if (!token) return;
    setError("");
    try {
      const next = await apiRequest<Report>(`/reports/${reportId}/submit`, { method: "POST", token });
      setReport(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    }
  }, [reportId, token]);

  const onDeleteReport = useCallback(async () => {
    if (!token) return;
    setError("");
    try {
      await apiRequest(`/reports/${reportId}`, { method: "DELETE", token });
      router.push("/reports");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }, [reportId, router, token]);

  const onReeditReport = useCallback(async () => {
    if (!token) return;
    setError("");
    try {
      const next = await apiRequest<Report>(`/reports/${reportId}/reedit`, { method: "POST", token });
      setReport(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Re-edit failed");
    }
  }, [reportId, token]);

  const addItem = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!token || isLocked) return;

      try {
        setLoading(true);
        if (editingItemId) {
          await apiRequest<ExpenseItem>(`/reports/${reportId}/items/${editingItemId}`, {
            method: "PATCH",
            token,
            body: JSON.stringify({
              amount: Number(amount),
              currency: (reportCurrency ?? currency).toUpperCase(),
              category,
              merchant_name: merchant || null,
              transaction_date: date,
            }),
          });
        } else {
          const createdItem = await apiRequest<ExpenseItem>(`/reports/${reportId}/items`, {
            method: "POST",
            token,
            body: JSON.stringify({
              amount: Number(amount),
              currency: (reportCurrency ?? currency).toUpperCase(),
              category,
              merchant_name: merchant || null,
              transaction_date: date,
              receipt_url: null,
            }),
          });

          if (receiptFile) {
            const formData = new FormData();
            formData.append("file", receiptFile);
            await apiRequest<ReceiptUploadResponse>(`/reports/${reportId}/items/${createdItem.id}/receipt`, {
              method: "POST",
              token,
              body: formData,
              headers: {},
            });
          }
        }

        resetForm();
        await loadAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : editingItemId ? "Update item failed" : "Add item failed");
      } finally {
        setLoading(false);
      }
    },
    [amount, category, currency, date, editingItemId, isLocked, loadAll, merchant, receiptFile, reportCurrency, reportId, resetForm, token],
  );

  const processReceipt = useCallback(async () => {
    if (!token || !receiptFile || isLocked || editingItemId) return;
    setError("");
    try {
      setExtractionState("uploading");
      setExtractionState("extracting");
      const extracted = await extractPreview(receiptFile);

      const extractedCurrency = extracted.extracted.currency?.toUpperCase();
      if (reportCurrency && extractedCurrency && extractedCurrency !== reportCurrency) {
        setToastMessage(
          `Your report currency is ${reportCurrency}, so you cannot upload a ${extractedCurrency} receipt.`,
        );
        setExtractionState("failed");
        resetForm();
        return;
      }

      if (extracted.extracted.amount !== null) setAmount(String(extracted.extracted.amount));
      if (extractedCurrency) setCurrency(extractedCurrency);
      if (extracted.extracted.merchant_name) setMerchant(extracted.extracted.merchant_name);
      if (extracted.extracted.transaction_date) setDate(extracted.extracted.transaction_date);

      setExtractionState("completed");
    } catch (err) {
      setExtractionState("failed");
      setError(err instanceof Error ? err.message : "Receipt processing failed");
    }
  }, [editingItemId, extractPreview, isLocked, receiptFile, reportCurrency, token]);

  const uploadReceiptToItem = useCallback(async () => {
    if (!token || !receiptFile || isLocked || !editingItemId) return;
    setError("");
    try {
      setExtractionState("uploading");
      const preview = await extractPreview(receiptFile);
      const extractedCurrency = preview.extracted.currency?.toUpperCase();
      if (reportCurrency && extractedCurrency && extractedCurrency !== reportCurrency) {
        setToastMessage(
          `Your report currency is ${reportCurrency}, so you cannot upload a ${extractedCurrency} receipt.`,
        );
        setExtractionState("failed");
        resetForm();
        return;
      }

      const formData = new FormData();
      formData.append("file", receiptFile);

      setExtractionState("extracting");
      const uploaded = await apiRequest<ReceiptUploadResponse>(`/reports/${reportId}/items/${editingItemId}/receipt`, {
        method: "POST",
        token,
        body: formData,
        headers: {},
      });

      if (uploaded.extracted.amount !== null) setAmount(String(uploaded.extracted.amount));
      if (uploaded.extracted.currency) setCurrency(uploaded.extracted.currency.toUpperCase());
      if (uploaded.extracted.merchant_name) setMerchant(uploaded.extracted.merchant_name);
      if (uploaded.extracted.transaction_date) setDate(uploaded.extracted.transaction_date);

      setExtractionState("completed");
      await loadAll();
    } catch (err) {
      setExtractionState("failed");
      setError(err instanceof Error ? err.message : "Receipt upload failed");
    }
  }, [editingItemId, extractPreview, isLocked, loadAll, receiptFile, reportCurrency, reportId, token]);

  const deleteItem = useCallback(
    async (itemId: number) => {
      if (!token || isLocked) return;
      try {
        await apiRequest(`/reports/${reportId}/items/${itemId}`, { method: "DELETE", token });
        await loadAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete item failed");
      }
    },
    [isLocked, loadAll, reportId, token],
  );

  return {
    report,
    items,
    error,
    loading,
    amount,
    currency,
    reportCurrency,
    category,
    merchant,
    date,
    receiptFile,
    extractionState,
    toastMessage,
    editingItem,
    receiptInputRef,
    isLocked,
    isProcessingReceipt,
    resolveReceiptUrl,
    onSubmitReport,
    onDeleteReport,
    onReeditReport,
    addItem,
    processReceipt,
    uploadReceiptToItem,
    deleteItem,
    startEdit,
    resetForm,
    setAmount,
    setCurrency,
    setCategory,
    setMerchant,
    setDate,
    setReceiptFile,
    setExtractionState,
    setToastMessage,
  };
}
