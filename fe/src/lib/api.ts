const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:18080";

/** Resolve uploaded or external image URLs for <img> / CSS. */
export function mediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return url;
}

export type UploadResult = {
  id: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  originalFilename: string;
};

export type Wedding = {
  id: number;
  title: string;
  slug: string;
  weddingDate: string | null;
  venue: string | null;
  inviteCode: string | null;
  membershipRole: string;
};

export type PublicWedding = {
  slug: string;
  title: string;
  coupleNames: string | null;
  weddingDate: string | null;
  venue: string | null;
  story: string | null;
  heroImageUrl: string | null;
  photoUrls: string[];
  publicEnabled: boolean;
};

export type WeddingPublicPage = {
  weddingId: number;
  slug: string;
  title: string;
  coupleNames: string | null;
  weddingDate: string | null;
  venue: string | null;
  story: string | null;
  heroImageUrl: string | null;
  photoUrls: string[];
  publicEnabled: boolean;
};

export type GalleryPhoto = {
  id: number;
  albumId: number;
  uploadId: string | null;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
};

export type GalleryAlbum = {
  id: number;
  title: string;
  description: string | null;
  sortOrder: number;
  publicVisible: boolean;
  photos: GalleryPhoto[];
};

export type WeddingMember = {
  membershipId: number;
  userId: number;
  fullName: string;
  email: string;
  role: string;
  responsibilities: string | null;
};

export type ChecklistTask = {
  id: number;
  weddingId: number;
  title: string;
  notes: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string | null;
  assigneeUserId: number | null;
  assigneeName: string | null;
};

export type Guest = {
  id: number;
  weddingId: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  household: string | null;
  mealPreference: string | null;
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE";
  tags: string | null;
  tableLabel: string | null;
  notes: string | null;
  inviteToken: string | null;
  attendanceStatus: "NOT_ARRIVED" | "ADMITTED" | "REJECTED";
  checkedInAt: string | null;
};

export type PublicInvite = {
  token: string;
  weddingTitle: string;
  weddingDate: string | null;
  venue: string | null;
  guestName: string;
  household: string | null;
  mealPreference: string | null;
  rsvpStatus: Guest["rsvpStatus"];
  tableLabel: string | null;
  seatLabel: string | null;
  seatAssigned: boolean;
  attendanceStatus: Guest["attendanceStatus"];
  checkedInAt: string | null;
};

export type CheckInGuest = {
  id: number;
  fullName: string;
  household: string | null;
  rsvpStatus: Guest["rsvpStatus"];
  tableLabel: string | null;
  seatLabel: string | null;
  inviteToken: string | null;
  attendanceStatus: Guest["attendanceStatus"];
  checkedInAt: string | null;
};

export type VendorPayment = {
  id: number;
  label: string;
  amount: number;
  dueDate: string | null;
  paidDate: string | null;
  status: "PENDING" | "PAID" | "OVERDUE";
};

export type WeddingVendor = {
  id: number;
  weddingId: number;
  name: string;
  category:
    | "DJ"
    | "BAND"
    | "ASHTAKA"
    | "PHOTOGRAPHER"
    | "VIDEOGRAPHER"
    | "CATERER"
    | "FLORIST"
    | "DECORATOR"
    | "MAKEUP"
    | "TRANSPORT"
    | "VENUE"
    | "OTHER";
  status: "PENDING" | "CONTACTED" | "BOOKED" | "CONFIRMED" | "CANCELLED";
  contactName: string | null;
  email: string | null;
  phone: string | null;
  quotedAmount: number | null;
  advanceAmount: number | null;
  totalPaid: number | null;
  remainingAmount: number | null;
  nextDueDate: string | null;
  notes: string | null;
  payments: VendorPayment[];
};

export type AuthUser = {
  userId: number;
  email: string;
  fullName: string;
  token: string;
  refreshToken: string;
  expiresIn: number;
};

type ApiError = {
  error?: string;
  message?: string;
  fields?: Record<string, string>;
};

type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

