import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PlansSection from "./components/PlansSection";
import HowItWorks from "./components/HowItWorks";
import AssistantShowcase from "./components/AssistantShowcase";
import BookCallSection from "./components/BookCallSection";
import Footer from "./components/Footer";
import InquiryModal from "./components/InquiryModal";
import BookingModal from "./components/BookingModal";
import ChatWidget from "./components/ChatWidget";
import ChatLauncher from "./components/ChatLauncher";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState("text");

  // Lightweight path-based routing — avoids pulling in react-router for a
  // two-page app. /admin (and /admin/...) renders the dashboard; everything
  // else renders the public site.
  if (window.location.pathname.startsWith("/admin")) {
    return <AdminDashboard />;
  }

  const openChat = (mode = "text") => {
    setChatMode(mode);
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar onInquireClick={() => setInquiryOpen(true)} onBookClick={() => setBookingOpen(true)} />

      <main>
        <Hero
          onCompareClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
          onInquireClick={() => setInquiryOpen(true)}
        />
        <PlansSection onInquireWithPlan={() => setInquiryOpen(true)} />
        <HowItWorks />
        <AssistantShowcase onOpenChat={() => openChat("text")} onOpenVoice={() => openChat("voice")} />
        <BookCallSection onBookClick={() => setBookingOpen(true)} />
      </main>

      <Footer />

      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />

      {chatOpen ? (
        <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} initialMode={chatMode} />
      ) : (
        <ChatLauncher onClick={() => openChat("text")} />
      )}
    </div>
  );
}
