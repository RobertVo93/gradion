"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { apiRequest } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-4xl font-black">Create account</h1>
      <p className="mt-1 text-sm text-black/60">Signup as standard user.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <input className="w-full rounded-xl border border-black/15 px-4 py-3" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full rounded-xl border border-black/15 px-4 py-3" type="password" placeholder="Min 8 chars" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button className="w-full rounded-xl bg-black px-4 py-3 font-bold text-white disabled:opacity-60" disabled={loading}>{loading ? "Creating..." : "Signup"}</button>
      </form>
      <p className="mt-4 text-sm text-black/70">Already have an account? <Link href="/login" className="font-bold underline">Login</Link></p>
    </main>
  );
}
