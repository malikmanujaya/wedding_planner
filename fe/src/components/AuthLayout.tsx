import Link from "next/link";

export function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(162_40%_88%),transparent_40%),radial-gradient(circle_at_bottom_right,hsl(160_20%_90%),transparent_35%)]" />
      <div className="relative w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <Link href="/" className="font-display text-3xl tracking-tight">
          Aisle
        </Link>
        <h1 className="mt-6 font-display text-2xl tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
