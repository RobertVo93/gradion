"use client";

type ConfirmActionDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone: "approve" | "reject";
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel,
  tone,
  busy = false,
  onCancel,
  onConfirm,
}: ConfirmActionDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(16,12,8,0.5)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-black/15 bg-white p-5 shadow-2xl">
        <h3 className="text-xl font-black tracking-tight">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-black/70">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-black/20 px-3 py-2 text-sm font-bold hover:bg-black hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-lg px-3 py-2 text-sm font-bold text-white disabled:opacity-50 ${
              tone === "approve" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {busy ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
