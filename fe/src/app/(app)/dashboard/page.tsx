"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  api,
  getActiveWeddingId,
  getStoredUser,
  setActiveWedding,
  type Wedding,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const user = getStoredUser();
    if (user) setUserName(user.fullName.split(" ")[0] ?? "");
    api
      .listWeddings()
      .then((list) => {
        setWeddings(list);
        if (list.length && !getActiveWeddingId()) {
          setActiveWedding(list[0]);
        } else {
          const active = list.find((w) => w.id === getActiveWeddingId());
          if (active) setActiveWedding(active);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  const activeId = getActiveWeddingId();
  const active = weddings.find((w) => w.id === activeId) ?? weddings[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          Hello{userName ? `, ${userName}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your planning hub — pick up where you left off.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {active ? (
        <Card>
          <CardHeader>
            <CardDescription>Active wedding</CardDescription>
            <CardTitle>{active.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="success">{active.membershipRole}</Badge>
            <span>/{active.slug}</span>
            {active.weddingDate && <span>· {active.weddingDate}</span>}
            {active.venue && <span>· {active.venue}</span>}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No wedding yet</CardTitle>
            <CardDescription>
              Create your first wedding to unlock checklist, guests, and crew.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/weddings">Create wedding</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Tasks", href: "/tasks", note: "Checklist coming next in S1" },
          { title: "Guests", href: "/guests", note: "Guest list UI ready for S2" },
          { title: "Weddings", href: "/weddings", note: "Switch or create weddings" },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="rounded-xl border bg-card p-5 transition hover:border-primary/40"
          >
            <h3 className="font-medium">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
