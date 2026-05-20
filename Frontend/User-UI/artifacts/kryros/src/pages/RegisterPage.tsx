import { useState } from "react";
import { Link, useLocation } from "wouter";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">

          {/* Header */}
          <div className="relative bg-card px-6 pt-5 pb-4 overflow-hidden border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <Link href="/login">
                <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-foreground" />
                </button>
              </Link>
              <span className="text-lg font-black text-foreground">KRY<span className="text-primary">ROS</span></span>
              <Link href="/login">
                <span className="text-sm text-primary font-semibold cursor-pointer hover:underline">Login</span>
              </Link>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-black text-foreground mb-1">Create Account</h1>
                <p className="text-xs text-muted-foreground leading-snug">Join KRYROS and enjoy premium shopping experience</p>
              </div>
              {/* Icon block */}
              <div className="w-20 h-20 flex-shrink-0 ml-2 relative">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-black text-white">K</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-xl border-2 border-border flex items-center justify-center shadow-sm">
                  <span className="text-xs font-black text-amber-700 dark:text-amber-300">K</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3.5 bg-card">
            <div className="pt-4">
              <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  data-testid="input-name" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  data-testid="input-email" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a password"
                  className="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  data-testid="input-password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                <p className="text-[9px] text-muted-foreground">Use 8+ characters with a mix of letters, numbers & symbols</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showConfirm ? "text" : "password"} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Confirm your password"
                  className="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  data-testid="input-confirm-password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer" onClick={() => setAgreed(!agreed)}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${agreed ? "bg-primary border-primary" : "border-border"}`}>
                {agreed && <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-white stroke-2"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <span className="text-xs text-foreground">
                I agree to the{" "}
                <Link href="/terms"><span className="text-primary cursor-pointer hover:underline">Terms & Conditions</span></Link>
                {" "}and{" "}
                <Link href="/privacy"><span className="text-primary cursor-pointer hover:underline">Privacy Policy</span></Link>
              </span>
            </label>

            <button type="submit" data-testid="btn-register"
              className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity active:scale-95">
              Create Account
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["Google", "Apple", "Facebook"].map((label) => (
                <button key={label} type="button" className="flex items-center justify-center gap-1 py-2.5 bg-background border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors">
                  <span className={`font-black text-sm ${label === "Google" ? "text-red-500" : label === "Facebook" ? "text-blue-500" : "text-foreground"}`}>
                    {label === "Google" ? "G" : label === "Apple" ? "" : "f"}
                  </span>
                  {label}
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground pb-1">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-primary font-semibold cursor-pointer hover:underline">Login Now</span>
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
