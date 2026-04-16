"use client"

import { useState } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email && !formData.phone) {
      setError("Please provide either an email or a phone number.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Clean empty fields
      const submitData = { ...formData }
      if (!submitData.email) delete (submitData as any).email
      if (!submitData.phone) delete (submitData as any).phone

      const result = await register(submitData)
      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.error || "Registration failed. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-custom py-20 flex justify-center" style={{ backgroundColor: '#2A3A4A' }}>
      <div className="w-full max-w-md bg-[#2A3A4A] p-8 rounded-2xl shadow-sm border border-slate-600">
        <h1 className="text-2xl font-black uppercase tracking-tight mb-6 text-white">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1 block">First Name</label>
              <Input 
                type="text" 
                value={formData.firstName} 
                onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                required 
                placeholder="John"
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1 block">Last Name</label>
              <Input 
                type="text" 
                value={formData.lastName} 
                onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                required 
                placeholder="Doe"
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1 block">Email (Optional)</label>
            <Input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              placeholder="your@email.com"
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1 block">Phone Number (Optional)</label>
            <Input 
              type="text" 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              placeholder="+260..."
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1 block">Password</label>
            <Input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
              placeholder="••••••••"
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg font-medium">
              {error}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full h-12 font-black uppercase tracking-widest rounded-xl bg-[#1FA89A] hover:bg-[#1FA89A]/90" 
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-300 font-medium">
          Already have an account? <Link href="/login" className="text-[#1FA89A] font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
