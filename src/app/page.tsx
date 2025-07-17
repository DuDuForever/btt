
"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getClients } from "@/lib/data"
import type { Client, Visit } from "@/lib/types"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Calendar as CalendarIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

type Appointment = {
  client: { id: string, name: string },
  visit: Visit,
}

export default function CalendarPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [clients, setClients] = React.useState<Client[]>([])
  
  React.useEffect(() => {
    async function fetchClients() {
      const allClients = await getClients()
      setClients(allClients)
    }
    fetchClients()
  }, [])

  const appointmentsByDay = React.useMemo(() => {
    const appointmentsMap = new Map<string, Appointment[]>();
    clients.forEach(client => {
      client.visits.forEach(visit => {
        // Add only scheduled next visits to the calendar
        if (visit.nextVisit) {
            const nextVisitDate = new Date(visit.nextVisit);
            const nextDayStr = format(nextVisitDate, 'yyyy-MM-dd');
            if (!appointmentsMap.has(nextDayStr)) {
                appointmentsMap.set(nextDayStr, []);
            }
            // Use a placeholder visit object for next visits
            appointmentsMap.get(nextDayStr)!.push({
                client: { id: client.id, name: client.name },
                visit: { ...visit, date: nextVisitDate, services: ['Upcoming Appointment'], amount: 0, paid: false },
            });
        }
      })
    });
    return appointmentsMap;
  }, [clients]);

  const appointmentsForSelectedDate = React.useMemo(() => {
    if (!date) return []
    const dayStr = format(date, 'yyyy-MM-dd');
    return (appointmentsByDay.get(dayStr) || []).sort((a,b) => a.visit.date.getTime() - b.visit.date.getTime())
  }, [date, appointmentsByDay])

  const dayHasAppointment = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return appointmentsByDay.has(dayStr) && appointmentsByDay.get(dayStr)!.length > 0;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardContent className="p-0 flex justify-center">
             <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-4"
                modifiers={{
                  hasAppointment: dayHasAppointment
                }}
                modifiersClassNames={{
                  hasAppointment: "day-has-appointment",
                }}
                classNames={{
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                  day_today: "ring-2 ring-primary ring-offset-2",
                }}
              />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              Appointments for {date ? format(date, "PPP") : '...'}
            </CardTitle>
            <CardDescription>
              {appointmentsForSelectedDate.length} appointment(s) scheduled for this day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsForSelectedDate.length > 0 ? (
              <div className="space-y-4">
                {appointmentsForSelectedDate.map(({ client, visit }, index) => (
                   <Link href={`/clients/${client.id}`} key={`${client.id}-${visit.id}-${index}`} className="block hover:bg-muted/50 rounded-lg p-3 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none">{client.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {visit.services.slice(0, 2).map((service, serviceIndex) => (
                             <Badge key={serviceIndex} variant={'outline'} className="text-xs">{service}</Badge>
                          ))}
                           {visit.services.length > 2 && (
                            <Badge variant="ghost" className="text-xs">+{visit.services.length-2} more</Badge>
                           )}
                        </div>
                      </div>
                      <p className="text-sm font-medium">{format(new Date(visit.date), "p")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-2">
                <CalendarIcon className="h-12 w-12 text-muted-foreground/50"/>
                <p className="text-muted-foreground">No appointments scheduled for this day.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
