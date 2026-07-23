"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, getActiveWeddingId, setActiveWedding, type Wedding } from "@/lib/api";
import { createWeddingSchema, type CreateWeddingValues } from "@/lib/schemas";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function WeddingsPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CreateWeddingValues>({
    resolver: zodResolver(createWeddingSchema),
    defaultValues: { title: "", weddingDate: "", venue: "" },
  });

  async function load() {
    const list = await api.listWeddings();
    setWeddings(list);
    const activeId = getActiveWeddingId();
    const active = activeId ? list.find((w) => w.id === activeId) : null;
    if (active) setActiveWedding(active);
    else if (list[0] && !activeId) setActiveWedding(list[0]);
  }

  useEffect(() => {
    load().catch((err) => {
      const msg = err instanceof Error ? err.message : "Failed";
      setError(msg);
      toast.error(msg);
    });
  }, []);

  async function onCreate(values: CreateWeddingValues) {
    setError(null);
    try {
      const created = await api.createWedding({
        title: values.title,
        venue: values.venue || undefined,
        weddingDate: values.weddingDate || undefined,
      });
      setActiveWedding(created);
      form.reset({ title: "", weddingDate: "", venue: "" });
      await load();
      toast.success("Wedding created");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Create failed";
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Weddings</h1>
        <p className="mt-1 text-muted-foreground">
          Multi-wedding tenancy — create and switch contexts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create wedding</CardTitle>
          <CardDescription>Title is required. Date and venue are optional.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onCreate)}
              className="grid gap-4 sm:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Nimali & Kasun" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weddingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <FormControl>
                      <Input placeholder="Colombo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p className="text-sm text-destructive sm:col-span-2">{error}</p>
              )}
              <Button
                type="submit"
                className="sm:col-span-2"
                loading={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating…" : "Create wedding"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your weddings</CardTitle>
          <CardDescription>{weddings.length} total</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weddings.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.title}</TableCell>
                  <TableCell className="text-muted-foreground">/{w.slug}</TableCell>
                  <TableCell>{w.weddingDate ?? "—"}</TableCell>
                  <TableCell>{w.venue ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{w.membershipRole}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/w/${w.slug}`} target="_blank">
                          Site
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveWedding(w);
                          toast.success(`Active wedding: ${w.title}`);
                        }}
                      >
                        Set active
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!weddings.length && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No weddings yet. Create one above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
