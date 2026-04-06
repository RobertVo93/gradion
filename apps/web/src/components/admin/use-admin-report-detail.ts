"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api";
import { getStoredUser, getToken } from "@/lib/auth";
import { ExpenseItem, Report, User } from "@/lib/types";

export function useAdminReportDetail(reportId: number) {
  const router = useRouter();
  const token = getToken();

  const [report, setReport] = useState<Report | null>(null);
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [confirmType, setConfirmType] = useState<"approve" | "reject" | null>(null);

  const isValidReportId = useMemo(() => Number.isFinite(reportId), [reportId]);
  const resolveReceiptUrl = useCallback(
    (url: string) => (url.startsWith("http://") || url.startsWith("https://") ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`),
    [],
  );

  const loadData = useCallback(async () => {
    if (!token || !isValidReportId) return;
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
  }, [isValidReportId, reportId, token]);

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
  }, [loadData, router, token]);

  const action = useCallback(
    async (type: "approve" | "reject") => {
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
    },
    [report, token],
  );

  const confirmAction = useCallback(async () => {
    if (!confirmType) return;
    await action(confirmType);
    setConfirmType(null);
  }, [action, confirmType]);

  return {
    report,
    items,
    error,
    loading,
    acting,
    confirmType,
    resolveReceiptUrl,
    setConfirmType,
    confirmAction,
  };
}
