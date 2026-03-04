"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Watch,
  Code,
  Speaker,
  Gamepad2,
} from "lucide-react"
import { categories } from "@/lib/store-data"

const iconMap: Record<string, React.ElementType> = {
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Watch,
  Code,
  Speaker,
  Gamepad2,
}

export function CategoriesGrid() {
  return (
    <section className="bg-slate-50 py-12 md:py-16 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">
            Shop by Category
          </h2>
          <p className="mt-2 text-base font-medium text-slate-600 dark:text-slate-400">
            Browse our wide range of tech products
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon] || Smartphone
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-green-500 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600 transition-colors group-hover:bg-green-500 group-hover:text-white dark:bg-green-900/30 dark:text-green-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {cat.name}
                    </p>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {cat.count} products
                    </p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
