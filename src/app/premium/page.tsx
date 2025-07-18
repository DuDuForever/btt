
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle, Gem, MessageSquare } from "lucide-react"
import Link from "next/link"
import { SalonFlowLogo } from "@/components/icons"

const features = [
  "Unlimited Client Management",
  "Appointment Calendar & Scheduling",
  "Payment Tracking",
  "Automated Reminders",
  "AI-Powered Client Insights",
  "Business Analytics Dashboard",
  "Dedicated Support",
]

export default function PremiumPage() {
  const WHATSAPP_NUMBER = "923707443213";
  const WHATSAPP_MESSAGE = "Hi, I have a question about SalonFlow Premium.";

  const handleWhatsAppRedirect = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
        <Link href="/login" className="absolute top-6 left-6 flex items-center gap-2 text-lg font-semibold text-primary">
            <SalonFlowLogo className="w-8 h-8"/>
            <span>SalonFlow</span>
        </Link>
      <Card className="w-full max-w-md shadow-2xl overflow-hidden border-2 border-primary/20">
        <div className="p-8 bg-gradient-to-br from-primary to-purple-600 text-primary-foreground text-center">
            <Gem className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <CardTitle className="text-4xl font-bold">Go Premium</CardTitle>
            <CardDescription className="text-primary-foreground/80 mt-2">
                Unlock all features and take your salon to the next level.
            </CardDescription>
        </div>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <span className="text-5xl font-bold">$35</span>
            <span className="text-lg text-muted-foreground">/month</span>
          </div>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex-col gap-2">
            <Button className="w-full text-lg py-6" size="lg" asChild>
                <Link href="/premium/checkout">Buy Now</Link>
            </Button>
            <Button className="w-full" variant="outline" onClick={handleWhatsAppRedirect}>
                <MessageSquare className="mr-2 h-4 w-4" /> Contact Now
            </Button>
        </CardFooter>
      </Card>
      <p className="text-center text-xs text-muted-foreground mt-6">
        Already have an account? <Link href="/login" className="underline hover:text-primary">Sign In</Link>
      </p>
    </div>
  )
}
