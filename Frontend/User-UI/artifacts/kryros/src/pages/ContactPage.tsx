import { Mail, Phone, MessageCircle, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-28">
      <h1 className="text-2xl font-black text-foreground mb-0.5">Contact Us</h1>
      <p className="text-xs font-semibold text-foreground mb-1">We're here to help!</p>
      <p className="text-xs text-muted-foreground mb-5">Reach out to us through any of the following channels.</p>

      {/* Contact channels */}
      <div className="space-y-3 mb-6">
        {/* Customer Support */}
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl cursor-pointer hover:border-primary/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Customer Support</p>
            <p className="text-xs text-primary font-medium">support@kryros.com</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl cursor-pointer hover:border-primary/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">+1(800) 123-4567</p>
            <p className="text-xs text-muted-foreground">Mon-Fri, 9:00AM - 6:00PM (EST)</p>
          </div>
        </div>

        {/* Live Chat */}
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl cursor-pointer hover:border-primary/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Live Chat</p>
            <p className="text-xs text-muted-foreground">Chat with us on the app</p>
          </div>
          <button className="px-3 py-1.5 border border-primary text-primary rounded-xl text-xs font-bold hover:bg-primary/10 transition-all flex-shrink-0">
            Start Chat
          </button>
        </div>

        {/* Head Office */}
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl cursor-pointer hover:border-primary/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Head Office</p>
            <p className="text-xs text-muted-foreground">123 Business Avenue,</p>
            <p className="text-xs text-muted-foreground">New York, NY 10001, USA</p>
          </div>
        </div>
      </div>

      {/* Follow Us */}
      <div>
        <p className="text-sm font-bold text-foreground mb-3">Follow Us</p>
        <div className="flex gap-3">
          {[
            { icon: Facebook, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
            { icon: Instagram, color: "text-pink-500", bg: "bg-pink-50 border-pink-100" },
            { icon: Twitter, color: "text-sky-500", bg: "bg-sky-50 border-sky-100" },
            { icon: Youtube, color: "text-red-500", bg: "bg-red-50 border-red-100" },
          ].map(({ icon: Icon, color, bg }, i) => (
            <button key={i} className={`w-11 h-11 rounded-xl border flex items-center justify-center hover:scale-105 transition-transform ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
