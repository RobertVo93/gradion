"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { useLoginForm } from "@/components/auth/use-login-form";

export default function LoginPage() {
  const { email, password, error, loading, setEmail, setPassword, onSubmit } = useLoginForm();

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue."
      footerText="Need an account?"
      footerActionLabel="Signup"
      footerActionHref="/signup"
    >
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <input className="w-full rounded-xl border border-black/15 px-4 py-3" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full rounded-xl border border-black/15 px-4 py-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button className="w-full rounded-xl bg-black px-4 py-3 font-bold text-white disabled:opacity-60" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      </form>
    </AuthShell>
  );
}
