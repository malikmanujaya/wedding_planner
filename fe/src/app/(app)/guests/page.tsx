"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GuestsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Guests</h1>
        <p className="mt-1 text-muted-foreground">
          Guest list table ready for S2 — import/export and RSVP status next.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Guest list</CardTitle>
          <CardDescription>No guests yet.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Household</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead>Meal</TableHead>
                <TableHead>Table</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Guest API arrives in Package A / Sprint 2.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