const ACCESS_REFRESH_BUFFER_MS = 60_000; // refresh 1 min before expiry (14 of 15)

let refreshPromise: Promise<string> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
const waitQueue: QueueItem[] = [];

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wp_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wp_refresh_token");
}

function getExpiresAt(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("wp_token_expires_at");
  return raw ? Number(raw) : null;
}

function flushQueue(error: unknown, token: string | null) {
  const pending = waitQueue.splice(0, waitQueue.length);
  for (const item of pending) {
    if (error || !token) item.reject(error ?? new Error("Session expired"));
    else item.resolve(token);
  }
}

function scheduleProactiveRefresh() {
  if (typeof window === "undefined") return;
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  const expiresAt = getExpiresAt();
  if (!expiresAt || !getRefreshToken()) return;
  const delay = Math.max(5_000, expiresAt - Date.now() - ACCESS_REFRESH_BUFFER_MS);
  refreshTimer = setTimeout(() => {
    refreshAccessToken().catch(() => {
      /* reactive path will handle next 401 */
    });
  }, delay);
}

export function saveAuth(auth: AuthUser) {
  const expiresInSec = auth.expiresIn > 0 ? auth.expiresIn : 900;
  localStorage.setItem("wp_token", auth.token);
  localStorage.setItem("wp_refresh_token", auth.refreshToken);
  localStorage.setItem("wp_token_expires_at", String(Date.now() + expiresInSec * 1000));
  localStorage.setItem(
    "wp_user",
    JSON.stringify({
      userId: auth.userId,
      email: auth.email,
      fullName: auth.fullName,
    })
  );
  scheduleProactiveRefresh();
}

export function clearAuth() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  localStorage.removeItem("wp_token");
  localStorage.removeItem("wp_refresh_token");
  localStorage.removeItem("wp_token_expires_at");
  localStorage.removeItem("wp_user");
  localStorage.removeItem("wp_active_wedding");
}

export function getStoredUser(): Omit<AuthUser, "token" | "refreshToken" | "expiresIn"> | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("wp_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Omit<AuthUser, "token" | "refreshToken" | "expiresIn">;
  } catch {
    return null;
  }
}

export function setActiveWeddingId(id: number) {
  localStorage.setItem("wp_active_wedding", String(id));
}

export function getActiveWeddingId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("wp_active_wedding");
  return raw ? Number(raw) : null;
}

/** Call once after login / on app mount to keep access token fresh. */
export function startAuthSession() {
  scheduleProactiveRefresh();
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token");
    }
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearAuth();
      throw new Error("Session expired. Please log in again.");
    }
    const auth = (await res.json()) as AuthUser;
    saveAuth(auth);
    return auth.token;
  })();

  try {
    const token = await refreshPromise;
    flushQueue(null, token);
    return token;
  } catch (err) {
    flushQueue(err, null);
    throw err;
  } finally {
    refreshPromise = null;
  }
}

function waitForRefresh(): Promise<string> {
  if (refreshPromise) {
    return new Promise((resolve, reject) => {
      waitQueue.push({ resolve, reject });
    });
  }
  return refreshAccessToken();
}

function isAuthPath(path: string) {
  return (
    path.startsWith("/api/auth/login") ||
    path.startsWith("/api/auth/register") ||
    path.startsWith("/api/auth/refresh")
  );
}

