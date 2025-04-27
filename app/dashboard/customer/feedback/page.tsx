"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function FeedbackPage() {
  const [rating, setRating] = useState("5")
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send the feedback to your backend
    console.log({ rating, feedback })
    setSubmitted(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card className="max-w-2xl mx-auto">
        {submitted ? (
          <CardContent className="pt-6 pb-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Send className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Geri Bildiriminiz İçin Teşekkürler!</CardTitle>
              <CardDescription className="max-w-md">
                Değerli görüşleriniz hizmetlerimizi geliştirmemize yardımcı olacak.
              </CardDescription>
              <Button onClick={() => setSubmitted(false)}>Yeni Geri Bildirim Gönder</Button>
            </div>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Geri Bildirim Formu</CardTitle>
              <CardDescription>Hizmetlerimizi değerlendirin ve görüşlerinizi bizimle paylaşın.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Deneyiminizi nasıl değerlendirirsiniz?</Label>
                  <RadioGroup value={rating} onValueChange={setRating} className="flex space-x-1" defaultValue="5">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex flex-col items-center space-y-1">
                        <RadioGroupItem value={value.toString()} id={`rating-${value}`} className="peer sr-only" />
                        <Label
                          htmlFor={`rating-${value}`}
                          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                        >
                          {value}
                        </Label>
                        <span className="text-xs">
                          {value === 1
                            ? "Çok Kötü"
                            : value === 2
                              ? "Kötü"
                              : value === 3
                                ? "Orta"
                                : value === 4
                                  ? "İyi"
                                  : "Çok İyi"}
                        </span>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Görüşleriniz</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Deneyiminiz hakkında görüşlerinizi yazabilirsiniz..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-32"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setRating("5")
                  setFeedback("")
                }}
              >
                Temizle
              </Button>
              <Button onClick={handleSubmit}>Gönder</Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
