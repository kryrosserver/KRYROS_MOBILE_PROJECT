import { useState, useEffect } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { API_BASE } from "@/lib/api";

const STORAGE_KEY = "kryros_nl_subscribed";

/** CMS config shape from GET /api/cms/homepage-sections?type=Newsletter */
interface NLConfig {
  heading?: string;
  subheading?: string;
  placeholder?: string;
  button_text?: string;
  popup_image?: string;
  footnote?: string;
}

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<NLConfig>({
    heading: "Signup Today!",
    subheading: "Want exclusive access to discounts & offers on premium brands?",
    placeholder: "Your E-mail",
    button_text: "Submit",
    popup_image: "",
    footnote: "*Limited time offer. Free USPS shipping only.",
  });

  useEffect(() => {
    // Never show again if already subscribed
    if (localStorage.getItem(STORAGE_KEY) === "true") return;

    // Fetch CMS config
    fetch(`${API_BASE}/api/cms/homepage-sections?type=Newsletter`)
      .then((r) => r.json())
      .then((sections: any[]) => {
        const section = Array.isArray(sections) ? sections[0] : null;
        if (section?.config && typeof section.config === "object") {
          setConfig((prev) => ({ ...prev, ...section.config }));
        }
      })
      .catch(() => {});

    // Show popup after 1.5s delay
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      if (res.ok || res.status === 409) {
        // 409 = already subscribed, still mark as subscribed locally
        localStorage.setItem(STORAGE_KEY, "true");
        setDone(true);
        setTimeout(() => setVisible(false), 2800);
      } else {
        const data = await res.json();
        setError(data?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    // X button -> dismiss for this session only
    setVisible(false);
    sessionStorage.setItem("kryros_nl_dismissed", "1");
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)" }}
      onClick={handleDismiss}
    >
      <div
        className="relative w-full bg-white shadow-2xl overflow-hidden"
        style={{
          maxWidth: 360,
          borderRadius: 20,
          animation: "nlPopupIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark navy close button - top right */}
        <button
          onClick={handleDismiss}
          style={{
            position: "absolute", top: 12, right: 12,
            width: 38, height: 38,
            background: "#0E1A35",
            borderRadius: 10,
            border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            zIndex: 20,
            transition: "opacity 0.2s",
          }}
          aria-label="Close newsletter popup"
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <X size={16} color="white" strokeWidth={2.5} />
        </button>

        {done ? (
          /* Success state */
          <div style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg,#1FA89A,#27B9AF)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <CheckCircle size={32} color="white" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0A0F1E", marginBottom: 8 }}>
              You're subscribed!
            </h3>
            <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.55 }}>
              Welcome to KRYROS updates. Check your inbox for a welcome email!
            </p>
          </div>
        ) : (
          <>
            {/* Hero image */}
            {config.popup_image ? (
              <div style={{ width: "100%", height: 290, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                <img
                  src={config.popup_image}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                />
              </div>
            ) : (
              /* Gradient placeholder when no image configured */
              <div style={{
                width: "100%", height: 240,
                background: "linear-gradient(135deg,#1FA89A 0%,#27B9AF 55%,#0E1A35 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m2 7 10 7 10-7"/>
                </svg>
              </div>
            )}

            {/* Form area */}
            <div style={{ padding: "20px 22px 22px", background: "white" }}>
              {/* Subheading */}
              <p style={{ fontSize: 13.5, color: "#5A6578", lineHeight: 1.6, marginBottom: 10, marginRight: 8 }}>
                {config.subheading || "Want exclusive access to discounts & offers on premium brands?"}
              </p>

              {/* Main heading */}
              <h2 style={{
                fontSize: 30, fontWeight: 900, color: "#0A0F1E",
                lineHeight: 1.08, marginBottom: 18, letterSpacing: "-0.5px",
              }}>
                {config.heading || "Signup Today!"}
              </h2>

              {/* Email row */}
              <div style={{
                display: "flex",
                border: "1.5px solid #D1D5DB",
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: error ? 6 : 10,
              }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  placeholder={config.placeholder || "Your E-mail"}
                  style={{
                    flex: 1, padding: "13px 14px",
                    fontSize: 14, color: "#0A0F1E",
                    border: "none", outline: "none",
                    background: "transparent",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  style={{
                    padding: "13px 20px",
                    background: "#0A0F1E",
                    color: "white",
                    fontSize: 14, fontWeight: 700,
                    border: "none", cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                    opacity: loading ? 0.7 : 1,
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#1a2d5a")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#0A0F1E")}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {config.button_text || "Submit"}
                </button>
              </div>

              {error && (
                <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 8 }}>{error}</p>
              )}

              {/* Footnote */}
              {config.footnote && (
                <p style={{ fontSize: 11.5, color: "#9CA3AF", lineHeight: 1.55 }}>
                  {config.footnote}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes nlPopupIn {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
      `}</style>
    </div>
  );
}
