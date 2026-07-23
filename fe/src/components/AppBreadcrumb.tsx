"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const appNavLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/weddings": "Weddings",
  "/tasks": "Tasks",
  "/crew": "Crew",
  "/guests": "Guests",
  "/seating": "Seating",
  "/check-in": "Check-in",
  "/vendors": "Vendors",
  "/gallery": "Gallery",
  "/thank-you": "Thank-you card",
  "/public-page": "Public page",
  "/admin/users": "Users",
  "/admin/roles": "Roles",
};

function labelForPath(pathname: string) {
  if (appNavLabels[pathname]) return appNavLabels[pathname];
  const match = Object.keys(appNavLabels).find(
    (href) => pathname === href || pathname.startsWith(`${href}/`)
  );
  return match ? appNavLabels[match] : pathname.split("/").filter(Boolean).pop() ?? "App";
}

/**
 * App-area breadcrumb: Home → current page.
 * Place once in AppShell (covers every authenticated page) or use per-page.
 */
export function AppBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  const current = labelForPath(pathname);
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isDashboard ? (
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isDashboard && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{current}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
