const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  sendChatMessage: (message, history) =>
    request("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),

  createTicket: ({ name, phone, email, category, inquiry }) =>
    request("/api/tickets", {
      method: "POST",
      body: JSON.stringify({ name, phone, email, category, inquiry }),
    }),

  bookAppointment: ({ name, email, phone, preferred_datetime, duration_minutes, notes }) =>
    request("/api/booking", {
      method: "POST",
      body: JSON.stringify({ name, email, phone, preferred_datetime, duration_minutes, notes }),
    }),

  // --- Admin (requires the shared AUTOMATION_SECRET as an admin key) ---
  listTickets: (adminKey, status) =>
    request(`/api/tickets${status ? `?status=${encodeURIComponent(status)}` : ""}`, {
      headers: { "Content-Type": "application/json", "x-automation-secret": adminKey },
    }),

  processTickets: (adminKey) =>
    request("/api/tickets/process", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-automation-secret": adminKey },
    }),
};
