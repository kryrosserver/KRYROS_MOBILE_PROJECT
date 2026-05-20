import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Subscribed!", { description: "You'll receive our latest updates." });
    setEmail("");
  };

  return (
    <section className="py-6 md:py-10 mx-3 md:mx-6 mb-4 md:mb-6 rounded-2xl md:rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0a6b60 0%, #0d8a7a 100%)" }}>
      <div className="max-w-2xl mx-auto px-4 md:px-8 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-lg md:text-2xl font-black text-white mb-1">Subscribe to Our Newsletter</h2>
        <p className="text-white/70 text-xs md:text-sm mb-4">
          Get the latest updates on new arrivals, exclusive offers and more.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm outline-none focus:border-white/40 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-white text-primary font-bold text-sm rounded-xl hover:bg-white/90 transition-all active:scale-95 whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
