import { Navbar } from "@/features/layout/components/navbar"
import { Footer } from "@/features/layout/components/footer"
import { TimeSelectionForm } from "@/features/appointments/components/time-selection-form"

export default function TimeSelectionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8 md:py-12">
        <TimeSelectionForm />
      </main>
      <Footer />
    </div>
  )
}
