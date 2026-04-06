import Link from "next/link";
import { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerActionLabel: string;
  footerActionHref: string;
  children: ReactNode;
};

export function AuthShell({
  title,
  subtitle,
  footerText,
  footerActionLabel,
  footerActionHref,
  children,
}: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-4xl font-black">{title}</h1>
      <p className="mt-1 text-sm text-black/60">{subtitle}</p>
      {children}
      <p className="mt-4 text-sm text-black/70">
        {footerText}{" "}
        <Link href={footerActionHref} className="font-bold underline">
          {footerActionLabel}
        </Link>
      </p>
    </main>
  );
}
