import { ExpenseItem } from "@/lib/types";

type ExpenseItemsPanelProps = {
  items: ExpenseItem[];
  isLocked: boolean;
  onEdit: (item: ExpenseItem) => void;
  onDelete: (itemId: number) => void;
  resolveReceiptUrl: (url: string) => string;
};

export function ExpenseItemsPanel({ items, isLocked, onEdit, onDelete, resolveReceiptUrl }: ExpenseItemsPanelProps) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-black">Expense Items</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-black/10 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold">{item.category} · {item.currency} {item.amount}</p>
                <p className="text-sm text-black/60">{item.merchant_name || "Unknown merchant"} · {item.transaction_date}</p>
                {item.receipt_url && (
                  <a className="text-xs font-bold underline" href={resolveReceiptUrl(item.receipt_url)} target="_blank" rel="noreferrer">
                    View receipt
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(item)} disabled={isLocked} className="rounded-md border border-black/15 px-3 py-1 text-xs font-bold disabled:opacity-40">
                  Edit
                </button>
                <button onClick={() => onDelete(item.id)} disabled={isLocked} className="rounded-md border border-black/15 px-3 py-1 text-xs font-bold disabled:opacity-40">
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
        {!items.length && <li className="rounded-xl border border-dashed border-black/20 p-6 text-sm text-black/60">No items yet.</li>}
      </ul>
    </div>
  );
}
