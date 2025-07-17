
"use client"

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
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Calendar as CalendarIcon } from "lucide-react"
import { getClients } from "@/lib/data"
import type { Client, Visit } from "@/lib/types"
import { format, isSameDay } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"

type ClientVisit = {
  client: { id: string; name: string; };
  visit: Visit;
}

export default function DashboardPage() {
  const [clients, setClients] = React.useState<Client[]>([])
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())

  React.useEffect(() => {
    async function fetchClients() {
      setIsLoading(true)
      const data = await getClients()
      setClients(data)
      setIsLoading(false)
    }
    fetchClients()
  }, [])

  const visitsForSelectedDate = React.useMemo(() => {
    if (!selectedDate) return [];
    let visits: ClientVisit[] = [];
    clients.forEach(client => {
      client.visits.forEach(visit => {
        if (isSameDay(new Date(visit.date), selectedDate)) {
            visits.push({
              client: { id: client.id, name: client.name },
              visit: { ...visit, date: new Date(visit.date) }
            })
        }
      })
    })
    return visits.sort((a,b) => a.visit.date.getTime() - b.visit.date.getTime())
  }, [clients, selectedDate])
  
  const paidVisits = visitsForSelectedDate.filter(v => v.visit.paid)
  const unpaidVisits = visitsForSelectedDate.filter(v => !v.visit.paid)

  const totalPaid = paidVisits.reduce((acc, v) => acc + (v.visit.amount || 0), 0)
  const totalUnpaid = unpaidVisits.reduce((acc, v) => acc + (v.visit.amount || 0), 0)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Daily stats for {selectedDate ? format(selectedDate, "PPP") : '...'}
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className="w-full sm:w-auto justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
          <Card>
              <CardHeader>
                  <CardTitle className="text-green-600">Total Paid</CardTitle>
                  <CardDescription>Revenue collected for the selected day.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">${totalPaid.toFixed(2)}</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader>
                  <CardTitle className="text-destructive">Total Unpaid</CardTitle>
                  <CardDescription>Outstanding revenue for the selected day.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">${totalUnpaid.toFixed(2)}</p>
              </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Visits</CardTitle>
          <CardDescription>
            A list of all client visits for the selected day.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : visitsForSelectedDate.length > 0 ? (
                visitsForSelectedDate.map(({ client, visit }) => (
                  <TableRow key={visit.id}>
                    <TableCell>
                      <Link href={`/clients/${client.id}`} className="flex items-center gap-4 group">
                        <Avatar className="h-10 w-10 border">
                          <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                        <span className="font-medium group-hover:text-primary transition-colors">{client.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>{format(visit.date, 'p')}</TableCell>
                    <TableCell>
                        <Badge variant={visit.paid ? "default" : "destructive"}>
                            {visit.paid ? 'Paid' : 'Unpaid'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">${visit.amount?.toFixed(2) || '0.00'}</TableCell>
                  </TableRow>
                ))
              ) : (
                  <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No visits scheduled for this day.
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
