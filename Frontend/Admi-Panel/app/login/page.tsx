"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider } from "@/contexts/auth-context";
import { Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";

function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");

  // 2FA state
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [twoFaToken, setTwoFaToken] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState("");

  const { login, completeTwoFactor, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentifierError(""); setPasswordError(""); setLoginError(""); setCaptchaError(false);
    let hasError = false;
    if (!identifier.trim()) { setIdentifierError("Please enter username"); hasError = true; }
    if (!password) { setPasswordError("Please enter password"); hasError = true; }
    if (!captchaChecked) { setCaptchaError(true); hasError = true; }
    if (hasError) return;
    setLoading(true);
    const result = await login(identifier, password);
    if (result.requiresTwoFactor && result.twoFactorToken) {
      // 2FA required — switch to code entry screen
      setTwoFaToken(result.twoFactorToken);
      setStep("2fa");
    } else if (!result.success) {
      setLoginError("Invalid credentials. Please try again.");
    }
    setLoading(false);
  };

  const handle2faVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFaCode.length !== 6) { setTwoFaError("Enter the 6-digit code from your authenticator app"); return; }
    setTwoFaLoading(true);
    setTwoFaError("");
    const ok = await completeTwoFactor(twoFaCode, twoFaToken);
    if (!ok) setTwoFaError("Invalid code. Please try again — codes refresh every 30 seconds.");
    setTwoFaLoading(false);
  };

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "16px 15px", fontSize: "14.5px",
    background: "#FFFFFF", border: "1.5px solid #C8D3E0", borderRadius: "5px",
    outline: "none", color: "#334155", fontFamily: "inherit",
    boxSizing: "border-box", transition: "border-color 0.15s",
  };
  const errStyle: React.CSSProperties = { color: "#EF4444", fontSize: "13px", margin: "5px 0 8px", fontWeight: 500 };

  return (
    <div style={{
      minHeight: "100vh", background: "#EDF1F8",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "32px 20px 48px",
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "22px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", position: "relative" }}>
          <div style={{ width: "10px", height: "10px", background: "#F59E0B", borderRadius: "2px", position: "absolute", top: "2px", left: "-4px" }} />
          <span style={{ fontSize: "38px", fontWeight: 800, color: "#1FA89A", letterSpacing: "-0.5px", lineHeight: 1 }}>KRYROS</span>
        </div>
        <p style={{ fontSize: "10.5px", color: "#94A3B8", letterSpacing: "3.5px", textTransform: "uppercase", marginTop: "5px" }}>
          Admin Portal
        </p>
      </div>

      {/* ── STEP 1: Credentials ─────────────────────────────────────────────── */}
      {step === "credentials" && (
        <>
          <h1 style={{ fontSize: "24px", fontWeight: 400, color: "#1E293B", margin: "0 0 26px", textAlign: "center", letterSpacing: "-0.2px" }}>
            Login to access Dashboard
          </h1>
          <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "460px" }} noValidate>
            <input type="text" value={identifier}
              onChange={e => { setIdentifier(e.target.value); setIdentifierError(""); setLoginError(""); }}
              placeholder="Username, Email or Mobile Number" autoComplete="username" style={inputBase}
              onFocus={e => e.target.style.borderColor = "#1FA89A"} onBlur={e => e.target.style.borderColor = "#C8D3E0"} />
            {identifierError && <p style={errStyle}>{identifierError}</p>}

            <div style={{ position: "relative", marginTop: identifierError ? "0" : "8px" }}>
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError(""); setLoginError(""); }}
                placeholder="Password" autoComplete="current-password" style={{ ...inputBase, paddingRight: "48px" }}
                onFocus={e => e.target.style.borderColor = "#1FA89A"} onBlur={e => e.target.style.borderColor = "#C8D3E0"} />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", alignItems: "center", padding: "4px" }}>
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {passwordError && <p style={errStyle}>{passwordError}</p>}

            {/* reCAPTCHA */}
            <div style={{ display: "flex", justifyContent: "center", margin: "18px 0" }}>
              <div style={{ background: "#F4F7FB", border: `1.5px solid ${captchaError ? "#EF4444" : "#C8D3E0"}`, borderRadius: "4px", padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", width: "300px", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div onClick={() => { setCaptchaChecked(v => !v); setCaptchaError(false); }} role="checkbox" aria-checked={captchaChecked} tabIndex={0}
                    onKeyDown={e => { if (e.key === " " || e.key === "Enter") { setCaptchaChecked(v => !v); setCaptchaError(false); }}}
                    style={{ width: "24px", height: "24px", border: `2px solid ${captchaChecked ? "#1FA89A" : "#9CA3AF"}`, borderRadius: "2px", cursor: "pointer", background: captchaChecked ? "#1FA89A" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                    {captchaChecked && (<svg viewBox="0 0 12 10" width="13" height="13" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
                  </div>
                  <span style={{ fontSize: "14px", color: "#334155", userSelect: "none" }}>I&apos;m not a robot</span>
                </div>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                    <path d="M32 6L54 18V46L32 58L10 46V18L32 6Z" fill="#1FA89A" opacity="0.15"/>
                    <path d="M32 6L54 18V46L32 58L10 46V18L32 6Z" stroke="#1FA89A" strokeWidth="3.5"/>
                    <circle cx="32" cy="32" r="9" fill="#1FA89A" opacity="0.55"/>
                    <polygon points="38,24 43,32 35,32" fill="#1FA89A"/>
                  </svg>
                  <p style={{ fontSize: "8.5px", color: "#94A3B8", lineHeight: 1.4, marginTop: "3px" }}>reCAPTCHA<br/><span style={{ fontSize: "7.5px" }}>Privacy · Terms</span></p>
                </div>
              </div>
            </div>
            {captchaError && <p style={{ ...errStyle, textAlign: "center", margin: "-10px 0 12px" }}>Please verify you are not a robot</p>}
            {loginError && <p style={{ ...errStyle, textAlign: "center" }}>{loginError}</p>}

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "16px", background: loading ? "#5BBFB5" : "#1FA89A", border: "none", borderRadius: "5px", color: "white", fontSize: "15.5px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.3px", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "background 0.2s" }}>
              {loading ? (<><div style={{ width: "15px", height: "15px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Signing in...</>) : "Sign In"}
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "7px", cursor: "pointer", fontSize: "13.5px", color: "#64748B", userSelect: "none" }}>
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ width: "15px", height: "15px", cursor: "pointer", accentColor: "#1FA89A" }} />
                Remember Me
              </label>
              <a href="#" onClick={e => e.preventDefault()} style={{ color: "#1FA89A", fontSize: "13.5px", textDecoration: "underline", fontWeight: 500 }}>Forgot Password</a>
            </div>
          </form>
        </>
      )}

      {/* ── STEP 2: 2FA Code Entry ────────────────────────────────────────────── */}
      {step === "2fa" && (
        <form onSubmit={handle2faVerify} style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(31,168,154,0.12)", border: "2px solid #1FA89A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <ShieldCheck size={28} color="#1FA89A" />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1E293B", margin: "0 0 8px" }}>Two-Factor Authentication</h1>
          <p style={{ fontSize: "13.5px", color: "#64748B", margin: "0 0 28px", lineHeight: 1.6 }}>
            Open your authenticator app (Google Authenticator, Authy) and enter the 6-digit code for <strong style={{ color: "#1E293B" }}>KRYROS</strong>.
          </p>

          <input
            value={twoFaCode}
            onChange={e => { setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setTwoFaError(""); }}
            placeholder="000 000"
            maxLength={6}
            autoFocus
            style={{ ...inputBase, fontSize: "28px", fontFamily: "monospace", letterSpacing: "0.35em", textAlign: "center", padding: "18px", marginBottom: "8px" }}
            onFocus={e => e.target.style.borderColor = "#1FA89A"}
            onBlur={e => e.target.style.borderColor = "#C8D3E0"}
          />
          {twoFaError && <p style={{ ...errStyle, textAlign: "center" }}>{twoFaError}</p>}

          <button type="submit" disabled={twoFaLoading || twoFaCode.length !== 6} style={{ width: "100%", padding: "16px", background: (twoFaCode.length === 6 && !twoFaLoading) ? "#1FA89A" : "#9CA3AF", border: "none", borderRadius: "5px", color: "white", fontSize: "15px", fontWeight: 600, cursor: twoFaCode.length === 6 ? "pointer" : "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "4px", transition: "background 0.2s" }}>
            {twoFaLoading ? (<><div style={{ width: "15px", height: "15px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Verifying...</>) : "Verify & Sign In"}
          </button>

          <button type="button" onClick={() => { setStep("credentials"); setTwoFaCode(""); setTwoFaError(""); }} style={{ marginTop: "16px", background: "none", border: "none", cursor: "pointer", color: "#64748B", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", margin: "16px auto 0" }}>
            <ArrowLeft size={14} /> Back to login
          </button>
        </form>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: #9CA3AF; }`}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </ThemeProvider>
  );
}
