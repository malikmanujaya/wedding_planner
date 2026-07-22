/**
 * Aisle design theme — single source of truth for brand, color, assets, and motion.
 * CSS variables in `theme.css` must stay in sync with `colors` below.
 */

export const theme = {
  brand: {
    name: "Aisle",
    mark: "A",
    tagline: "Wedding planning, without the noise.",
    productLine: "Wedding planner",
  },

  copy: {
    homeHeadline: "Every detail. One calm place.",
    homeSupport:
      "Plan with your crew, seat every guest, and run the day — without the spreadsheets and group-chat chaos.",
    homeSectionTitle: "Built for the whole wedding team",
    homeSectionSupport:
      "Couples steer the vision. Crew runs the floor. Guests always know where to go.",
    homeHowTitle: "From “we’re engaged” to “they’re seated”",
    homeHowSupport: "A clear path through planning, invites, and the wedding day itself.",
    homeDayOfTitle: "Day-of tools that actually keep up",
    homeDayOfSupport:
      "Entrance check-in, seat finder, and live attendance — so the floor stays calm when the room fills up.",
    homePublicTitle: "A public page guests actually open",
    homePublicSupport:
      "Countdown, story, gallery, and RSVP — one beautiful link you can share anywhere.",
    homeCtaTitle: "Start with one wedding.",
    homeCtaSupport: "Create your workspace in minutes. Invite crew when you’re ready.",
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to manage your weddings.",
    registerTitle: "Create account",
    registerSubtitle: "Start planning your first wedding.",
    authPanel:
      "Plan checklists, guests, seating, and the day itself — all in one place.",
  },

  /** HSL channels only (no `hsl()` wrapper) — used by CSS vars & Tailwind. */
  colors: {
    background: "150 18% 97%",
    foreground: "160 22% 12%",
    card: "0 0% 100%",
    cardForeground: "160 22% 12%",
    popover: "0 0% 100%",
    popoverForeground: "160 22% 12%",
    primary: "162 42% 28%",
    primaryForeground: "150 30% 98%",
    secondary: "150 14% 93%",
    secondaryForeground: "160 18% 20%",
    muted: "150 12% 93%",
    mutedForeground: "160 8% 42%",
    accent: "162 28% 90%",
    accentForeground: "162 42% 22%",
    destructive: "4 62% 42%",
    destructiveForeground: "0 0% 98%",
    border: "150 12% 86%",
    input: "150 12% 86%",
    ring: "162 42% 28%",
    sidebar: "160 20% 10%",
    sidebarForeground: "150 18% 92%",
    sidebarBorder: "160 14% 18%",
    sidebarAccent: "162 28% 18%",
    sidebarAccentForeground: "150 30% 96%",
    ink: "160 22% 8%",
    mist: "150 22% 94%",
    moss: "162 35% 22%",
  },

  fonts: {
    display: '"Fraunces", Georgia, serif',
    body: '"Source Sans 3", system-ui, sans-serif',
  },

  radius: {
    base: "0.65rem",
  },

  assets: {
    heroImage: "/images/heroImage.avif",
    authImage: "/images/authImage.avif",
    planImage: "/images/planImage.avif",
    seatingImage: "/images/seatingImage.avif",
    dayOfImage: "/images/dayOfImage.avif",
    publicImage: "/images/publicImage.avif",
  },

  capabilities: [
    "Guest list & RSVP",
    "Seating canvas",
    "QR invites",
    "Crew checklists",
    "Vendor tracker",
    "Public microsite",
    "Photo gallery",
    "Entrance check-in",
    "Thank-you cards",
  ] as const,

  features: [
    {
      title: "Plan with your crew",
      body: "Shared checklists, responsibilities, and wedding vendors — everyone sees the same plan.",
      imageKey: "planImage" as const,
    },
    {
      title: "Seat with confidence",
      body: "Drag tables, assign guests, export the floor plan, and put a QR in every invite.",
      imageKey: "seatingImage" as const,
    },
    {
      title: "Share the day",
      body: "A public page with countdown, story, gallery, and RSVP lookup for guests.",
      imageKey: "publicImage" as const,
    },
  ] as const,

  steps: [
    {
      n: "01",
      title: "Create the wedding",
      body: "Set the date, venue, and invite your crew into one shared workspace.",
    },
    {
      n: "02",
      title: "Build the guest world",
      body: "Import guests, track RSVPs, design seating, and send personal invite links.",
    },
    {
      n: "03",
      title: "Run the day",
      body: "Check guests in at the door, find seats instantly, and keep the floor moving.",
    },
  ] as const,

  roles: [
    {
      title: "Couples",
      body: "Own the big picture — guest list, vendors, public page, and thank-yous.",
    },
    {
      title: "Crew",
      body: "Take assigned tasks, run check-in, and keep day-of details off the couple’s phone.",
    },
    {
      title: "Guests",
      body: "RSVP, find their seat, and browse the gallery from one link.",
    },
  ] as const,
} as const;

export type Theme = typeof theme;

/** Helper for inline styles that need a full CSS color. */
export function hsl(channels: string, alpha?: number) {
  if (alpha == null) return `hsl(${channels})`;
  return `hsl(${channels} / ${alpha})`;
}
