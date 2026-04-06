"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api";
import { getStoredUser, getToken } from "@/lib/auth";
import { Report, ReportStatus, User } from "@/lib/types";

export function useReportsPage() {
  const router = useRouter();
  const token = getToken();

  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const query = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
      const data = await apiRequest<Report[]>(`/reports${query}`, { token });
      setReports(data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, token]);

  useEffect(() => {
    const user = getStoredUser<User>();
    if (!token || !user) {
      router.push("/login");
      return;
    }

    loadReports()
      .catch((err) => setError(err instanceof Error ? err.message : "Failed loading reports"));
  }, [loadReports, router, token]);

  const createReport = useCallback(
    async (e: FormEvent) => {
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
    },
    [description, loadReports, title, token],
  );

  return {
    reports,
    statusFilter,
    title,
    description,
    error,
    loading,
    setStatusFilter,
    setTitle,
    setDescription,
    createReport,
  };
}
