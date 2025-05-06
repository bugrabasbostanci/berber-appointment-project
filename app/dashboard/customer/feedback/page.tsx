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
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          rating: parseInt(rating), 
          comment: feedback 
        })
      })
      
      if (!response.ok) {
        throw new Error('Geri bildirim gönderilirken bir hata oluştu')
      }
      
      setSubmitted(true)
    } catch (error) {
      console.error("Geri bildirim gönderilemedi:", error)
    } finally {
      setIsLoading(false)
    }
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
                Projemizi geliştirmemize yardımcı olacak değerli görüşleriniz için minnettarız.
              </CardDescription>
              <Button onClick={() => {
                setSubmitted(false)
                setRating("5")
                setFeedback("")
              }}>Yeni Geri Bildirim Gönder</Button>
            </div>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Proje Geri Bildirim Formu</CardTitle>
              <CardDescription>Projemiz hakkındaki düşüncelerinizi ve değerlendirmelerinizi bizimle paylaşın.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Projemizi genel olarak nasıl değerlendirirsiniz?</Label>
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
                    placeholder="Projemiz hakkındaki genel görüşlerinizi, beğendiğiniz veya geliştirilmesini istediğiniz noktaları yazabilirsiniz..."
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
                disabled={isLoading}
              >
                Temizle
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading || !feedback.trim()}>
                {isLoading ? "Gönderiliyor..." : "Gönder"}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
