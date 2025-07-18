
"use client"

import * as React from "react"
import { getClient, addVisit, deleteClient, updateVisitPaymentStatus, deleteVisit } from "@/lib/data"
import { notFound, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { User, Pencil, Phone, PlusCircle, CheckCircle2, XCircle, Trash2, CalendarClock, Loader2, MoreVertical, Shield } from "lucide-react"
import Link from "next/link"
import type { Client, Visit } from "@/lib/types"
import { AddVisitForm } from "@/components/add-visit-form"
import { useToast } from "@/hooks/use-toast"
import * as z from "zod"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { Separator } from "@/components/ui/separator"

const addVisitFormSchema = z.object({
  date: z.date({ required_error: "Visit date is required." }),
  services: z.array(z.string()).min(1, { message: "Please select at least one service." }),
  amount: z.coerce.number().min(0, "Amount must be a positive number."),
  paid: z.boolean().default(false),
  notes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),
  nextVisit: z.date().optional().nullable(),
})


export default function ClientProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { role } = useAuth()
  const [client, setClient] = React.useState<Client | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmittingVisit, setIsSubmittingVisit] = React.useState(false)
  const [isUpdatingPayment, setIsUpdatingPayment] = React.useState<string | null>(null)
  const [visitToDelete, setVisitToDelete] = React.useState<Visit | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const isOwner = role === 'owner';

  const fetchClient = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getClient(params.id)
      if (data) {
        setClient(data)
      } else {
        toast({ variant: "destructive", title: "Error", description: "Could not load client data."})
        router.push("/clients");
      }
    } catch (error) {
      console.error("Failed to fetch client", error)
      toast({ variant: "destructive", title: "Error", description: "Could not load client data."})
    } finally {
      setIsLoading(false)
    }
  },[params.id, toast, router])

  React.useEffect(() => {
    fetchClient()
  }, [fetchClient])

  async function handleAddVisit(values: z.infer<typeof addVisitFormSchema>) {
    setIsSubmittingVisit(true)
    try {
      await addVisit(params.id, {
        ...values,
        notes: values.notes || "",
        nextVisit: values.nextVisit || null,
      });
      toast({
        title: "Visit Added",
        description: `A new visit has been added for ${client?.name}.`,
      });
      fetchClient(); // Re-fetch client data to show the new visit
      setIsModalOpen(false); // Close modal on success
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add new visit. Please try again.",
      })
    } finally {
      setIsSubmittingVisit(false)
    }
  }

  async function handleMarkAsPaid(visitId: string) {
    if (!client || !isOwner) return;
    setIsUpdatingPayment(visitId)
    try {
      await updateVisitPaymentStatus(client.id, visitId, true)
      toast({
        title: "Payment Updated",
        description: "The visit has been marked as paid.",
      })
      fetchClient();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment status.",
      })
    } finally {
      setIsUpdatingPayment(null);
    }
  }
  
  async function handleDeleteVisit() {
    if (!client || !visitToDelete || !isOwner) return;
    try {
      await deleteVisit(client.id, visitToDelete.id);
      toast({
        title: "Visit Deleted",
        description: "The visit has been removed from the client's history."
      });
      fetchClient();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete visit. Please try again."
      });
    } finally {
        setVisitToDelete(null);
    }
  }


  async function handleDeleteClient() {
    if (!client || !isOwner) return;
    try {
        await deleteClient(client.id);
        toast({
            title: "Client Deleted",
            description: `${client.name} has been removed from your client list.`
        });
        router.push("/clients");
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete client. Please try again."
        });
    }
  }
  
  const nextAppointment = React.useMemo(() => {
    if (!client?.visits?.length) return null;
    const futureVisits = client.visits
        .filter(v => v.nextVisit && new Date(v.nextVisit) > new Date())
        .sort((a,b) => new Date(a.nextVisit!).getTime() - new Date(b.nextVisit!).getTime());
    return futureVisits[0]?.nextVisit ? new Date(futureVisits[0].nextVisit) : null;
  }, [client]);


  if (isLoading || !client) {
    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <Skeleton className="h-32 w-32 rounded-full" />
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <Skeleton className="h-8 w-40 mx-auto md:mx-0" />
                            <Skeleton className="h-5 w-32 mx-auto md:mx-0" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-80" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Client Profile</h2>
          <p className="text-muted-foreground">Viewing details for {client.name}.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Visit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Add New Visit</DialogTitle>
                  <DialogDescription>
                    Log a new visit for {client.name}.
                  </DialogDescription>
                </DialogHeader>
                <AddVisitForm 
                  onSubmit={handleAddVisit}
                  isSubmitting={isSubmittingVisit}
                />
            </DialogContent>
          </Dialog>
          {isOwner && (
            <Button asChild variant="outline">
                <Link href={`/clients/${client.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Client
                </Link>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-6">
                <div className="space-y-4 text-center md:text-left">
                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                        <h1 className="text-2xl font-bold">{client.name}</h1>
                        <span className="text-sm font-medium text-muted-foreground">#{client.displayId}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start text-muted-foreground">
                        <Phone className="mr-2 h-4 w-4" />
                        <span>{client.phone}</span>
                    </div>
                     {nextAppointment && (
                        <div className="flex items-center justify-center md:justify-start text-sm text-primary font-medium p-2 bg-primary/10 rounded-md">
                            <CalendarClock className="mr-2 h-4 w-4" />
                            <span>Next Visit: {format(nextAppointment, 'PPP p')}</span>
                        </div>
                    )}
                </div>
                 {isOwner && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="w-full">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Client
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete {client.name} and all of their visit history.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteClient}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            <div className="lg:col-span-2">
                {isOwner ? (
                    <AlertDialog open={!!visitToDelete} onOpenChange={(isOpen) => !isOpen && setVisitToDelete(null)}>
                        <div>
                            <CardHeader className="p-0 mb-4">
                              <CardTitle>Visit History</CardTitle>
                              <CardDescription>A complete record of all client visits and payments.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                              <div className="min-w-[600px] md:min-w-full">
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Services</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {client.visits.length > 0 ? (
                                        client.visits.map((visit) => (
                                        <TableRow key={visit.id}>
                                            <TableCell className="font-medium whitespace-nowrap">{format(visit.date, "PPP p")}</TableCell>
                                            <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {visit.services.map((service, index) => (
                                                    <Badge key={index} variant="secondary">{service}</Badge>
                                                ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>${visit.amount.toFixed(2)}</TableCell>
                                            <TableCell>
                                            <Badge variant={visit.paid ? "default" : "destructive"} className="flex items-center w-fit">
                                                {visit.paid ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                                                {visit.paid ? 'Paid' : 'Unpaid'}
                                            </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                    {!visit.paid && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleMarkAsPaid(visit.id)}
                                                            disabled={isUpdatingPayment === visit.id}
                                                        >
                                                            {isUpdatingPayment === visit.id ? (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                            )}
                                                            Mark as Paid
                                                        </DropdownMenuItem>
                                                    )}
                                                        <DropdownMenuItem 
                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                        onClick={() => setVisitToDelete(visit)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Visit
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No visit history found.
                                        </TableCell>
                                        </TableRow>
                                    )}
                                    </TableBody>
                                </Table>
                              </div>
                            </CardContent>
                        </div>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this visit record.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteVisit}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : (
                    <div className="h-full">
                        <CardHeader className="p-0">
                            <CardTitle>Restricted Access</CardTitle>
                            <CardDescription>
                                As an assistant, you can add new visits but cannot view past visit history.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center h-64 text-center p-0">
                            <Shield className="w-16 h-16 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">Please contact the owner for full access.</p>
                        </CardContent>
                    </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
