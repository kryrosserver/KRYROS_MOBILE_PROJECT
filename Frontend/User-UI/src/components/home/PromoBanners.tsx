"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, CreditCard, Package, Shield } from "lucide-react"

export function PromoBanners() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Wholesale Banner */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              href="/wholesale"
              className="group relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-2xl bg-slate-900 p-8"
            >
              <div className="absolute right-6 top-6 opacity-10">
                <Package className="h-32 w-32 text-white" />
              </div>
              <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-white">
                Wholesale
              </span>
              <h3 className="mb-2 text-2xl font-bold text-white">
                Bulk Orders, Better Prices
              </h3>
              <p className="mb-4 max-w-xs text-sm text-slate-400">
                Save up to 40% on bulk orders. Perfect for businesses and resellers.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-teal-400 transition-colors group-hover:text-green-400">
                Explore Wholesale
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>

          {/* Credit Banner */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              href="/credit"
              className="group relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-2xl bg-green-500 p-8"
            >
              <div className="absolute right-6 top-6 opacity-20">
                <CreditCard className="h-32 w-32 text-white" />
              </div>
              <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                Credit Plans
              </span>
              <h3 className="mb-2 text-2xl font-bold text-white">
                Buy Now, Pay Later
              </h3>
              <p className="mb-4 max-w-xs text-sm text-white/80">
                0% interest for the first 3 months. Flexible monthly payments up to 24 months.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors group-hover:underline">
                Apply for Credit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Services Strip */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: Package,
              title: "Free Shipping",
              desc: "On orders over $500",
              color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
            },
            {
              icon: Shield,
              title: "Secure Payments",
              desc: "100% protected checkout",
              color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
            },
            {
              icon: CreditCard,
              title: "Easy Installments",
              desc: "Up to 24 months",
              color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
