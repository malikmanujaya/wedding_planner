"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, getActiveWeddingId, getStoredUser, setActiveWeddingId, Wedding } from "@/lib/api";

export default function DashboardPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const user = typeof window !== "undefined" ? getStoredUser() : null;

  useEffect(() => {
    api
      .listWeddings()
      .then((list) => {
        setWeddings(list);
        if (list.length && !getActiveWeddingId()) {
          setActiveWeddingId(list[0].id);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  const activeId = getActiveWeddingId();
  const active = weddings.find((w) => w.id === activeId) ?? weddings[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Hello{user ? `, ${user.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-[var(--ink-muted)]">
          Foundation is live — auth, weddings, and the app shell.
        </p>
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      {active ? (
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            Active wedding
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl">
            {active.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            /{active.slug}
            {active.weddingDate ? ` · ${active.weddingDate}` : ""}
            {active.venue ? ` · ${active.venue}` : ""}
            {" · "}
            {active.membershipRole}
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl">No wedding yet</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Create your first wedding to unlock checklist, guests, and crew.
          </p>
          <Link
            href="/weddings"
            className="mt-4 inline-block rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
          >
            Create wedding
          </Link>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Tasks", href: "/tasks", note: "Next up in S1" },
          { title: "Guests", href: "/weddings", note: "Coming in S2" },
          { title: "Crew", href: "/weddings", note: "Coming in S1" },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]"
          >
            <h3 className="font-medium">{card.title}</h3>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">{card.note}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
