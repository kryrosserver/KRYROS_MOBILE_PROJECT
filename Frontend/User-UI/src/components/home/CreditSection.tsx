"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CreditCard, Check, ArrowRight } from "lucide-react"

const plans = [
  { months: 3, interest: "0%", monthly: "From $33/mo", popular: false },
  { months: 6, interest: "5%", monthly: "From $18/mo", popular: true },
  { months: 12, interest: "8%", monthly: "From $10/mo", popular: false },
  { months: 24, interest: "12%", monthly: "From $6/mo", popular: false },
]

const features = [
  "No hidden fees",
  "Instant approval",
  "Flexible payment dates",
  "Early repayment option",
  "Credit score tracking",
  "Automatic reminders",
]

export function CreditSection() {
  return (
    <section className="bg-slate-900 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-green-400">
                Credit Plans
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white text-balance md:text-4xl">
              Get the Tech You Need with Flexible Payments
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-slate-400 font-medium">
              Our credit plans make premium technology accessible to everyone.
              Apply in minutes, get approved instantly, and start using your
              devices right away.
            </p>

            <div className="mb-8 grid grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-base text-slate-300">{f}</span>
                </div>
              ))}
            </div>

            <Link
              href="/credit"
              className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 hover:bg-green-600"
            >
              Apply for Credit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Right - Plans */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-3"
          >
            {plans.map((plan) => (
              <div
                key={plan.months}
                className={`relative rounded-xl border p-5 ${
                  plan.popular
                    ? "border-green-500 bg-green-500/10"
                    : "border-slate-700 bg-slate-800"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-4 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    Popular
                  </span>
                )}
                <p className="text-3xl font-bold text-white">
                  {plan.months}
                </p>
                <p className="text-xs text-slate-400">months</p>
                <hr className="my-3 border-slate-700" />
                <p className="text-sm font-semibold text-green-400">
                  {plan.interest} interest
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {plan.monthly}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
