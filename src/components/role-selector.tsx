
"use client"

import * as React from "react"
import { useAuth, type UserRole } from "@/hooks/use-auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, User as UserIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "./ui/button"
import { useToast } from "@/hooks/use-toast"

const OWNER_PIN = "9094" // The hardcoded owner PIN

export function RoleSelector() {
  const { setRole } = useAuth()
  const [selection, setSelection] = React.useState<UserRole>(null)
  const [pin, setPin] = React.useState("")
  const [error, setError] = React.useState("")
  const { toast } = useToast()

  const handlePinSubmit = () => {
    if (pin === OWNER_PIN) {
      toast({ title: "Welcome, Owner!", description: "You have full access." })
      setRole("owner")
    } else {
      setError("Incorrect PIN. Please try again.")
    }
  }

  const handleSelectAssistant = () => {
    toast({ title: "Welcome, Assistant!", description: "You have restricted access." })
    setRole("assistant")
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Select Your Role</DialogTitle>
          <DialogDescription className="text-center">
            Choose how you want to access the dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {!selection ? (
            <div className="grid grid-cols-2 gap-4">
              <Card
                className="cursor-pointer hover:bg-muted transition-colors text-center p-6"
                onClick={() => setSelection("owner")}
              >
                <Shield className="w-12 h-12 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">Owner</h3>
              </Card>
              <Card
                className="cursor-pointer hover:bg-muted transition-colors text-center p-6"
                onClick={handleSelectAssistant}
              >
                <UserIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-semibold">Assistant</h3>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-center font-semibold">Enter Owner PIN</h3>
              <div className="flex justify-center">
                <Input
                    type="password"
                    maxLength={4}
                    className="w-48 text-center text-2xl tracking-[1em]"
                    value={pin}
                    onChange={(e) => {
                        setPin(e.target.value.replace(/[^0-9]/g, ''));
                        setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
                />
              </div>
              {error && <p className="text-center text-sm text-destructive">{error}</p>}
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => setSelection(null)}>Back</Button>
                <Button onClick={handlePinSubmit}>Enter</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
