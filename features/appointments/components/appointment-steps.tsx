import { cn } from "@/lib/utils"

interface AppointmentStepsProps {
  currentStep: 1 | 2 | 3
}

export function AppointmentSteps({ currentStep }: AppointmentStepsProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center">
        <div
          className={cn(
            "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 text-sm font-medium",
            currentStep >= 1 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground",
          )}
        >
          1
        </div>
        <div className={cn("h-1 w-full", currentStep >= 2 ? "bg-primary" : "bg-muted")}></div>
        <div
          className={cn(
            "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 text-sm font-medium",
            currentStep >= 2 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground",
          )}
        >
          2
        </div>
        <div className={cn("h-1 w-full", currentStep >= 3 ? "bg-primary" : "bg-muted")}></div>
        <div
          className={cn(
            "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 text-sm font-medium",
            currentStep >= 3 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground",
          )}
        >
          3
        </div>
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <span className={cn(currentStep === 1 ? "text-foreground font-medium" : "text-muted-foreground")}>
          Tarih Seçimi
        </span>
        <span className={cn(currentStep === 2 ? "text-foreground font-medium" : "text-muted-foreground")}>
          Personel ve Saat
        </span>
        <span className={cn(currentStep === 3 ? "text-foreground font-medium" : "text-muted-foreground")}>Onay</span>
      </div>
    </div>
  )
}
