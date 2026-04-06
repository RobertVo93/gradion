"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { apiRequest } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { LoginResponse } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("User123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuth(data.access_token, data.user);
      router.push(data.user.role === "admin" ? "/admin" : "/reports");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-4xl font-black">Welcome back</h1>
      <p className="mt-1 text-sm text-black/60">Sign in to continue.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <input className="w-full rounded-xl border border-black/15 px-4 py-3" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full rounded-xl border border-black/15 px-4 py-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button className="w-full rounded-xl bg-black px-4 py-3 font-bold text-white disabled:opacity-60" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      </form>
      <p className="mt-4 text-sm text-black/70">Need an account? <Link href="/signup" className="font-bold underline">Signup</Link></p>
    </main>
  );
}
