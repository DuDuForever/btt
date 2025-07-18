
"use client"

export const runtime = 'edge';

import * as React from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, PlusCircle, User, Pencil, Trash2, Search } from "lucide-react"
import { getClients, deleteClient } from "@/lib/data"
import type { Client, Visit } from "@/lib/types"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useToast } from "@/hooks/use-toast"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function ClientsPage() {
  const [clients, setClients] = React.useState<Client[]>([])
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState("")
  const [searchBy, setSearchBy] = React.useState<"name" | "phone" | "displayId">("name")


  const fetchClients = React.useCallback(async () => {
      setIsLoading(true);
      try {
        const data = await getClients()
        setClients(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load client data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
  }, [toast]);

  React.useEffect(() => {
    fetchClients()
  }, [fetchClients, pathname, searchParams])

  const handleDeleteClient = async (clientId: string) => {
    try {
        await deleteClient(clientId);
        toast({
            title: "Client Deleted",
            description: "The client has been successfully removed."
        });
        fetchClients(); // Re-fetch clients to update the list
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete client. Please try again."
        });
    }
}

 const filteredClients = React.useMemo(() => {
    if (!searchTerm) return clients;
    return clients.filter(client => {
      const term = searchTerm.toLowerCase();
      const value = client[searchBy]?.toString().toLowerCase() || "";
      return value.includes(term);
    })
  }, [clients, searchTerm, searchBy])
  
  const getClientPaymentStatus = (client: Client) => {
      if (!client.visits || client.visits.length === 0) return "N/A";
      const hasUnpaid = client.visits.some(v => !v.paid);
      return hasUnpaid ? "Unpaid" : "Paid";
  }
  
  const getLastVisit = (client: Client): Visit | null => {
    if (!client.visits || client.visits.length === 0) return null;
    return client.visits.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">Manage your client list.</p>
        </div>
        <Button asChild>
          <Link href="/clients/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`Search by ${searchBy}...`}
            className="w-full appearance-none bg-background pl-8 shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={searchBy} onValueChange={(value) => setSearchBy(value as any)}>
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="displayId">ID</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Last Service(s)</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-24" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  const lastVisit = getLastVisit(client);
                  const paymentStatus = getClientPaymentStatus(client);
                  const services = lastVisit?.services || [];

                  return (
                    <TableRow 
                      key={client.id} 
                      onClick={() => router.push(`/clients/${client.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-4 group">
                          <div className="flex flex-col">
                            <span className="font-medium group-hover:text-primary transition-colors">{client.name}</span>
                            <span className="text-xs text-muted-foreground">ID: #{client.displayId}</span>
                          </div>
                        </div>
                      </TableCell>
                       <TableCell>
                        {lastVisit ? format(lastVisit.date, 'PPP') : 'N/A'}
                       </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {services.slice(0, 2).map((service, index) => (
                              <Badge key={index} variant="outline" className="font-normal">{service}</Badge>
                          ))}
                          {services.length > 2 && (
                              <Badge variant="ghost">+{services.length - 2} more</Badge>
                          )}
                           {services.length === 0 && <span className="text-muted-foreground text-xs">No services</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {paymentStatus === 'Unpaid' ? (
                          <Badge variant="destructive">Unpaid</Badge>
                        ) : paymentStatus === 'Paid' ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Paid</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild><Link href={`/clients/${client.id}`} className="cursor-pointer flex items-center"><User className="mr-2 h-4 w-4" />View Profile</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href={`/clients/${client.id}/edit`} className="cursor-pointer flex items-center"><Pencil className="mr-2 h-4 w-4" />Edit Client</Link></DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center">
                                  <Trash2 className="mr-2 h-4 w-4" />Delete Client
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the client and all their visit history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteClient(client.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No clients found matching your search.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
