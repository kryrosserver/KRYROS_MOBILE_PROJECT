"use client"

import { useEffect, useState } from "react"
import { cmsApi } from "@/lib/api"
import { DynamicSection } from "@/components/home/DynamicSection"

export default function HomePage() {
  const [sections, setSections] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [sectionsRes, bannersRes] = await Promise.all([
          cmsApi.getHomePageSections(),
          cmsApi.getBanners()
        ])

        if (sectionsRes.data) {
          setSections(sectionsRes.data)
        }
        
        if (bannersRes.data) {
          setBanners(bannersRes.data)
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">KRYROS CMS Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      {sections.length > 0 ? (
        sections.map((section) => (
          <DynamicSection 
            key={section.id} 
            section={section} 
            banners={banners} 
          />
        ))
      ) : (
        <div className="py-24 text-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest">No sections found on homepage.</p>
        </div>
      )}
    </main>
  )
}
