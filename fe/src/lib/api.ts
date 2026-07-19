const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:18080";

export type AuthUser = {
  userId: number;
  email: string;
  fullName: string;
  token: string;
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
};

type ApiError = {
  error?: string;
  message?: string;
  fields?: Record<string, string>;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wp_token");
}

export function saveAuth(auth: AuthUser) {
  localStorage.setItem("wp_token", auth.token);
  localStorage.setItem(
    "wp_user",
    JSON.stringify({
      userId: auth.userId,
      email: auth.email,
      fullName: auth.fullName,
    })
  );
}

export function clearAuth() {
  localStorage.removeItem("wp_token");
  localStorage.removeItem("wp_user");
  localStorage.removeItem("wp_active_wedding");
}

export function getStoredUser(): Omit<AuthUser, "token"> | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("wp_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Omit<AuthUser, "token">;
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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
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
};
