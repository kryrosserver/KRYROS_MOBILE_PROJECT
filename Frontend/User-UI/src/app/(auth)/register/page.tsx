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
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await register(formData)
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
    <div className="container-custom py-20 flex justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-black uppercase tracking-tight mb-6">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 block">First Name</label>
              <Input 
                type="text" 
                value={formData.firstName} 
                onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                required 
                placeholder="John"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 block">Last Name</label>
              <Input 
                type="text" 
                value={formData.lastName} 
                onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                required 
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 block">Email</label>
            <Input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 block">Password</label>
            <Input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg font-medium">
              {error}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full h-12 font-black uppercase tracking-widest rounded-xl" 
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500 font-medium">
          Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
