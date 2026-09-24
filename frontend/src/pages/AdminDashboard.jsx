import { useEffect, useState, useCallback } from "react";
import { api } from "../api/client";

const STATUS_STYLES = {
  open: "bg-current/10 text-current",
  closed: "bg-emerald-100 text-emerald-700",
  manual_review_required: "bg-accent/10 text-accentDark",
  in_progress: "bg-dial/20 text-ink",
};

const PRIORITY_STYLES = {
  high: "bg-red-100 text-red-700",
  medium: "bg-dial/20 text-ink",
  low: "bg-inkline text-muted",
};

function Badge({ children, className }) {
  return (
    <span className={`inline-block text-[11px] font-semibold px-2 py-1 rounded-sm capitalize ${className}`}>
      {children.replace(/_/g, " ")}
    </span>
  );
}

function AdminKeyGate({ onUnlock }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setChecking(true);
    setError("");
    try {
      await api.listTickets(key); // used purely to validate the key
      sessionStorage.setItem("aporum_admin_key", key);
      onUnlock(key);
    } catch (err) {
      setError("That key was rejected. Check AUTOMATION_SECRET in your backend .env.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <form onSubmit={submit} className="bg-surface border border-inkline rounded-md p-8 w-full max-w-sm">
        <h1 className="font-display text-xl font-semibold text-ink">Admin access</h1>
        <p className="text-sm text-muted mt-2">
          Enter your backend's <code className="text-xs bg-paper px-1 py-0.5 rounded">AUTOMATION_SECRET</code> to
          view tickets.
        </p>
        <input
          type="password"
          autoFocus
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Admin key"
          className="mt-5 w-full border border-inkline rounded-sm px-3.5 py-2.5 text-sm focus:border-ink outline-none"
        />
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <button
          type="submit"
          disabled={checking || !key}
          className="mt-4 w-full bg-ink hover:bg-ink/90 disabled:opacity-50 text-white font-semibold py-3 rounded-sm"
        >
          {checking ? "Checking..." : "Unlock dashboard"}
        </button>
      </form>
    </div>
  );
}

function TicketDetail({ ticket, onClose }) {
  if (!ticket) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} />
      <div className="relative bg-surface rounded-md shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-inkline sticky top-0 bg-surface">
          <h3 className="font-display text-lg font-semibold text-ink font-meter">{ticket.ticket_id}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink text-xl px-1">×</button>
        </div>
        <div className="p-6 space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge className={STATUS_STYLES[ticket.status] || "bg-inkline text-ink"}>{ticket.status}</Badge>
            <Badge className={PRIORITY_STYLES[ticket.priority] || "bg-inkline text-ink"}>{ticket.priority} priority</Badge>
            <Badge className="bg-inkline text-ink">{ticket.category}</Badge>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wide">Customer</p>
            <p className="text-ink font-medium">{ticket.customer_name}</p>
            <p className="text-muted">{ticket.email} · {ticket.phone}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wide">Inquiry</p>
            <p className="text-ink whitespace-pre-wrap">{ticket.inquiry_details}</p>
          </div>
          {ticket.ai_confidence !== "" && ticket.ai_confidence !== null && (
            <div>
              <p className="text-muted text-xs uppercase tracking-wide">AI confidence</p>
              <p className="text-ink font-meter">{Number(ticket.ai_confidence).toFixed(2)}</p>
            </div>
          )}
          {ticket.ai_reply && (
            <div>
              <p className="text-muted text-xs uppercase tracking-wide">AI reply sent</p>
              <p className="text-ink whitespace-pre-wrap bg-paper rounded-sm p-3">{ticket.ai_reply}</p>
            </div>
          )}
          {ticket.escalation_reason && (
            <div>
              <p className="text-muted text-xs uppercase tracking-wide">Escalation reason</p>
              <p className="text-ink">{ticket.escalation_reason}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted pt-2 border-t border-inkline">
            <div>
              <p className="uppercase tracking-wide">Created</p>
              <p className="text-ink">{ticket.created_at}</p>
            </div>
            <div>
              <p className="uppercase tracking-wide">Updated</p>
              <p className="text-ink">{ticket.updated_at}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem("aporum_admin_key") || "");
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const load = useCallback(async (key) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await api.listTickets(key);
      setTickets(data);
    } catch (err) {
      setErrorMsg("Couldn't load tickets. Your admin key may have changed on the backend.");
      sessionStorage.removeItem("aporum_admin_key");
      setAdminKey("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminKey) load(adminKey);
  }, [adminKey, load]);

  const runAgentNow = async () => {
    setProcessing(true);
    try {
      const res = await api.processTickets(adminKey);
      setLastRun(res);
      await load(adminKey);
    } catch (err) {
      setErrorMsg("Couldn't run the ticket agent — check the backend logs.");
    } finally {
      setProcessing(false);
    }
  };

  if (!adminKey) {
    return <AdminKeyGate onUnlock={setAdminKey} />;
  }

  const filtered = statusFilter === "all" ? tickets : tickets.filter((t) => t.status === statusFilter);
  const counts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-inkline bg-surface">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold text-ink">Ticket dashboard</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => load(adminKey)}
              disabled={loading}
              className="text-sm font-medium text-ink/80 hover:text-ink px-3 py-2"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={runAgentNow}
              disabled={processing}
              className="bg-accent hover:bg-accentDark disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-sm"
            >
              {processing ? "Running agent..." : "Run AI agent now"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {lastRun && (
          <p className="text-sm text-muted mb-4">
            Last run: processed {lastRun.processed} ticket{lastRun.processed === 1 ? "" : "s"}.
          </p>
        )}
        {errorMsg && <p className="text-sm text-red-600 mb-4">{errorMsg}</p>}

        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "open", "in_progress", "closed", "manual_review_required"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-sm border ${
                statusFilter === s ? "bg-ink text-white border-ink" : "bg-surface text-ink/70 border-inkline"
              }`}
            >
              {s === "all" ? "All" : s.replace(/_/g, " ")} {s !== "all" ? `(${counts[s] || 0})` : `(${tickets.length})`}
            </button>
          ))}
        </div>

        <div className="bg-surface border border-inkline rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper text-left text-muted text-xs uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Confidence</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    {loading ? "Loading..." : "No tickets match this filter."}
                  </td>
                </tr>
              )}
              {filtered
                .slice()
                .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                .map((t) => (
                  <tr
                    key={t.ticket_id}
                    onClick={() => setSelected(t)}
                    className="border-t border-inkline hover:bg-paper cursor-pointer"
                  >
                    <td className="px-4 py-3 font-meter text-xs text-ink">{t.ticket_id}</td>
                    <td className="px-4 py-3 text-ink">{t.customer_name}</td>
                    <td className="px-4 py-3 text-ink/80">{t.category}</td>
                    <td className="px-4 py-3">
                      <Badge className={PRIORITY_STYLES[t.priority] || "bg-inkline text-ink"}>{t.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_STYLES[t.status] || "bg-inkline text-ink"}>{t.status}</Badge>
                    </td>
                    <td className="px-4 py-3 font-meter text-xs text-ink/70">
                      {t.ai_confidence !== "" && t.ai_confidence !== null ? Number(t.ai_confidence).toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3 text-ink/60 text-xs">{t.created_at}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>

      <TicketDetail ticket={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
