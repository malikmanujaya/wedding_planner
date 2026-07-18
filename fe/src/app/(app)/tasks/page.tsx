"use client";

import { Badge } from "@/components/ui/badge";
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

const placeholders = [
  { title: "Book venue", status: "TODO", due: "2026-08-01", assignee: "—" },
  { title: "Send save-the-dates", status: "TODO", due: "2026-08-15", assignee: "—" },
  { title: "Confirm DJ deposit", status: "TODO", due: "2026-09-01", assignee: "—" },
];

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Tasks</h1>
        <p className="mt-1 text-muted-foreground">
          Checklist module UI preview — API wiring is next (A-10 / A-11).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Checklist</CardTitle>
          <CardDescription>
            Sample rows until the Spring checklist endpoints are live.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholders.map((row) => (
                <TableRow key={row.title}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.status}</Badge>
                  </TableCell>
                  <TableCell>{row.due}</TableCell>
                  <TableCell className="text-muted-foreground">{row.assignee}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
