"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { useSignupForm } from "@/components/auth/use-signup-form";

export default function SignupPage() {
  const { email, password, error, loading, setEmail, setPassword, onSubmit } = useSignupForm();

  return (
    <AuthShell
      title="Create account"
      subtitle="Signup as standard user."
      footerText="Already have an account?"
      footerActionLabel="Login"
      footerActionHref="/login"
    >
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <input className="w-full rounded-xl border border-black/15 px-4 py-3" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full rounded-xl border border-black/15 px-4 py-3" type="password" placeholder="Min 8 chars" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button className="w-full rounded-xl bg-black px-4 py-3 font-bold text-white disabled:opacity-60" disabled={loading}>{loading ? "Creating..." : "Signup"}</button>
      </form>
    </AuthShell>
  );
}
