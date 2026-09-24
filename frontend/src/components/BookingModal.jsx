import { useState } from "react";
import Modal from "./Modal";
import { api } from "../api/client";

const initialForm = { name: "", email: "", phone: "", date: "", time: "", notes: "" };

// Simple fixed slot list for the demo — swap for a real availability query if needed.
const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

export default function BookingModal({ open, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [eventLink, setEventLink] = useState(null);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStatus("idle");
      setForm(initialForm);
      setEventLink(null);
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const preferred_datetime = `${form.date}T${form.time}:00`;
      const res = await api.bookAppointment({
        name: form.name,
        email: form.email,
        phone: form.phone,
        preferred_datetime,
        duration_minutes: 30,
        notes: form.notes,
      });
      setEventLink(res.event_link);
      setStatus("success");
    } catch (err) {
      setErrorMsg("Couldn't book that slot. Please try again or pick another time.");
      setStatus("error");
    }
  };

  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <Modal open={open} onClose={handleClose} title="Book a call with sales">
      {status === "success" ? (
        <div className="text-center py-4">
          <p className="font-display text-xl font-semibold text-ink">You're booked.</p>
          <p className="text-muted text-sm mt-2">
            A calendar invite and confirmation email are on their way to {form.email}.
          </p>
          {eventLink && (
            <a
              href={eventLink}
              target="_blank"
              rel="noreferrer"
              className="text-current text-sm font-medium underline mt-3 inline-block"
            >
              View in Google Calendar
            </a>
          )}
          <button
            onClick={handleClose}
            className="mt-6 bg-ink hover:bg-ink/90 text-white font-semibold px-6 py-3 rounded-sm block mx-auto"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Name</label>
            <input
              required
              value={form.name}
              onChange={update("name")}
              className="w-full border border-inkline rounded-sm px-3.5 py-2.5 text-sm focus:border-ink outline-none"
              placeholder="Jane Smith"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                className="w-full border border-inkline rounded-sm px-3.5 py-2.5 text-sm focus:border-ink outline-none"
                placeholder="jane@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Phone</label>
              <input
                required
                value={form.phone}
                onChange={update("phone")}
                className="w-full border border-inkline rounded-sm px-3.5 py-2.5 text-sm focus:border-ink outline-none"
                placeholder="0400 000 000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Date</label>
              <input
                type="date"
                required
                min={todayISO}
                value={form.date}
                onChange={update("date")}
                className="w-full border border-inkline rounded-sm px-3.5 py-2.5 text-sm focus:border-ink outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Time</label>
              <select
                required
                value={form.time}
                onChange={update("time")}
                className="w-full border border-inkline rounded-sm px-3.5 py-2.5 text-sm focus:border-ink outline-none bg-white"
              >
                <option value="" disabled>Select</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Notes (optional)</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={update("notes")}
              className="w-full border border-inkline rounded-sm px-3.5 py-2.5 text-sm focus:border-ink outline-none resize-none"
              placeholder="Anything you'd like us to know before the call"
            />
          </div>

          {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-accent hover:bg-accentDark disabled:opacity-60 text-white font-semibold py-3 rounded-sm transition-colors"
          >
            {status === "submitting" ? "Booking..." : "Confirm booking"}
          </button>
        </form>
      )}
    </Modal>
  );
}
