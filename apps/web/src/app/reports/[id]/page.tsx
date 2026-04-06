"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AppHeader } from "@/components/app-header";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { LoadingOverlay } from "@/components/loading-overlay";
import { ExpenseItemForm } from "@/components/report-detail/expense-item-form";
import { ExpenseItemsPanel } from "@/components/report-detail/expense-items-panel";
import { ReportActionsCard } from "@/components/report-detail/report-actions-card";
import { ToastMessage } from "@/components/toast-message";
import { useReportDetail } from "@/components/report-detail/use-report-detail";
import { StatusBadge } from "@/components/status-badge";

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const reportId = Number(params.id);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const {
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
  } = useReportDetail(reportId);

  if (loading && !report) return <main className="p-6">Loading report...</main>;
  if (!report) return <main className="p-6">Report not found</main>;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffe4cf_0%,_#fff8ef_40%,_#fff_100%)]">
      <ConfirmActionDialog
        open={confirmDeleteOpen}
        title="Delete this draft report?"
        description="This will permanently delete the draft report and all of its items. This action cannot be undone."
        confirmLabel="Yes, Delete Draft"
        tone="reject"
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          void onDeleteReport();
        }}
      />
      <LoadingOverlay show={isProcessingReceipt} label="Processing receipt with AI" />
      <LoadingOverlay show={loading} label="Loading..." />
      <ToastMessage message={toastMessage} onClose={() => setToastMessage("")} />
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/reports" className="text-sm font-bold underline">← Back to reports</Link>
          <StatusBadge status={report.status} />
        </div>

        <ReportActionsCard
          report={report}
          reportCurrency={reportCurrency}
          onSubmit={onSubmitReport}
          onReedit={onReeditReport}
          onDelete={() => setConfirmDeleteOpen(true)}
        />

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <ExpenseItemsPanel items={items} isLocked={isLocked} onEdit={startEdit} onDelete={deleteItem} resolveReceiptUrl={resolveReceiptUrl} />

          <ExpenseItemForm
            editingItem={editingItem}
            reportStatus={report.status}
            isLocked={isLocked}
            amount={amount}
            currency={currency}
            reportCurrency={reportCurrency}
            category={category}
            merchant={merchant}
            date={date}
            receiptFile={receiptFile}
            extractionState={extractionState}
            error={error}
            receiptInputRef={receiptInputRef}
            onSubmit={addItem}
            onAmountChange={setAmount}
            onCurrencyChange={setCurrency}
            onCategoryChange={setCategory}
            onMerchantChange={setMerchant}
            onDateChange={setDate}
            onFileChange={(file) => {
              setReceiptFile(file);
              setExtractionState("idle");
            }}
            onProcessReceipt={processReceipt}
            onUploadReceipt={uploadReceiptToItem}
            onCancelEdit={resetForm}
          />
        </section>
      </main>
    </div>
  );
}
