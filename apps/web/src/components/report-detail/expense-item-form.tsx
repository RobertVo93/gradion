import { ChangeEvent, FormEvent, RefObject } from "react";

import { ExpenseItem, ReportStatus } from "@/lib/types";

import { ExtractionState } from "./types";

type ExpenseItemFormProps = {
  editingItem: ExpenseItem | null;
  reportStatus: ReportStatus;
  isLocked: boolean;
  amount: string;
  currency: string;
  category: string;
  merchant: string;
  date: string;
  receiptFile: File | null;
  extractionState: ExtractionState;
  error: string;
  receiptInputRef: RefObject<HTMLInputElement | null>;
  onSubmit: (e: FormEvent) => void;
  onAmountChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onMerchantChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onProcessReceipt: () => void;
  onUploadReceipt: () => void;
  onCancelEdit: () => void;
};

export function ExpenseItemForm({
  editingItem,
  reportStatus,
  isLocked,
  amount,
  currency,
  category,
  merchant,
  date,
  receiptFile,
  extractionState,
  error,
  receiptInputRef,
  onSubmit,
  onAmountChange,
  onCurrencyChange,
  onCategoryChange,
  onMerchantChange,
  onDateChange,
  onFileChange,
  onProcessReceipt,
  onUploadReceipt,
  onCancelEdit,
}: ExpenseItemFormProps) {
  const isEditing = !!editingItem;

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-black">{isEditing ? `Edit Item #${editingItem.id}` : "Add New Item"}</h2>
      <p className="mt-1 text-sm text-black/60">
        {isEditing ? "Update values, attach/replace receipt, then save." : "Upload receipt to extract fields, then create item."}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className="rounded-xl border border-black/15 px-4 py-3" placeholder="Amount" type="number" step="0.01" value={amount} onChange={(e) => onAmountChange(e.target.value)} required />
        <input className="rounded-xl border border-black/15 px-4 py-3" placeholder="Currency" value={currency} onChange={(e) => onCurrencyChange(e.target.value)} required />
        <input className="rounded-xl border border-black/15 px-4 py-3" placeholder="Category" value={category} onChange={(e) => onCategoryChange(e.target.value)} required />
        <input className="rounded-xl border border-black/15 px-4 py-3" placeholder="Merchant" value={merchant} onChange={(e) => onMerchantChange(e.target.value)} />
        <input className="rounded-xl border border-black/15 px-4 py-3 sm:col-span-2" type="date" value={date} onChange={(e) => onDateChange(e.target.value)} required />
        <input
          ref={receiptInputRef}
          className="rounded-xl border border-black/15 px-4 py-3 sm:col-span-2"
          type="file"
          accept=".pdf,image/*"
          onChange={(e: ChangeEvent<HTMLInputElement>) => onFileChange(e.target.files?.[0] || null)}
        />
      </div>

      <div className="mt-3 rounded-lg border border-black/10 bg-black/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-wide">AI extraction: {extractionState}</div>

      {!isEditing ? (
        <button
          type="button"
          onClick={onProcessReceipt}
          disabled={!receiptFile || isLocked}
          className="mt-3 w-full rounded-xl border border-black/20 px-4 py-3 text-sm font-bold disabled:opacity-40"
        >
          Process receipt and auto-fill
        </button>
      ) : (
        <button
          type="button"
          onClick={onUploadReceipt}
          disabled={!receiptFile || isLocked}
          className="mt-3 w-full rounded-xl border border-black/20 px-4 py-3 text-sm font-bold disabled:opacity-40"
        >
          Upload / replace receipt on this item
        </button>
      )}

      {reportStatus === "REJECTED" && <p className="mt-2 text-sm text-rose-700">This report was rejected. Click Re-edit to move it back to DRAFT.</p>}
      {(reportStatus === "SUBMITTED" || reportStatus === "APPROVED") && <p className="mt-2 text-sm text-rose-700">This report is locked and cannot be edited.</p>}
      {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button disabled={isLocked} className="w-full rounded-xl bg-black px-4 py-3 font-bold text-white disabled:opacity-40">
          {isEditing ? "Save changes" : "Add item"}
        </button>
        {isEditing && (
          <button type="button" onClick={onCancelEdit} className="rounded-xl border border-black/15 px-4 py-3 font-bold">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
