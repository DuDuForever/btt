
export const runtime = 'edge';
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { addClient, getClients } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { ClientForm } from "@/components/client-form"
import type { Client } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(10, "Please enter a valid phone number."),
})

type FormValues = z.infer<typeof formSchema>;

export default function AddClientPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [clients, setClients] = React.useState<Client[]>([])
  const [duplicate, setDuplicate] = React.useState<{type: 'name' | 'phone', client: Client} | null>(null)
  const [formData, setFormData] = React.useState<FormValues | null>(null)

  React.useEffect(() => {
    // Fetch all clients once to perform local checks
    async function fetchClients() {
      const allClients = await getClients()
      setClients(allClients)
    }
    fetchClients()
  }, [])

  async function handleAddClient(values: FormValues) {
     setIsSubmitting(true)
    try {
      const newClient = await addClient({ name: values.name, phone: values.phone })
      toast({
        title: "Client Added",
        description: `${newClient.name} has been successfully added to your client list.`,
      })
      router.push(`/clients`)
      router.refresh(); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
      setDuplicate(null)
      setFormData(null)
    }
  }

  function checkForDuplicates(values: FormValues) {
    const sameNameClient = clients.find(c => c.name.trim().toLowerCase() === values.name.trim().toLowerCase())
    if (sameNameClient) {
      setDuplicate({ type: 'name', client: sameNameClient })
      setFormData(values)
      return true
    }
    
    const samePhoneClient = clients.find(c => c.phone.replace(/\D/g, '') === values.phone.replace(/\D/g, ''))
     if (samePhoneClient) {
      setDuplicate({ type: 'phone', client: samePhoneClient })
      setFormData(values)
      return true
    }

    return false
  }

  async function onSubmit(values: FormValues) {
    if (!checkForDuplicates(values)) {
      await handleAddClient(values)
    }
  }

  const handleConfirmDuplicate = async () => {
    if (formData) {
        await handleAddClient(formData)
    }
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add New Client</h2>
            <p className="text-muted-foreground">Fill in the details to add a new client to your list.</p>
          </div>
        </div>
        <ClientForm onSubmit={onSubmit} isSubmitting={isSubmitting} submitButtonText="Add Client" />
      </div>

      <AlertDialog open={!!duplicate} onOpenChange={() => { setDuplicate(null); setFormData(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Client Found</AlertDialogTitle>
            <AlertDialogDescription>
              {duplicate?.type === 'name' && `A client named "${duplicate.client.name}" already exists with ID #${duplicate.client.displayId}.`}
              {duplicate?.type === 'phone' && `This phone number is already associated with "${duplicate.client.name}" (ID #${duplicate.client.displayId}).`}
              <br/><br/>
              Are you sure you want to add this as a new client?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDuplicate}>Yes, Add New Client</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
