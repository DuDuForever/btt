
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format, setHours, setMinutes } from "date-fns"
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Loader2, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SERVICES } from "@/lib/constants"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { ScrollArea } from "./ui/scroll-area"


const formSchema = z.object({
  date: z.date({ required_error: "Visit date is required." }),
  services: z.array(z.string()).min(1, { message: "Please select at least one service." }),
  amount: z.coerce.number().min(0, "Amount must be a positive number."),
  paid: z.boolean().default(false),
  notes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),
  nextVisit: z.date().optional().nullable(),
})

type AddVisitFormProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
  isSubmitting: boolean
}

const OTHER_SERVICE_VALUE = "other-service";

export function AddVisitForm({ onSubmit, isSubmitting }: AddVisitFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      services: [],
      amount: 0,
      paid: false,
      notes: "",
      nextVisit: null,
    },
  })

  const [customService, setCustomService] = React.useState("");
  const [showCustomServiceInput, setShowCustomServiceInput] = React.useState(false);

  
  const handleTimeChange = (field: 'date' | 'nextVisit', timeValue: string) => {
    const existingDate = form.getValues(field) || new Date();
    const [hours, minutes] = timeValue.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
        let newDate = setHours(existingDate, hours);
        newDate = setMinutes(newDate, minutes);
        form.setValue(field, newDate, { shouldValidate: true });
    }
  }

  const handleAddCustomService = () => {
    if (customService.trim()) {
        const currentServices = form.getValues("services");
        form.setValue("services", [...currentServices, customService.trim()]);
        setCustomService("");
        setShowCustomServiceInput(false);
    }
  }
  
  const handleRemoveService = (serviceToRemove: string) => {
    const currentServices = form.getValues("services");
    form.setValue("services", currentServices.filter(s => s !== serviceToRemove));
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col col-span-2">
                <FormLabel>Visit Date & Time</FormLabel>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="time" 
                            className="pl-10" 
                            defaultValue={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => handleTimeChange('date', e.target.value)}
                        />
                    </div>
                </div>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
            control={form.control}
            name="services"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Services Rendered</FormLabel>
                <Dialog>
                  <DialogTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between h-auto min-h-10",
                          !field.value?.length && "text-muted-foreground"
                        )}
                      >
                        <div className="flex gap-1 flex-wrap">
                          {field.value?.length > 0 ? field.value.map((service) => (
                            <Badge
                              variant="secondary"
                              key={service}
                              className="mr-1"
                            >
                              {service}
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveService(service); }} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                              </button>
                            </Badge>
                          )) : "Select services"}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle>Select Services</DialogTitle>
                      <DialogDescription>
                        Search for and select all services rendered during this visit.
                      </DialogDescription>
                    </DialogHeader>
                    <Command>
                      <CommandInput placeholder="Search services..." />
                      <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                        <CommandEmpty>No service found.</CommandEmpty>
                        <CommandGroup>
                        {SERVICES.map((service) => (
                            <CommandItem
                            value={service}
                            key={service}
                            onSelect={() => {
                                const currentServices = field.value || []
                                if (!currentServices.includes(service)) {
                                    field.onChange([...currentServices, service])
                                }
                            }}
                            >
                            <Check
                                className={cn(
                                "mr-2 h-4 w-4",
                                field.value?.includes(service)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                            />
                            {service}
                            </CommandItem>
                        ))}
                        <CommandItem
                            value={OTHER_SERVICE_VALUE}
                            onSelect={() => {
                                setShowCustomServiceInput(true);
                            }}
                        >
                            Other...
                        </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                    {showCustomServiceInput && (
                      <div className="flex gap-2 mt-2 pt-2 border-t">
                          <Input 
                              placeholder="Enter custom service"
                              value={customService}
                              onChange={(e) => setCustomService(e.target.value)}
                          />
                          <Button type="button" onClick={handleAddCustomService}>Add</Button>
                      </div>
                    )}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button">Done</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <FormMessage />
              </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Amount Charged</FormLabel>
                <FormControl>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                        <Input type="number" placeholder="0.00" className="pl-7" {...field} />
                    </div>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Visit Notes</FormLabel>
                <FormControl>
                    <Textarea
                    placeholder="Details about this specific visit..."
                    className="resize-none"
                    {...field}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="paid"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <FormLabel>Paid</FormLabel>
                    <FormDescription>
                    Mark if this visit has been paid for.
                    </FormDescription>
                </div>
                <FormControl>
                    <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                </FormControl>
                </FormItem>
            )}
        />
        <Separator />
        <div className="space-y-4">
            <h3 className="text-md font-medium">Schedule Next Visit (Optional)</h3>
             <FormField
            control={form.control}
            name="nextVisit"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                        />
                        </PopoverContent>
                    </Popover>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="time" 
                            className="pl-10" 
                            disabled={!field.value}
                            defaultValue={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => handleTimeChange('nextVisit', e.target.value)}
                        />
                    </div>
                </div>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Visit
          </Button>
        </div>
      </form>
    </Form>
  )
}
