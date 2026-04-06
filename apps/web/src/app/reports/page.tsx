"use client";

import { AppHeader } from "@/components/app-header";
import { CreateReportForm } from "@/components/reports/create-report-form";
import { ReportsFilter } from "@/components/reports/reports-filter";
import { ReportsList } from "@/components/reports/reports-list";
import { useReportsPage } from "@/components/reports/use-reports-page";

export default function ReportsPage() {
  const {
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
  } = useReportsPage();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ffe2d2_0%,_#fff8ef_40%,_#fff_100%)]">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-black/10 bg-white/90 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">My Reports</h2>
              <ReportsFilter value={statusFilter} onChange={setStatusFilter} />
            </div>
            <ReportsList reports={reports} loading={loading} />
          </div>

          <CreateReportForm
            title={title}
            description={description}
            error={error}
            onSubmit={createReport}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
          />
        </section>
      </main>
    </div>
  );
}
