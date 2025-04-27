import { Navbar } from "@/features/layout/components/navbar"
import { Footer } from "@/features/layout/components/footer"
import { ConfirmationForm } from "@/features/appointments/components/confirmation-form"

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8 md:py-12">
        <ConfirmationForm />
      </main>
      <Footer />
    </div>
  )
}
