"use client"

import { ReactNode } from "react"

interface PreviewToggleWrapperProps {
  children: ReactNode
}

/**
 * A wrapper component that handles conditional rendering for preview modes.
 * In a real application, this might check for a preview cookie or a query parameter.
 */
export function PreviewToggleWrapper({ children }: PreviewToggleWrapperProps) {
  // Currently just a pass-through, but ready for preview logic
  return (
    <div className="preview-toggle-wrapper">
      {children}
    </div>
  )
}
