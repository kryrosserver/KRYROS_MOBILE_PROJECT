"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Send, Info } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    url: "",
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      toast.error("Please fill in both title and message");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          body: formData.body,
          data: {
            url: formData.url || "/",
          }
        }),
      });

      if (res.ok) {
        toast.success("Notification sent successfully to all users!");
        setFormData({ title: "", body: "", url: "" });
      } else {
        toast.error("Failed to send notification");
      }
    } catch (error) {
      toast.error("An error occurred while sending");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Push Notifications</h1>
          <p className="text-sm text-slate-500 font-medium">Send promotional messages to all app users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="border-2 border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Send className="h-5 w-5" /> New Broadcast
              </CardTitle>
              <CardDescription>This will be sent to every user who has the KRYROS app installed.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Notification Title</label>
                  <Input 
                    placeholder="e.g. Flash Sale: 50% Off!" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="h-12 rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Message Body</label>
                  <Textarea 
                    placeholder="Enter the message you want users to see on their phone..." 
                    rows={4}
                    value={formData.body}
                    onChange={(e) => setFormData({...formData, body: e.target.value})}
                    className="rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Redirect Link (Optional)</label>
                  <Input 
                    placeholder="e.g. /shop/iphones" 
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="h-12 rounded-xl"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Users will be taken to this page when they click the notification.</p>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20"
                >
                  {loading ? "Sending..." : "Send Notification Now"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-primary/10 bg-primary/5 rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3 font-medium text-slate-600">
              <p>• Keep titles short and exciting to get more clicks.</p>
              <p>• Use "Redirect Link" to send users directly to a specific product.</p>
              <p>• Notifications are sent via Firebase Cloud Messaging (FCM) and are completely free.</p>
            </CardContent>
          </Card>

          <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary">Preview</h4>
            <div className="bg-white/10 p-4 rounded-2xl space-y-1">
              <p className="text-sm font-bold truncate">{formData.title || "Your Title Here"}</p>
              <p className="text-[11px] text-white/60 line-clamp-2">{formData.body || "Your message will appear here on the user's phone menu."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
