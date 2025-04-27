import { Navbar } from "@/features/layout/components/navbar"
import { Footer } from "@/features/layout/components/footer"
import { DateSelectionForm } from "@/features/appointments/components/date-selection-form"

export default function NewAppointmentPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8 md:py-12">
        <DateSelectionForm />
      </main>
      <Footer />
    </div>
  )
}
