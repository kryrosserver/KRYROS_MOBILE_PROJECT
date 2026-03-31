"use client"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-20">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tight mb-8">
            About <span className="text-primary">Kryros</span>
          </h1>
          
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 space-y-8">
            <section>
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4">Our Mission</h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Kryros Mobile Tech Limited is a leading provider of premium mobile technology and accessories in Zambia. 
                We are dedicated to making high-quality tech accessible to everyone through innovative financing 
                solutions and competitive wholesale opportunities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4">What We Do</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Our mission is to empower our customers with the tools they need to succeed in a digital world, 
                providing not just products, but reliability and support. We specialize in the latest smartphones, 
                tablets, and mobile accessories from top global brands.
              </p>
            </section>

            <section className="grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-2">Quality First</h3>
                <p className="text-sm text-slate-500 font-medium">We only source genuine products from authorized distributors to ensure our customers get the best value.</p>
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-2">Customer Centric</h3>
                <p className="text-sm text-slate-500 font-medium">Our support team is always ready to assist you with any questions or technical issues you might have.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
