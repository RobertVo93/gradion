import { ExpenseItem } from "@/lib/types";

type AdminExpenseItemsTableProps = {
  items: ExpenseItem[];
  resolveReceiptUrl: (url: string) => string;
};

function toCurrency(amount: string, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(amount));
  } catch {
    return `${currency} ${amount}`;
  }
}

export function AdminExpenseItemsTable({ items, resolveReceiptUrl }: AdminExpenseItemsTableProps) {
  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <div className="border-b border-black/10 px-5 py-3">
        <h3 className="text-lg font-black">Expense Items</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#fff5eb] text-left text-xs font-bold uppercase tracking-wider text-black/60">
            <tr>
              <th className="px-4 py-3">Merchant</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-black/10">
                <td className="px-4 py-3 font-semibold text-black">{item.merchant_name || "-"}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">{new Date(item.transaction_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-bold">{toCurrency(item.amount, item.currency)}</td>
                <td className="px-4 py-3">
                  {item.receipt_url ? (
                    <a href={resolveReceiptUrl(item.receipt_url)} target="_blank" rel="noreferrer" className="font-semibold text-sky-700 hover:underline">
                      Open
                    </a>
                  ) : (
                    <span className="text-black/40">-</span>
                  )}
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-black/50">
                  No items in this report.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
