"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearAuth, getStoredUser } from "@/lib/auth";
import { User } from "@/lib/types";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser<User>();

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[rgba(255,251,244,0.93)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/reports" className="text-lg font-black tracking-tight">
          Ledger Forge
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/reports" className={`rounded-full px-3 py-1.5 ${pathname.startsWith("/reports") ? "bg-black text-white" : "hover:bg-black/5"}`}>
            Reports
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className={`rounded-full px-3 py-1.5 ${pathname.startsWith("/admin") ? "bg-black text-white" : "hover:bg-black/5"}`}>
              Admin
            </Link>
          )}
          <button
            onClick={() => {
              clearAuth();
              router.push("/login");
            }}
            className="rounded-full border border-black/20 px-3 py-1.5 hover:bg-black hover:text-white"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
