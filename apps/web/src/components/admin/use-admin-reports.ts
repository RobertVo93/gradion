"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api";
import { getStoredUser, getToken } from "@/lib/auth";
import { Report, ReportStatus, User } from "@/lib/types";

type ConfirmState = { reportId: number; type: "approve" | "reject" } | null;

export function useAdminReports() {
  const router = useRouter();
  const token = getToken();

  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<ReportStatus | "ALL">("ALL");
  const [error, setError] = useState("");
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [acting, setActing] = useState(false);

  const loadReports = useCallback(async () => {
    if (!token) return;
    const query = filter === "ALL" ? "" : `?status=${filter}`;
    const data = await apiRequest<Report[]>(`/admin/reports${query}`, { token });
    setReports(data);
  }, [filter, token]);

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
  }, [loadReports, router, token]);

  const action = useCallback(
    async (reportId: number, type: "approve" | "reject") => {
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
    },
    [loadReports, token],
  );

  return {
    reports,
    filter,
    error,
    confirmState,
    acting,
    setFilter,
    setConfirmState,
    action,
  };
}
