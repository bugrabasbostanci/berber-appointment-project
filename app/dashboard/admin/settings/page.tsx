"use client"

import type React from "react"

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Sistem ayarlarını yönetin</p>
      </div>
    </div>
  )
}
