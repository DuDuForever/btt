
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
import { User, Filter } from "lucide-react"
import { getClients } from "@/lib/data"
import type { Client, Visit } from "@/lib/types"
import { format, startOfDay, endOfDay } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { Skeleton } from "@/components/ui/skeleton"

type ClientVisit = {
  client: { id: string; name: string; };
  visit: Visit;
}

export default function PaymentsPage() {
  const [clients, setClients] = React.useState<Client[]>([])
  const [isLoading, setIsLoading] = React.useState(true);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

  React.useEffect(() => {
    async function fetchClients() {
      setIsLoading(true)
      const data = await getClients()
      setClients(data)
      setIsLoading(false)
    }
    fetchClients()
  }, [])

  const allVisits = React.useMemo(() => {
    let visits: ClientVisit[] = [];
    clients.forEach(client => {
      client.visits.forEach(visit => {
        visits.push({
          client: { id: client.id, name: client.name },
          visit: { ...visit, date: new Date(visit.date) }
        })
      })
    })

    if (!dateRange || !dateRange.from) return visits;

    const fromDate = startOfDay(dateRange.from);
    const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

    return visits.filter(v => {
        const visitDate = v.visit.date;
        return visitDate >= fromDate && visitDate <= toDate;
    })
  }, [clients, dateRange])
  
  const paidVisits = allVisits.filter(v => v.visit.paid)
  const unpaidVisits = allVisits.filter(v => !v.visit.paid)

  const totalPaid = paidVisits.reduce((acc, v) => acc + (v.visit.amount || 0), 0)
  const totalUnpaid = unpaidVisits.reduce((acc, v) => acc + (v.visit.amount || 0), 0)

  const PaymentTable = ({ visits, type }: { visits: ClientVisit[], type: 'paid' | 'unpaid'}) => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Visit Date</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : visits.length > 0 ? (
              visits.map(({ client, visit }) => (
                <TableRow key={visit.id}>
                  <TableCell>
                    <Link href={`/clients/${client.id}`} className="flex items-center gap-4 group">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                      </Avatar>
                      <span className="font-medium group-hover:text-primary transition-colors">{client.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell>{format(visit.date, 'PPP')}</TableCell>
                  <TableCell className="text-right font-medium">${visit.amount?.toFixed(2) || '0.00'}</TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                    No {type} payments in this period.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">Track paid and outstanding payments.</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className="w-full sm:w-[300px] justify-start text-left font-normal"
            >
              <Filter className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Filter by date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
          <Card>
              <CardHeader>
                  <CardTitle className="text-green-600">Total Paid</CardTitle>
                  <CardDescription>Total revenue collected in the selected period.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">${totalPaid.toFixed(2)}</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader>
                  <CardTitle className="text-destructive">Total Unpaid</CardTitle>
                  <CardDescription>Total outstanding revenue in the selected period.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">${totalUnpaid.toFixed(2)}</p>
              </CardContent>
          </Card>
      </div>

      <Tabs defaultValue="unpaid">
        <TabsList>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
        <TabsContent value="unpaid">
            <PaymentTable visits={unpaidVisits} type="unpaid" />
        </TabsContent>
        <TabsContent value="paid">
            <PaymentTable visits={paidVisits} type="paid" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