async function request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if ((res.status === 401 || res.status === 403) && !retried && !isAuthPath(path)) {
    try {
      const newToken = refreshPromise ? await waitForRefresh() : await refreshAccessToken();
      const retryHeaders = new Headers(init.headers);
      if (!retryHeaders.has("Content-Type") && init.body) {
        retryHeaders.set("Content-Type", "application/json");
      }
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      return request<T>(path, { ...init, headers: retryHeaders }, true);
    } catch {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as ApiError;
      message = body.error || body.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  register(payload: { email: string; password: string; fullName: string }) {
    return request<AuthUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login(payload: { email: string; password: string }) {
    return request<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async logout() {
    const refreshToken = getRefreshToken();
    try {
      await request<void>("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      /* ignore network errors on logout */
    } finally {
      clearAuth();
    }
  },
  me() {
    return request<{ id: number; email: string; fullName: string; globalRole: string }>(
      "/api/auth/me"
    );
  },
  listWeddings() {
    return request<Wedding[]>("/api/weddings");
  },
  createWedding(payload: {
    title: string;
    slug?: string;
    weddingDate?: string;
    venue?: string;
  }) {
    return request<Wedding>("/api/weddings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  uploadFile(
    weddingId: number,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const token = getToken();
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_URL}/api/weddings/${weddingId}/uploads`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable || !onProgress) return;
        onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        try {
          const body = xhr.responseText ? JSON.parse(xhr.responseText) : null;
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(body as UploadResult);
            return;
          }
          reject(new Error(body?.error || body?.message || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      };
      xhr.onerror = () => reject(new Error("Upload failed"));
      const form = new FormData();
      form.append("file", file);
      xhr.send(form);
    });
  },
  getPublicWedding(slug: string) {
    return request<PublicWedding>(`/api/public/weddings/${slug}`);
  },
  lookupPublicRsvp(slug: string, payload: { fullName: string; email?: string }) {
    return request<{
      matched: boolean;
      message: string;
      inviteToken: string | null;
      guestName: string | null;
    }>(`/api/public/weddings/${slug}/rsvp-lookup`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getWeddingPublicPage(weddingId: number) {
    return request<WeddingPublicPage>(`/api/weddings/${weddingId}/public-page`);
  },
  updateWeddingPublicPage(
    weddingId: number,
    payload: {
      coupleNames?: string;
      story?: string;
      heroImageUrl?: string;
      photoUrls?: string[];
      publicEnabled?: boolean;
    }
  ) {
    return request<WeddingPublicPage>(`/api/weddings/${weddingId}/public-page`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  getPublicGallery(slug: string) {
    return request<GalleryAlbum[]>(`/api/public/weddings/${slug}/gallery`);
  },
  listGalleryAlbums(weddingId: number) {
    return request<GalleryAlbum[]>(`/api/weddings/${weddingId}/gallery/albums`);
  },
  createGalleryAlbum(
    weddingId: number,
    payload: {
      title: string;
      description?: string;
      publicVisible?: boolean;
      sortOrder?: number;
    }
  ) {
    return request<GalleryAlbum>(`/api/weddings/${weddingId}/gallery/albums`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateGalleryAlbum(
    weddingId: number,
    albumId: number,
    payload: {
      title: string;
      description?: string;
      publicVisible?: boolean;
      sortOrder?: number;
    }
  ) {
    return request<GalleryAlbum>(`/api/weddings/${weddingId}/gallery/albums/${albumId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteGalleryAlbum(weddingId: number, albumId: number) {
    return request<void>(`/api/weddings/${weddingId}/gallery/albums/${albumId}`, {
      method: "DELETE",
    });
  },
  addGalleryPhoto(
    weddingId: number,
    albumId: number,
    payload: {
      imageUrl: string;
      uploadId?: string;
      caption?: string;
    }
  ) {
    return request<GalleryPhoto>(
      `/api/weddings/${weddingId}/gallery/albums/${albumId}/photos`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
  deleteGalleryPhoto(weddingId: number, photoId: number) {
    return request<void>(`/api/weddings/${weddingId}/gallery/photos/${photoId}`, {
      method: "DELETE",
    });
  },
  listMembers(weddingId: number) {
    return request<WeddingMember[]>(`/api/weddings/${weddingId}/members`);
  },
  listCrew(weddingId: number) {
    return request<WeddingMember[]>(`/api/weddings/${weddingId}/crew`);
  },
  inviteCrew(
    weddingId: number,
    payload: {
      email: string;
      fullName?: string;
      role: "COUPLE" | "CREW" | "VENDOR";
      responsibilities?: string;
    }
  ) {
    return request<{
      member: WeddingMember;
      createdNewUser: boolean;
      tempPassword: string | null;
    }>(`/api/weddings/${weddingId}/crew`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateCrew(
    weddingId: number,
    membershipId: number,
    payload: { role: string; responsibilities?: string }
  ) {
    return request<WeddingMember>(
      `/api/weddings/${weddingId}/crew/${membershipId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
  },
  removeCrew(weddingId: number, membershipId: number) {
    return request<void>(`/api/weddings/${weddingId}/crew/${membershipId}`, {
      method: "DELETE",
    });
  },
  listTasks(weddingId: number) {
    return request<ChecklistTask[]>(`/api/weddings/${weddingId}/tasks`);
  },
  createTask(
    weddingId: number,
    payload: {
      title: string;
      notes?: string;
      status: ChecklistTask["status"];
      dueDate?: string;
      assigneeUserId?: number | null;
    }
  ) {
    return request<ChecklistTask>(`/api/weddings/${weddingId}/tasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateTask(
    weddingId: number,
    taskId: number,
    payload: {
      title: string;
      notes?: string;
      status: ChecklistTask["status"];
      dueDate?: string;
      assigneeUserId?: number | null;
    }
  ) {
    return request<ChecklistTask>(`/api/weddings/${weddingId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteTask(weddingId: number, taskId: number) {
    return request<void>(`/api/weddings/${weddingId}/tasks/${taskId}`, {
      method: "DELETE",
    });
  },
  listGuests(weddingId: number, params?: { q?: string; rsvp?: string }) {
    const search = new URLSearchParams();
    if (params?.q) search.set("q", params.q);
    if (params?.rsvp) search.set("rsvp", params.rsvp);
    const qs = search.toString();
    return request<Guest[]>(
      `/api/weddings/${weddingId}/guests${qs ? `?${qs}` : ""}`
    );
  },
  createGuest(
    weddingId: number,
    payload: {
      fullName: string;
      email?: string;
      phone?: string;
      household?: string;
      mealPreference?: string;
      rsvpStatus: Guest["rsvpStatus"];
      tags?: string;
      tableLabel?: string;
      notes?: string;
    }
  ) {
    return request<Guest>(`/api/weddings/${weddingId}/guests`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateGuest(
    weddingId: number,
    guestId: number,
    payload: {
      fullName: string;
      email?: string;
      phone?: string;
      household?: string;
      mealPreference?: string;
      rsvpStatus: Guest["rsvpStatus"];
      tags?: string;
      tableLabel?: string;
      notes?: string;
    }
  ) {
    return request<Guest>(`/api/weddings/${weddingId}/guests/${guestId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteGuest(weddingId: number, guestId: number) {
    return request<void>(`/api/weddings/${weddingId}/guests/${guestId}`, {
      method: "DELETE",
    });
  },
  ensureGuestInvite(weddingId: number, guestId: number) {
    return request<Guest>(`/api/weddings/${weddingId}/guests/${guestId}/invite`, {
      method: "POST",
    });
  },
  regenerateGuestInvite(weddingId: number, guestId: number) {
    return request<Guest>(
      `/api/weddings/${weddingId}/guests/${guestId}/invite/regenerate`,
      { method: "POST" }
    );
  },
  getPublicInvite(token: string) {
    return request<PublicInvite>(`/api/public/invites/${token}`);
  },
  submitPublicRsvp(
    token: string,
    payload: {
      rsvpStatus: Guest["rsvpStatus"];
      mealPreference?: string;
      notes?: string;
    }
  ) {
    return request<PublicInvite>(`/api/public/invites/${token}/rsvp`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  findSeat(slug: string, payload: { guestName: string; tableLabel: string }) {
    return request<{
      matched: boolean;
      message: string;
      guestName: string | null;
      tableLabel: string | null;
      seatLabel: string | null;
      rsvpStatus: Guest["rsvpStatus"] | null;
      attendanceStatus: Guest["attendanceStatus"] | null;
    }>(`/api/public/weddings/${slug}/seat-finder`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  lookupCheckIn(weddingId: number, params?: { q?: string; token?: string }) {
    const search = new URLSearchParams();
    if (params?.q) search.set("q", params.q);
    if (params?.token) search.set("token", params.token);
    const qs = search.toString();
    return request<CheckInGuest[]>(
      `/api/weddings/${weddingId}/check-in${qs ? `?${qs}` : ""}`
    );
  },
  checkInStats(weddingId: number) {
    return request<{
      totalGuests: number;
      admitted: number;
      rejected: number;
      notArrived: number;
    }>(`/api/weddings/${weddingId}/check-in/stats`);
  },
  checkInGuest(
    weddingId: number,
    guestId: number,
    action: Guest["attendanceStatus"]
  ) {
    return request<CheckInGuest>(`/api/weddings/${weddingId}/check-in/${guestId}`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
  },
  bulkUpdateGuestRsvp(
    weddingId: number,
    guestIds: number[],
    rsvpStatus: Guest["rsvpStatus"]
  ) {
    return request<void>(`/api/weddings/${weddingId}/guests/bulk-rsvp`, {
      method: "PUT",
      body: JSON.stringify({ guestIds, rsvpStatus }),
    });
  },
  async exportGuestsCsv(weddingId: number) {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/weddings/${weddingId}/guests/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Export failed");
    return await res.text();
  },
  async importGuestsCsv(weddingId: number, file: File) {
    const token = getToken();
    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`${API_URL}/api/weddings/${weddingId}/guests/import`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    });
    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try {
        const err = (await res.json()) as ApiError;
        message = err.error || err.message || message;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }
    return (await res.json()) as { imported: number; skipped: number; message: string };
  },
  listVendors(weddingId: number, params?: { category?: string; q?: string }) {
    const search = new URLSearchParams();
    if (params?.category) search.set("category", params.category);
    if (params?.q) search.set("q", params.q);
    const qs = search.toString();
    return request<WeddingVendor[]>(
      `/api/weddings/${weddingId}/vendors${qs ? `?${qs}` : ""}`
    );
  },
  createVendor(
    weddingId: number,
    payload: {
      name: string;
      category: WeddingVendor["category"];
      status: WeddingVendor["status"];
      contactName?: string;
      email?: string;
      phone?: string;
      quotedAmount?: number | null;
      advanceAmount?: number | null;
      advanceDueDate?: string | null;
      remainingDueDate?: string | null;
      notes?: string;
    }
  ) {
    return request<WeddingVendor>(`/api/weddings/${weddingId}/vendors`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateVendor(
    weddingId: number,
    vendorId: number,
    payload: {
      name: string;
      category: WeddingVendor["category"];
      status: WeddingVendor["status"];
      contactName?: string;
      email?: string;
      phone?: string;
      quotedAmount?: number | null;
      advanceAmount?: number | null;
      advanceDueDate?: string | null;
      remainingDueDate?: string | null;
      notes?: string;
    }
  ) {
    return request<WeddingVendor>(`/api/weddings/${weddingId}/vendors/${vendorId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteVendor(weddingId: number, vendorId: number) {
    return request<void>(`/api/weddings/${weddingId}/vendors/${vendorId}`, {
      method: "DELETE",
    });
  },
  markVendorPaymentPaid(weddingId: number, vendorId: number, paymentId: number) {
    return request<VendorPayment>(
      `/api/weddings/${weddingId}/vendors/${vendorId}/payments/${paymentId}/mark-paid`,
      { method: "POST" }
    );
  },
  markVendorPaymentPending(weddingId: number, vendorId: number, paymentId: number) {
    return request<VendorPayment>(
      `/api/weddings/${weddingId}/vendors/${vendorId}/payments/${paymentId}/mark-pending`,
      { method: "POST" }
    );
  },
  getSeating(weddingId: number) {
    return request<{
      weddingId: number;
      plan: unknown;
      version: number;
    }>(`/api/weddings/${weddingId}/seating`);
  },
  saveSeating(
    weddingId: number,
    payload: { plan: unknown; version: number }
  ) {
    return request<{
      weddingId: number;
      plan: unknown;
      version: number;
    }>(`/api/weddings/${weddingId}/seating`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
