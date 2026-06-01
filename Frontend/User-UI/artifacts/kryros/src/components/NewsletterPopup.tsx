import { useState, useEffect } from "react";
import { X, Mail, CheckCircle, Loader2 } from "lucide-react";
import { API_BASE } from "@/lib/api";

const STORAGE_KEY = "kryros_nl_subscribed";

/** CMS config shape from GET /api/cms/homepage-sections?type=Newsletter */
interface NLConfig {
  heading?: string;
  subheading?: string;
  placeholder?: string;
  button_text?: string;
}

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<NLConfig>({
    heading: "Stay in the Loop with KRYROS",
    subheading: "Subscribe to get exclusive deals, new arrivals, and special offers delivered straight to your inbox.",
    placeholder: "Enter your email address",
    button_text: "Subscribe",
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
    // X button → dismiss for this session only (sessionStorage)
    setVisible(false);
    sessionStorage.setItem("kryros_nl_dismissed", "1");
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Teal gradient accent bar */}
        <div style={{ height: 4, background: "linear-gradient(90deg, #1FA89A, #27B9AF, #1FA89A)" }} />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors z-10"
          aria-label="Close newsletter popup"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="p-6 pt-5">
          {done ? (
            /* Success state */
            <div className="flex flex-col items-center text-center py-4">
              <CheckCircle className="w-12 h-12 text-primary mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">You're subscribed!</h3>
              <p className="text-sm text-muted-foreground">
                Welcome to KRYROS updates. Check your inbox for a welcome email!
              </p>
            </div>
          ) : (
            /* Subscribe form */
            <>
              {/* Mail icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "linear-gradient(135deg, #1FA89A22, #27B9AF11)", border: "1px solid #1FA89A44" }}>
                <Mail className="w-5 h-5 text-primary" />
              </div>

              <h2 className="text-lg font-bold text-foreground mb-1.5 leading-tight pr-6">
                {config.heading || "Stay in the Loop with KRYROS"}
              </h2>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {config.subheading || "Subscribe for exclusive deals and new arrivals."}
              </p>

              {/* Email input */}
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  placeholder={config.placeholder || "Enter your email address"}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-1.5 transition-opacity disabled:opacity-70 flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #1FA89A, #27B9AF)" }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (config.button_text || "Subscribe")}
                </button>
              </div>

              {error && (
                <p className="text-xs text-destructive mt-1">{error}</p>
              )}

              <p className="text-[10px] text-muted-foreground mt-3 text-center">
                No spam, ever. Unsubscribe at any time.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
