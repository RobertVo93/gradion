import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 rounded-full border border-black/20 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]">Gradion Assessment</p>
      <h1 className="text-5xl font-black leading-[1.05] tracking-tight">Expense Reports, built with velocity.</h1>
      <p className="mt-4 max-w-xl text-base text-black/70">Sign in to manage reports and receipts, or use the admin workspace to approve and reject submissions.</p>
      <div className="mt-8 flex gap-3">
        <Link className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white hover:bg-black/80" href="/login">Login</Link>
        <Link className="rounded-full border border-black/20 px-6 py-3 text-sm font-bold hover:bg-black/5" href="/signup">Signup</Link>
      </div>
    </main>
  );
}
