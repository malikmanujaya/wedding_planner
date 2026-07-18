"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, saveAuth } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const auth = await api.register({ email, password, fullName });
      saveAuth(auth);
      router.replace("/weddings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8">
        <p className="font-[family-name:var(--font-display)] text-3xl">Aisle</p>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-2xl">
          Create account
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Start planning your first wedding.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--ink-muted)]">Full name</span>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--ink-muted)]">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--ink-muted)]">Password</span>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-sm text-[var(--ink-muted)]">
          Already have an account?{" "}
          <Link className="font-medium text-[var(--accent)] underline" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
