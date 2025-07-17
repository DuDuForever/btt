
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, PartyPopper, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SalonFlowLogo } from "@/components/icons"
import Link from "next/link"
import { addPremiumRequest } from "@/lib/data"

const formSchema = z.object({
  name: z.string().min(2, { message: "Please enter your full name." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().min(10, "Please enter a valid phone number."),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

export default function PremiumRequestPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await addPremiumRequest(values);
      setIsSubmitted(true);
      toast({
        title: "Request Sent!",
        description: "We have received your details and will contact you shortly.",
      });
    } catch (error: any) {
      console.error("Submission Error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isSubmitted) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm text-center">
            <CardHeader>
                <SalonFlowLogo className="w-12 h-12 text-primary mb-2 mx-auto" />
                <CardTitle className="text-2xl">Request Sent!</CardTitle>
                <CardDescription>We will contact you shortly.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
                <PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground mt-2">
                    Thank you for your interest. You will receive a payment link via email or on your mobile number to complete your subscription.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/">Back to Home</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Link href="/premium" className="absolute top-4 left-4 text-sm text-muted-foreground hover:text-primary">&larr; Back to Premium</Link>
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
            <SalonFlowLogo className="w-12 h-12 text-primary mb-2 mx-auto" />
          <CardTitle className="text-2xl">Request Premium Access</CardTitle>
          <CardDescription>Enter your details below. We will send you a payment link to complete your subscription.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email for Login</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="tel" placeholder="Your contact number" {...field} className="pl-10" />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choose a Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Choose a secure password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request Premium Access
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
