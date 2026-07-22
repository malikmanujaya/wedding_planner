/**
 * Localization dictionaries for the marketing + auth surfaces.
 * English is authoritative; si (Sinhala) and ta (Tamil) mirror the same shape.
 * Add a locale by extending `locales` and providing a matching dictionary.
 */

export const locales = ["en", "si", "ta"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  si: "සිංහල",
  ta: "தமிழ்",
};

export type Dictionary = {
  nav: {
    product: string;
    how: string;
    dayOf: string;
    signIn: string;
    getStarted: string;
    menu: string;
    language: string;
  };
  hero: {
    headline: string;
    support: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  capabilities: string[];
  product: {
    eyebrow: string;
    title: string;
    support: string;
    features: { title: string; body: string }[];
  };
  how: {
    eyebrow: string;
    title: string;
    support: string;
    steps: { title: string; body: string }[];
  };
  roles: {
    eyebrow: string;
    title: string;
    support: string;
    items: { title: string; body: string }[];
  };
  dayOf: {
    eyebrow: string;
    title: string;
    support: string;
    bullets: string[];
  };
  publicSection: {
    eyebrow: string;
    title: string;
    support: string;
    tags: string[];
  };
  cta: {
    title: string;
    support: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  footer: {
    tagline: string;
    signIn: string;
    getStarted: string;
  };
  auth: {
    backToHome: string;
    panel: string;
    email: string;
    password: string;
    fullName: string;
    loginTitle: string;
    loginSubtitle: string;
    signInBtn: string;
    signingIn: string;
    noAccount: string;
    createOne: string;
    loginFailed: string;
    registerTitle: string;
    registerSubtitle: string;
    createBtn: string;
    creating: string;
    haveAccount: string;
    registerFailed: string;
  };
};

const en: Dictionary = {
  nav: {
    product: "Product",
    how: "How it works",
    dayOf: "Day-of",
    signIn: "Sign in",
    getStarted: "Get started",
    menu: "Menu",
    language: "Language",
  },
  hero: {
    headline: "Every detail. One calm place.",
    support:
      "Plan with your crew, seat every guest, and run the day — without the spreadsheets and group-chat chaos.",
    ctaPrimary: "Start planning free",
    ctaSecondary: "Sign in",
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
  ],
  product: {
    eyebrow: "Product",
    title: "Built for the whole wedding team",
    support: "Couples steer the vision. Crew runs the floor. Guests always know where to go.",
    features: [
      {
        title: "Plan with your crew",
        body: "Shared checklists, responsibilities, and wedding vendors — everyone sees the same plan.",
      },
      {
        title: "Seat with confidence",
        body: "Drag tables, assign guests, export the floor plan, and put a QR in every invite.",
      },
      {
        title: "Share the day",
        body: "A public page with countdown, story, gallery, and RSVP lookup for guests.",
      },
    ],
  },
  how: {
    eyebrow: "How it works",
    title: "From “we’re engaged” to “they’re seated”",
    support: "A clear path through planning, invites, and the wedding day itself.",
    steps: [
      {
        title: "Create the wedding",
        body: "Set the date, venue, and invite your crew into one shared workspace.",
      },
      {
        title: "Build the guest world",
        body: "Import guests, track RSVPs, design seating, and send personal invite links.",
      },
      {
        title: "Run the day",
        body: "Check guests in at the door, find seats instantly, and keep the floor moving.",
      },
    ],
  },
  roles: {
    eyebrow: "Who it’s for",
    title: "Everyone at the table",
    support: "One product that respects how weddings actually get planned — together.",
    items: [
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
    ],
  },
  dayOf: {
    eyebrow: "Day-of",
    title: "Day-of tools that actually keep up",
    support:
      "Entrance check-in, seat finder, and live attendance — so the floor stays calm when the room fills up.",
    bullets: [
      "Tablet check-in for crew at the entrance",
      "Public seat finder by name + table",
      "Live attendance so you know who’s arrived",
    ],
  },
  publicSection: {
    eyebrow: "Guest experience",
    title: "A public page guests actually open",
    support:
      "Countdown, story, gallery, and RSVP — one beautiful link you can share anywhere.",
    tags: ["Countdown", "Our story", "Gallery", "RSVP"],
  },
  cta: {
    title: "Start with one wedding.",
    support: "Create your workspace in minutes. Invite crew when you’re ready.",
    ctaPrimary: "Create account",
    ctaSecondary: "I already have an account",
  },
  footer: {
    tagline: "Wedding planning, without the noise.",
    signIn: "Sign in",
    getStarted: "Get started",
  },
  auth: {
    backToHome: "Back to home",
    panel: "Plan checklists, guests, seating, and the day itself — all in one place.",
    email: "Email",
    password: "Password",
    fullName: "Full name",
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to manage your weddings.",
    signInBtn: "Sign in",
    signingIn: "Signing in…",
    noAccount: "No account?",
    createOne: "Create one",
    loginFailed: "Login failed",
    registerTitle: "Create account",
    registerSubtitle: "Start planning your first wedding.",
    createBtn: "Create account",
    creating: "Creating…",
    haveAccount: "Already have an account?",
    registerFailed: "Registration failed",
  },
};

const si: Dictionary = {
  nav: {
    product: "නිෂ්පාදනය",
    how: "ක්‍රියාත්මක වන ආකාරය",
    dayOf: "විවාහ දිනය",
    signIn: "පිවිසෙන්න",
    getStarted: "ආරම්භ කරන්න",
    menu: "මෙනුව",
    language: "භාෂාව",
  },
  hero: {
    headline: "සෑම විස්තරයක්ම. එක් සන්සුන් තැනක.",
    support:
      "ඔබේ කණ්ඩායම සමඟ සැලසුම් කරන්න, සෑම අමුත්තෙකුටම අසුන් සලසන්න, විවාහ දිනය පහසුවෙන් කළමනාකරණය කරන්න — පැතුරුම්පත් හා කණ්ඩායම් කතාබහේ අවුල් නැතිව.",
    ctaPrimary: "නොමිලේ ආරම්භ කරන්න",
    ctaSecondary: "පිවිසෙන්න",
  },
  capabilities: [
    "අමුත්තන් ලැයිස්තුව සහ RSVP",
    "අසුන් සැලසුම",
    "QR ආරාධනා",
    "කණ්ඩායම් ලැයිස්තු",
    "සැපයුම්කරු ලුහුබැඳීම",
    "පොදු වෙබ් පිටුව",
    "ඡායාරූප ගැලරිය",
    "පිවිසුම් ලියාපදිංචිය",
    "ස්තුති කාඩ්පත්",
  ],
  product: {
    eyebrow: "නිෂ්පාදනය",
    title: "සම්පූර්ණ විවාහ කණ්ඩායම සඳහා නිර්මාණය කර ඇත",
    support:
      "යුවළ දැක්ම මෙහෙයවයි. කණ්ඩායම දිනයේ වැඩ කරයි. අමුත්තන් සැම විටම කොහේ යා යුතුද යැයි දනී.",
    features: [
      {
        title: "ඔබේ කණ්ඩායම සමඟ සැලසුම් කරන්න",
        body: "බෙදාගත් ලැයිස්තු, වගකීම් සහ විවාහ සැපයුම්කරුවන් — සැම දෙනාම එකම සැලසුම දකී.",
      },
      {
        title: "විශ්වාසයෙන් අසුන් සලසන්න",
        body: "මේස ඇද දමන්න, අමුත්තන් වෙන් කරන්න, බිම් සැලැස්ම නිර්යාත කරන්න, සෑම ආරාධනයකම QR එකක් දමන්න.",
      },
      {
        title: "දිනය බෙදාගන්න",
        body: "ගණන් කිරීම, කතාව, ගැලරිය සහ RSVP සහිත පොදු පිටුවක්.",
      },
    ],
  },
  how: {
    eyebrow: "ක්‍රියාත්මක වන ආකාරය",
    title: "“අපි විවාහ ගිවිස ගත්තා” සිට “ඔවුන් අසුන්ගෙන” දක්වා",
    support: "සැලසුම්, ආරාධනා සහ විවාහ දිනය හරහා පැහැදිලි මාර්ගයක්.",
    steps: [
      {
        title: "විවාහය සාදන්න",
        body: "දිනය, ස්ථානය සකසා ඔබේ කණ්ඩායම එක් වැඩබිමකට ආරාධනා කරන්න.",
      },
      {
        title: "අමුත්තන් ලෝකය ගොඩනගන්න",
        body: "අමුත්තන් ආයාත කරන්න, RSVP ලුහුබඳින්න, අසුන් සැලසුම් කර පෞද්ගලික ආරාධනා යවන්න.",
      },
      {
        title: "දිනය මෙහෙයවන්න",
        body: "දොරටුවේදී අමුත්තන් ලියාපදිංචි කරන්න, අසුන් ක්ෂණිකව සොයන්න, දිනය සුමටව පවත්වන්න.",
      },
    ],
  },
  roles: {
    eyebrow: "කාට සඳහාද",
    title: "මේසයේ සිටින සැම දෙනාටම",
    support: "විවාහ ඇත්තෙන්ම සැලසුම් කරන ආකාරයට ගරු කරන එක් නිෂ්පාදනයක් — එකට.",
    items: [
      {
        title: "යුවළ",
        body: "විශාල චිත්‍රය හසුරුවන්න — අමුත්තන්, සැපයුම්කරුවන්, පොදු පිටුව සහ ස්තුති.",
      },
      {
        title: "කණ්ඩායම",
        body: "පවරන ලද කාර්යයන් කරන්න, ලියාපදිංචිය මෙහෙයවන්න, දිනයේ විස්තර යුවළගෙන් ඈත් කරන්න.",
      },
      {
        title: "අමුත්තන්",
        body: "RSVP කරන්න, අසුන සොයන්න, එක් සබැඳියකින් ගැලරිය බලන්න.",
      },
    ],
  },
  dayOf: {
    eyebrow: "විවාහ දිනය",
    title: "ඇත්තටම වේගය පවත්වන දිනයේ මෙවලම්",
    support:
      "පිවිසුම් ලියාපදිංචිය, අසුන් සොයන්නා සහ සජීවී පැමිණීම — ශාලාව පිරෙන විට පවා සන්සුන්ව.",
    bullets: [
      "දොරටුවේදී කණ්ඩායම සඳහා ටැබ්ලට් ලියාපදිංචිය",
      "නම සහ මේසය අනුව පොදු අසුන් සොයන්නා",
      "පැමිණි අය දැනගැනීමට සජීවී පැමිණීම",
    ],
  },
  publicSection: {
    eyebrow: "අමුත්තන්ගේ අත්දැකීම",
    title: "අමුත්තන් ඇත්තටම විවෘත කරන පොදු පිටුවක්",
    support:
      "ගණන් කිරීම, කතාව, ගැලරිය සහ RSVP — ඕනෑම තැනක බෙදාගත හැකි එක් ලස්සන සබැඳියක්.",
    tags: ["ගණන් කිරීම", "අපගේ කතාව", "ගැලරිය", "RSVP"],
  },
  cta: {
    title: "එක් විවාහයකින් ආරම්භ කරන්න.",
    support: "මිනිත්තු කිහිපයකින් ඔබේ වැඩබිම සාදන්න. සූදානම් වූ විට කණ්ඩායම ආරාධනා කරන්න.",
    ctaPrimary: "ගිණුමක් සාදන්න",
    ctaSecondary: "මට දැනටමත් ගිණුමක් ඇත",
  },
  footer: {
    tagline: "අවුලක් නැති විවාහ සැලසුම්කරණය.",
    signIn: "පිවිසෙන්න",
    getStarted: "ආරම්භ කරන්න",
  },
  auth: {
    backToHome: "මුල් පිටුවට",
    panel: "ලැයිස්තු, අමුත්තන්, අසුන් සහ දිනයම — සියල්ල එක තැනක.",
    email: "විද්‍යුත් තැපෑල",
    password: "මුරපදය",
    fullName: "සම්පූර්ණ නම",
    loginTitle: "නැවත සාදරයෙන් පිළිගනිමු",
    loginSubtitle: "ඔබේ විවාහ කළමනාකරණයට පිවිසෙන්න.",
    signInBtn: "පිවිසෙන්න",
    signingIn: "පිවිසෙමින්…",
    noAccount: "ගිණුමක් නැද්ද?",
    createOne: "එකක් සාදන්න",
    loginFailed: "පිවිසීම අසාර්ථකයි",
    registerTitle: "ගිණුමක් සාදන්න",
    registerSubtitle: "ඔබේ පළමු විවාහය සැලසුම් කිරීම ආරම්භ කරන්න.",
    createBtn: "ගිණුමක් සාදන්න",
    creating: "සාදමින්…",
    haveAccount: "දැනටමත් ගිණුමක් තිබේද?",
    registerFailed: "ලියාපදිංචිය අසාර්ථකයි",
  },
};

const ta: Dictionary = {
  nav: {
    product: "தயாரிப்பு",
    how: "இது எப்படி வேலை செய்கிறது",
    dayOf: "திருமண நாள்",
    signIn: "உள்நுழைக",
    getStarted: "தொடங்குங்கள்",
    menu: "பட்டி",
    language: "மொழி",
  },
  hero: {
    headline: "ஒவ்வொரு விவரமும். ஒரே அமைதியான இடம்.",
    support:
      "உங்கள் குழுவுடன் திட்டமிடுங்கள், ஒவ்வொரு விருந்தினருக்கும் இருக்கை ஒதுக்குங்கள், திருமண நாளை எளிதாக நடத்துங்கள் — விரிதாள்கள், குழு அரட்டைக் குழப்பம் இல்லாமல்.",
    ctaPrimary: "இலவசமாகத் தொடங்குங்கள்",
    ctaSecondary: "உள்நுழைக",
  },
  capabilities: [
    "விருந்தினர் பட்டியல் & RSVP",
    "இருக்கை அமைப்பு",
    "QR அழைப்பிதழ்கள்",
    "குழு பணிப்பட்டியல்",
    "விற்பனையாளர் கண்காணிப்பு",
    "பொது இணையதளம்",
    "புகைப்பட தொகுப்பு",
    "நுழைவு பதிவு",
    "நன்றி அட்டைகள்",
  ],
  product: {
    eyebrow: "தயாரிப்பு",
    title: "முழு திருமணக் குழுவிற்காக உருவாக்கப்பட்டது",
    support:
      "தம்பதிகள் பார்வையை வழிநடத்துகிறார்கள். குழு நாளை நடத்துகிறது. விருந்தினர்கள் எங்கு செல்வது என்று எப்போதும் அறிவார்கள்.",
    features: [
      {
        title: "உங்கள் குழுவுடன் திட்டமிடுங்கள்",
        body: "பகிரப்பட்ட பட்டியல்கள், பொறுப்புகள் மற்றும் விற்பனையாளர்கள் — அனைவரும் ஒரே திட்டத்தைப் பார்க்கிறார்கள்.",
      },
      {
        title: "நம்பிக்கையுடன் இருக்கை ஒதுக்குங்கள்",
        body: "மேசைகளை இழுக்கவும், விருந்தினர்களை ஒதுக்கவும், தள வரைபடத்தை ஏற்றுமதி செய்யவும், ஒவ்வொரு அழைப்பிலும் QR சேர்க்கவும்.",
      },
      {
        title: "நாளைப் பகிருங்கள்",
        body: "எண்ணிக்கை, கதை, தொகுப்பு மற்றும் RSVP கொண்ட பொது பக்கம்.",
      },
    ],
  },
  how: {
    eyebrow: "இது எப்படி வேலை செய்கிறது",
    title: "“நிச்சயம் ஆனது” முதல் “அவர்கள் அமர்ந்தார்கள்” வரை",
    support: "திட்டமிடல், அழைப்புகள் மற்றும் திருமண நாள் வழியாக தெளிவான பாதை.",
    steps: [
      {
        title: "திருமணத்தை உருவாக்குங்கள்",
        body: "தேதி, இடத்தை அமைத்து உங்கள் குழுவை ஒரு பணியிடத்திற்கு அழைக்கவும்.",
      },
      {
        title: "விருந்தினர் உலகை உருவாக்குங்கள்",
        body: "விருந்தினர்களை இறக்குமதி செய்யவும், RSVP கண்காணிக்கவும், இருக்கை வடிவமைத்து தனிப்பட்ட அழைப்புகளை அனுப்பவும்.",
      },
      {
        title: "நாளை நடத்துங்கள்",
        body: "வாசலில் விருந்தினர்களைப் பதிவு செய்யவும், இருக்கைகளை உடனடியாகக் கண்டறியவும்.",
      },
    ],
  },
  roles: {
    eyebrow: "யாருக்காக",
    title: "மேசையில் உள்ள அனைவருக்கும்",
    support: "திருமணங்கள் உண்மையில் எப்படி திட்டமிடப்படுகிறதோ அதை மதிக்கும் ஒரு தயாரிப்பு — ஒன்றாக.",
    items: [
      {
        title: "தம்பதிகள்",
        body: "பெரிய படத்தை நிர்வகியுங்கள் — விருந்தினர்கள், விற்பனையாளர்கள், பொது பக்கம், நன்றிகள்.",
      },
      {
        title: "குழு",
        body: "ஒதுக்கப்பட்ட பணிகளை எடுத்து, பதிவை நடத்தி, நாள் விவரங்களை தம்பதியரிடமிருந்து விலக்குங்கள்.",
      },
      {
        title: "விருந்தினர்கள்",
        body: "RSVP செய்யுங்கள், இருக்கையைக் கண்டறியுங்கள், ஒரே இணைப்பில் தொகுப்பைப் பாருங்கள்.",
      },
    ],
  },
  dayOf: {
    eyebrow: "திருமண நாள்",
    title: "உண்மையில் வேகத்தைத் தக்கவைக்கும் நாள் கருவிகள்",
    support:
      "நுழைவு பதிவு, இருக்கை கண்டுபிடிப்பான் மற்றும் நேரடி வருகை — அறை நிரம்பினாலும் அமைதி.",
    bullets: [
      "வாசலில் குழுவிற்கான டேப்லெட் பதிவு",
      "பெயர் + மேசை மூலம் பொது இருக்கை கண்டுபிடிப்பான்",
      "வந்தவர்களை அறிய நேரடி வருகை",
    ],
  },
  publicSection: {
    eyebrow: "விருந்தினர் அனுபவம்",
    title: "விருந்தினர்கள் உண்மையில் திறக்கும் பொது பக்கம்",
    support:
      "எண்ணிக்கை, கதை, தொகுப்பு மற்றும் RSVP — எங்கும் பகிரக்கூடிய அழகான இணைப்பு.",
    tags: ["எண்ணிக்கை", "எங்கள் கதை", "தொகுப்பு", "RSVP"],
  },
  cta: {
    title: "ஒரு திருமணத்துடன் தொடங்குங்கள்.",
    support: "சில நிமிடங்களில் உங்கள் பணியிடத்தை உருவாக்குங்கள். தயாராகும்போது குழுவை அழைக்கவும்.",
    ctaPrimary: "கணக்கை உருவாக்கு",
    ctaSecondary: "என்னிடம் ஏற்கனவே கணக்கு உள்ளது",
  },
  footer: {
    tagline: "குழப்பமில்லாத திருமணத் திட்டமிடல்.",
    signIn: "உள்நுழைக",
    getStarted: "தொடங்குங்கள்",
  },
  auth: {
    backToHome: "முகப்புக்குத் திரும்பு",
    panel: "பட்டியல்கள், விருந்தினர்கள், இருக்கைகள் மற்றும் நாள் — அனைத்தும் ஒரே இடத்தில்.",
    email: "மின்னஞ்சல்",
    password: "கடவுச்சொல்",
    fullName: "முழு பெயர்",
    loginTitle: "மீண்டும் வரவேற்கிறோம்",
    loginSubtitle: "உங்கள் திருமணங்களை நிர்வகிக்க உள்நுழைக.",
    signInBtn: "உள்நுழைக",
    signingIn: "உள்நுழைகிறது…",
    noAccount: "கணக்கு இல்லையா?",
    createOne: "ஒன்றை உருவாக்கு",
    loginFailed: "உள்நுழைவு தோல்வி",
    registerTitle: "கணக்கை உருவாக்கு",
    registerSubtitle: "உங்கள் முதல் திருமணத்தைத் திட்டமிடத் தொடங்குங்கள்.",
    createBtn: "கணக்கை உருவாக்கு",
    creating: "உருவாக்குகிறது…",
    haveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
    registerFailed: "பதிவு தோல்வி",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, si, ta };
