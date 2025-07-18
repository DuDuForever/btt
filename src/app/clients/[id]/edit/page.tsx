
"use client"

export const runtime = 'edge';

import * as React from "react"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { getClient, updateClient } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { ClientForm } from "@/components/client-form"
import type { Client } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(10, "Please enter a valid phone number."),
})

export default function EditClientPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [client, setClient] = React.useState<Client | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    async function fetchClient() {
      try {
        const data = await getClient(params.id)
        if (data) {
          setClient(data)
        } else {
          router.push('/not-found')
        }
      } catch (error) {
        console.error("Failed to fetch client", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchClient()
  }, [params.id, router])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const updated = await updateClient(params.id, values)
      toast({
        title: "Client Updated",
        description: `${updated.name}'s details have been successfully updated.`,
      })
      router.push(`/clients/${params.id}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update client. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-1/2" />
        <div className="space-y-8 mt-6">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
        </div>
      </div>
    )
  }

  if (!client) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Client #{client.displayId}</h2>
          <p className="text-muted-foreground">Update details for {client.name}.</p>
        </div>
      </div>
      <ClientForm client={client} onSubmit={onSubmit} isSubmitting={isSubmitting} submitButtonText="Save Changes" />
    </div>
  )
}
