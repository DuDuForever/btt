
"use client"

import * as React from "react"
import { getClients } from "@/lib/data"
import type { Client } from "@/lib/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Pie, PieChart, Cell, LineChart, Line } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, Users, Calendar, Sparkles } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { startOfWeek, format } from "date-fns"

type RevenueData = {
  period: string
  revenue: number
}

type ServiceCount = {
  name: string
  count: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function AnalyticsPage() {
  const [clients, setClients] = React.useState<Client[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const data = await getClients()
      setClients(data)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const analyticsData = React.useMemo(() => {
    if (!clients.length) {
      return {
        totalRevenue: 0,
        avgRevenuePerClient: 0,
        totalVisits: 0,
        monthlyRevenue: [],
        weeklyRevenue: [],
        serviceCounts: [],
      }
    }

    const allVisits = clients.flatMap(c => c.visits)
    const totalRevenue = allVisits.reduce((acc, v) => acc + (v.paid ? v.amount : 0), 0)
    const totalVisits = allVisits.length
    const avgRevenuePerClient = clients.length > 0 ? totalRevenue / clients.length : 0

    // Monthly Revenue
    const monthlyRevenueMap = new Map<string, number>()
    // Weekly Revenue
    const weeklyRevenueMap = new Map<string, number>()

    allVisits.forEach(visit => {
      if (visit.paid) {
        const visitDate = new Date(visit.date);
        
        // Monthly calculation
        const month = format(visitDate, 'MMM yyyy');
        const currentMonthRevenue = monthlyRevenueMap.get(month) || 0
        monthlyRevenueMap.set(month, currentMonthRevenue + visit.amount)
        
        // Weekly calculation
        const weekStart = startOfWeek(visitDate, { weekStartsOn: 1 }); // Monday as start of week
        const week = format(weekStart, 'MMM dd, yyyy');
        const currentWeekRevenue = weeklyRevenueMap.get(week) || 0;
        weeklyRevenueMap.set(week, currentWeekRevenue + visit.amount);
      }
    })

    const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
      .map(([month, revenue]) => ({ period: month, revenue }))
      .sort((a, b) => new Date(a.period) as any - (new Date(b.period) as any))

    const weeklyRevenue = Array.from(weeklyRevenueMap.entries())
      .map(([week, revenue]) => ({ period: week, revenue }))
      .sort((a, b) => new Date(a.period) as any - (new Date(b.period) as any));

    // Service Counts
    const serviceCountMap = new Map<string, number>()
    allVisits.forEach(visit => {
      visit.services.forEach(service => {
        const currentCount = serviceCountMap.get(service) || 0
        serviceCountMap.set(service, currentCount + 1)
      })
    })

    const serviceCounts = Array.from(serviceCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6) // Top 6 services

    return { totalRevenue, avgRevenuePerClient, totalVisits, monthlyRevenue, weeklyRevenue, serviceCounts }
  }, [clients])

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-2))", // Green
    },
  }
  
  const RevenueChart = ({ data, periodLabel }: { data: RevenueData[], periodLabel: string }) => (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="period" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
        </LineChart>
        </ResponsiveContainer>
    </ChartContainer>
  )


  if (isLoading) {
      return (
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
              <Skeleton className="h-8 w-48" />
              <div className="grid gap-4 md:grid-cols-3">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                  <Skeleton className="h-80 w-full" />
                  <Skeleton className="h-80 w-full" />
              </div>
          </div>
      )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All-time revenue from paid visits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Revenue / Client</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.avgRevenuePerClient.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">Based on {clients.length} clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{analyticsData.totalVisits}</div>
            <p className="text-xs text-muted-foreground">Total appointments recorded</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
            <Tabs defaultValue="monthly">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Revenue</CardTitle>
                            <CardDescription>Revenue from paid visits per period.</CardDescription>
                        </div>
                        <TabsList>
                            <TabsTrigger value="weekly">Weekly</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        </TabsList>
                    </div>
                </CardHeader>
                <CardContent>
                    <TabsContent value="weekly">
                        <RevenueChart data={analyticsData.weeklyRevenue} periodLabel="Week" />
                    </TabsContent>
                    <TabsContent value="monthly">
                        <RevenueChart data={analyticsData.monthlyRevenue} periodLabel="Month" />
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Services</CardTitle>
             <CardDescription>Top 6 most frequently booked services.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie
                        data={analyticsData.serviceCounts}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                    >
                        {analyticsData.serviceCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
