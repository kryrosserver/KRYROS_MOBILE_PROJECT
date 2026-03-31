"use client"

import { useState } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await login(email, password)
      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.error || "Login failed. Please check your credentials.")
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
        <h1 className="text-2xl font-black uppercase tracking-tight mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 block">Email</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 block">Password</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
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
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500 font-medium">
          Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
