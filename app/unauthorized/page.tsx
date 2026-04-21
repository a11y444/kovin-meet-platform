import Link from "next/link"
import { ShieldX, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          You do not have permission to access this page. Please contact your administrator 
          if you believe this is an error.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/login">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
