
"use client"

import * as React from "react"
import {
  SidebarProvider,
} from "@/components/ui/sidebar"
import { SalonFlowLogo } from "@/components/icons"
import { Button } from "./ui/button"
import {
  CalendarDays,
  Users,
  Settings,
  User,
  PanelLeft,
  Wallet,
  LayoutDashboard,
  BellRing,
  LineChart,
  LogOut,
  Shield,
  User as UserIcon
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "./ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { useAuth } from "@/hooks/use-auth"

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['owner'] },
  { href: "/analytics", label: "Analytics", icon: LineChart, roles: ['owner'] },
  { href: "/clients", label: "Clients", icon: Users, roles: ['owner', 'assistant'] },
  { href: "/", label: "Calendar", icon: CalendarDays, roles: ['owner', 'assistant'] },
  { href: "/payments", label: "Payments", icon: Wallet, roles: ['owner'] },
  { href: "/reminders", label: "Reminders", icon: BellRing, roles: ['owner'] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ['owner'] },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout, role, setRole } = useAuth()
  
  const navItems = React.useMemo(() => {
    return allNavItems.filter(item => item.roles.includes(role!))
  }, [role]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
           <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-2">
                 <div className="flex items-center gap-2 p-4 border-b">
                  <SalonFlowLogo className="w-8 h-8 text-primary" />
                  <span className="text-xl font-semibold">SalonFlow</span>
                </div>
                <nav className="grid gap-2 text-lg font-medium p-2">
                  {navItems.map((item) => (
                     <Button
                      asChild
                      key={item.href}
                      variant={
                        pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                          ? "secondary"
                          : "ghost"
                      }
                      className="w-full justify-start"
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-2 h-5 w-5" />
                        {item.label}
                      </Link>
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <div className="w-full flex-1" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>
                      {role === 'owner' ? <Shield className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.email || "My Account"}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground -mt-2 capitalize">{role} Mode</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => setRole(null)} className="cursor-pointer flex items-center">
                    <Users className="mr-2 h-4 w-4" />Change Role
                 </DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/settings" className="cursor-pointer flex items-center"><Settings className="mr-2 h-4 w-4" />Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </header>
        <main className="flex-1">
            {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
