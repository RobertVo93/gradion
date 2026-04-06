type ToastMessageProps = {
  message: string;
  onClose: () => void;
};

export function ToastMessage({ message, onClose }: ToastMessageProps) {
  if (!message) return null;

  return (
    <div className="fixed right-4 top-4 z-[70] max-w-md rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <p>{message}</p>
        <button type="button" onClick={onClose} className="text-xs underline">
          Dismiss
        </button>
      </div>
    </div>
  );
}
