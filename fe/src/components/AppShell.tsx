"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckSquare,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Store,
  Users,
  UsersRound,
  Heart,
  Armchair,
  ScanLine,
  Globe,
  Images,
  Mail,
} from "lucide-react";
import { api, getStoredUser, startAuthSession } from "@/lib/api";
import { cn } from "@/lib/utils";
import { theme } from "@/theme";
import { Toaster } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SIDEBAR_KEY = "wp_sidebar_collapsed";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/weddings", label: "Weddings", icon: Heart },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/crew", label: "Crew", icon: UsersRound },
  { href: "/guests", label: "Guests", icon: Users },
  { href: "/seating", label: "Seating", icon: Armchair },
  { href: "/check-in", label: "Check-in", icon: ScanLine },
  { href: "/vendors", label: "Vendors", icon: Store },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/thank-you", label: "Thank-you card", icon: Mail },
  { href: "/public-page", label: "Public page", icon: Globe },
];

function NavLinks({
  onNavigate,
  collapsed,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex flex-col gap-1", collapsed ? "px-2" : "px-3")}>
      {nav.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center rounded-md text-sm transition-colors",
              collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({
  onNavigate,
  collapsed,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex items-center gap-2 py-5",
          collapsed ? "justify-center px-2" : "px-5"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
          {theme.brand.mark}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display text-lg leading-none text-sidebar-foreground">
              {theme.brand.name}
            </p>
            <p className="text-[11px] text-sidebar-foreground/55">
              {theme.brand.productLine}
            </p>
          </div>
        )}
      </div>
      <Separator className="bg-sidebar-border" />
      <div className="mt-4 flex-1 overflow-y-auto">
        <NavLinks onNavigate={onNavigate} collapsed={collapsed} />
      </div>
      <div className={cn("pb-4", collapsed ? "px-2" : "px-3")}>
        <Link
          href="/"
          onClick={onNavigate}
          title={collapsed ? "Marketing site" : undefined}
          className={cn(
            "flex items-center rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60",
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2"
          )}
        >
          <Home className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Marketing site</span>}
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setName(user.fullName);
    setEmail(user.email);
    startAuthSession();
  }, [router]);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      return next;
    });
  }

  async function logout() {
    await api.logout();
    router.replace("/login");
  }

  if (!name) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      <Toaster />
      <aside
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out md:block",
          collapsed ? "w-[4.5rem]" : "w-64"
        )}
      >
        <SidebarBody collapsed={collapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b bg-card/90 px-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarBody onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>

            <AppBreadcrumb className="min-w-0" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm sm:inline">{name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
