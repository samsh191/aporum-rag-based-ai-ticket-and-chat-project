import { useState } from "react";
import Modal from "./Modal";
import { api } from "../api/client";

const CATEGORIES = ["Billing", "Complaint", "Support", "Sales"];

const initialForm = { name: "", phone: "", email: "", category: "Support", inquiry: "" };

export default function InquiryModal({ open, onClose, defaultCategory }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [ticketId, setTicketId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleClose = () => {
    onClose();
    // reset after the close animation would run, if any
    setTimeout(() => {
      setStatus("idle");
      setForm(initialForm);
      setTicketId(null);
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await api.createTicket(form);
      setTicketId(res.ticket_id);
      setStatus("success");
    } catch (err) {
      setErrorMsg("Something went wrong sending your inquiry. Please try again.");
      setStatus("error");
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Send us an inquiry">
      {status === "success" ? (
        <div className="text-center py-4">
          <p className="font-display text-xl font-semibold text-ink">Got it, thanks.</p>
          <p className="text-muted text-sm mt-2">
            Your ticket <span className="font-meter text-ink">{ticketId}</span> has been logged.
            We've emailed a confirmation to {form.email}.
          </p>
          <button
            onClick={handleClose}
            className="mt-6 bg-ink hover:bg-ink/90 text-white font-semibold px-6 py-3 rounded-sm"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              required
              value={form.name}
              onChange={update("name")}
              className="w-full border border-inkline rounded-sm px-3.5 py-2.5 text-sm focus:border-ink outline-none"
              placeholder="Jane Smith"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                required
                value={form.phone}
                onChange={update("phone")}
                className="w-full border border-inkline rounded-sm px-3.5 py-2.5 text-sm focus:border-ink outline-none"
                placeholder="0400 000 000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                className="w-full border border-inkline rounded-sm px-3.5 py-2.5 text-sm focus:border-ink outline-none"
                placeholder="jane@email.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              value={form.category}
              onChange={update("category")}
              className="w-full border border-inkline rounded-sm px-3.5 py-2.5 text-sm focus:border-ink outline-none bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="inquiry">
              Inquiry
            </label>
            <textarea
              id="inquiry"
              required
              rows={4}
              value={form.inquiry}
              onChange={update("inquiry")}
              className="w-full border border-inkline rounded-sm px-3.5 py-2.5 text-sm focus:border-ink outline-none resize-none"
              placeholder="Tell us what's going on..."
            />
          </div>

          {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-accent hover:bg-accentDark disabled:opacity-60 text-white font-semibold py-3 rounded-sm transition-colors"
          >
            {status === "submitting" ? "Sending..." : "Send inquiry"}
          </button>
        </form>
      )}
    </Modal>
  );
}
