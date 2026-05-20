import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Zap, Headphones } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">

          {/* Top section */}
          <div className="relative bg-card px-6 pt-6 pb-5 overflow-hidden border-b border-border">
            <Link href="/">
              <span className="text-xl font-black tracking-tight text-foreground cursor-pointer">KRY<span className="text-primary">ROS</span></span>
            </Link>
            <h1 className="text-2xl font-black text-foreground mt-4 mb-1 whitespace-nowrap">Welcome Back</h1>
            <p className="text-xs text-muted-foreground">Login to continue shopping with KRYROS</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 bg-card">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  data-testid="input-email" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <span className="text-xs text-primary cursor-pointer hover:underline font-medium">Forgot Password?</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  data-testid="input-password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer" onClick={() => setRemember(!remember)}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${remember ? "bg-primary border-primary" : "border-border"}`}>
                  {remember && <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-white stroke-2"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <span className="text-xs text-foreground">Remember me</span>
              </label>
              <span className="text-xs text-muted-foreground">Keep me signed in</span>
            </div>

            <button type="submit" data-testid="btn-login"
              className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity active:scale-95">
              Login
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Google", color: "text-red-500" },
                { label: "Apple", color: "text-foreground" },
                { label: "Facebook", color: "text-blue-500" },
              ].map(({ label, color }) => (
                <button key={label} type="button" className="flex items-center justify-center gap-1.5 py-2.5 bg-background border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors">
                  <span className={`font-black text-sm ${color}`}>{label === "Google" ? "G" : label === "Apple" ? "" : "f"}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground pb-1">
              Don't have an account?{" "}
              <Link href="/register">
                <span className="text-primary font-semibold cursor-pointer hover:underline">Register Now</span>
              </Link>
            </p>
          </form>

          {/* Trust badges */}
          <div className="flex items-center justify-around px-6 py-4 border-t border-border bg-muted/30">
            {[
              { icon: ShieldCheck, title: "Secure & Safe", sub: "Your data is protected" },
              { icon: Zap, title: "Fast & Easy", sub: "Quick access to your account" },
              { icon: Headphones, title: "24/7 Support", sub: "We're here to help" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="text-center">
                <Icon className="w-4 h-4 text-primary mx-auto mb-0.5" />
                <p className="text-[9px] font-bold text-foreground">{title}</p>
                <p className="text-[8px] text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
