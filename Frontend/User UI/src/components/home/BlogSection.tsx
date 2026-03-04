"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Calendar } from "lucide-react"
import { blogPosts } from "@/lib/store-data"

export function BlogSection() {
  return (
    <section className="bg-slate-100 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
              Latest News & Guides
            </h2>
            <p className="mt-2 text-base font-medium text-slate-500">
              Stay updated with the latest tech trends
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden items-center gap-1 text-sm font-medium text-green-500 hover:underline md:flex"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {blogPosts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="aspect-video bg-slate-900/5" />
              <div className="p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mb-2 block text-base font-semibold text-slate-900 transition-colors group-hover:text-green-500 line-clamp-2"
                >
                  {post.title}
                </Link>
                <p className="text-base leading-relaxed text-slate-500 line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
