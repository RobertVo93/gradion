"use client";

type LoadingOverlayProps = {
  show: boolean;
  label?: string;
};

export function LoadingOverlay({ show, label = "Processing..." }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,12,9,0.45)] backdrop-blur-sm">
      <div className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-white/25 bg-white/95 px-5 py-4 shadow-2xl">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-black/25 border-t-black" />
        <div>
          <p className="text-sm font-black tracking-wide">{label}</p>
          <p className="text-xs text-black/60">Please wait...</p>
        </div>
      </div>
    </div>
  );
}
