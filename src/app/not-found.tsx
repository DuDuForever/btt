import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-10">
      <FileQuestion className="w-24 h-24 text-primary mb-6" />
      <h1 className="text-4xl font-bold tracking-tight text-center mb-2">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground text-center mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Button asChild>
        <Link href="/">Return to Calendar</Link>
      </Button>
    </div>
  )
}
