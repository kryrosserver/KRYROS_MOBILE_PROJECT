'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCcw, Home, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('KRYROS Global Error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50/50">
      <div className="max-w-md w-full text-center space-y-8 p-10 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex justify-center">
          <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 animate-pulse">
            <AlertCircle size={48} strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
            Oops! Something went wrong
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            We've encountered a small technical glitch. Don't worry, your data is safe. Let's get you back on track.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest pt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4">
          <Button
            onClick={() => reset()}
            className="h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <RefreshCcw size={20} />
            Try Again
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="h-14 border-slate-200 text-slate-600 font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-slate-50 flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Link href="/">
              <Home size={20} />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
