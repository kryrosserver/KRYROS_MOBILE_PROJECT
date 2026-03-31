"use client"

import Link from "next/link"
import { ArrowRight, Calendar, User, Clock } from "lucide-react"

export function BlogSection() {
  const posts = [
    {
      title: "Why iPhone 15 is the Ultimate Choice for Creators",
      excerpt: "Discover the powerful features that make the latest iPhone a game-changer for mobile content creation.",
      category: "Reviews",
      date: "Mar 24, 2026",
      image: "/blog-1.jpg"
    },
    {
      title: "How to Apply for Kryros Credit: A Step-by-Step Guide",
      excerpt: "Everything you need to know about our flexible payment plans and how to get approved quickly.",
      category: "Guides",
      date: "Mar 20, 2026",
      image: "/blog-2.jpg"
    },
    {
      title: "Top 10 Accessories Your Smartphone Needs in 2026",
      excerpt: "Enhance your mobile experience with these must-have accessories available at Kryros.",
      category: "Lifestyle",
      date: "Mar 15, 2026",
      image: "/blog-3.jpg"
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight leading-tight">
              Latest from <span className="text-primary">Kryros Blog</span>
            </h2>
            <p className="mt-4 text-slate-500 font-medium">Insights, guides, and reviews from the world of mobile technology.</p>
          </div>
          <Link href="/blog" className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 group hover:underline">
            View All Posts <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <Link key={i} href="#" className="group space-y-6">
              <div className="aspect-[16/10] bg-slate-100 rounded-[2.5rem] overflow-hidden relative border border-slate-100">
                {/* Image placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                  {post.category}
                </div>
              </div>
              <div className="space-y-4 px-2">
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {post.date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> 5 Min Read</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 group-hover:gap-4 transition-all">
                    Read More <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
