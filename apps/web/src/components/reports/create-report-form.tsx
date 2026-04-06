import { FormEvent } from "react";

type CreateReportFormProps = {
  title: string;
  description: string;
  error: string;
  onSubmit: (e: FormEvent) => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export function CreateReportForm({
  title,
  description,
  error,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
}: CreateReportFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-black/10 bg-white/90 p-5 shadow-sm h-[370px]">
      <h2 className="text-2xl font-black">Create Report</h2>
      <p className="mt-1 text-sm text-black/60">Start from draft, add items, then submit.</p>
      <div className="mt-5 space-y-3">
        <input
          className="w-full rounded-xl border border-black/15 px-4 py-3"
          placeholder="Report title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
        <textarea
          className="h-28 w-full rounded-xl border border-black/15 px-4 py-3"
          placeholder="Description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button className="w-full rounded-xl bg-black px-4 py-3 font-bold text-white">Create</button>
      </div>
    </form>
  );
}
