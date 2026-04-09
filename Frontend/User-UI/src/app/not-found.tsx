import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Ghost } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50/50">
      <div className="max-w-md w-full text-center space-y-10 p-12 bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-slate-50">
        <div className="flex justify-center relative">
          <div className="h-32 w-32 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-bounce duration-1000">
            <Ghost size={64} strokeWidth={1.5} />
          </div>
          <div className="absolute -top-4 -right-4 h-16 w-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 font-black text-xl shadow-lg border-4 border-white">
            404
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Page Not Found
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            Lost in the digital abyss
          </p>
          <div className="h-1.5 w-12 bg-primary rounded-full mx-auto mt-6" />
        </div>

        <p className="text-slate-500 font-medium text-base leading-relaxed max-w-[280px] mx-auto">
          The page you're looking for has vanished or never existed. Let's find your way back home.
        </p>

        <div className="grid grid-cols-1 gap-4 pt-6">
          <Button
            asChild
            className="h-16 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-sm rounded-3xl shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Link href="/">
              <Home size={22} />
              Return Home
            </Link>
          </Button>
          
          <Button
            asChild
            variant="ghost"
            className="h-14 text-slate-400 font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-slate-50 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Link href="/shop">
              <ArrowLeft size={16} />
              Back to Shop
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
