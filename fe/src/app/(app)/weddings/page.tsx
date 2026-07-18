"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  api,
  setActiveWeddingId,
  Wedding,
} from "@/lib/api";

export default function WeddingsPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const list = await api.listWeddings();
    setWeddings(list);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Failed"));
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const created = await api.createWedding({
        title,
        venue: venue || undefined,
        weddingDate: weddingDate || undefined,
      });
      setActiveWeddingId(created.id);
      setTitle("");
      setVenue("");
      setWeddingDate("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Weddings</h1>
        <p className="mt-1 text-[var(--ink-muted)]">
          Multi-wedding tenancy — create and switch contexts.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:grid-cols-2"
      >
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-[var(--ink-muted)]">Title</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nimali & Kasun"
            className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--ink-muted)]">Date</span>
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--ink-muted)]">Venue</span>
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        {error && (
          <p className="text-sm text-[var(--danger)] sm:col-span-2">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white sm:col-span-2 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create wedding"}
        </button>
      </form>

      <ul className="space-y-3">
        {weddings.map((w) => (
          <li
            key={w.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3"
          >
            <div>
              <p className="font-medium">{w.title}</p>
              <p className="text-sm text-[var(--ink-muted)]">
                /{w.slug} · {w.membershipRole}
                {w.weddingDate ? ` · ${w.weddingDate}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveWeddingId(w.id)}
              className="rounded-md border border-[var(--line)] px-3 py-1.5 text-sm hover:bg-[var(--bg)]"
            >
              Set active
            </button>
          </li>
        ))}
        {!weddings.length && (
          <li className="text-sm text-[var(--ink-muted)]">No weddings yet.</li>
        )}
      </ul>
    </div>
  );
}
