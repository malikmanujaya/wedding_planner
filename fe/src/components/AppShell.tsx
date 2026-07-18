"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getStoredUser } from "@/lib/api";
import { useEffect, useState } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/weddings", label: "Weddings" },
  { href: "/tasks", label: "Tasks" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setName(user.fullName);
  }, [router]);

  function logout() {
    clearAuth();
    router.replace("/login");
  }

  if (!name) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--ink-muted)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="font-[family-name:var(--font-display)] text-xl tracking-tight">
              Aisle
            </p>
            <p className="text-xs text-[var(--ink-muted)]">Wedding planner</p>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-[var(--ink)] text-[var(--surface)]"
                      : "text-[var(--ink-muted)] hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-[var(--ink-muted)] sm:inline">{name}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-[var(--line)] px-3 py-1.5 hover:bg-[var(--bg)]"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
