'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils" // Funkcja pomocnicza z Shadcn do łączenia klas
import { Package2 } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  // Funkcja sprawdzająca czy link jest aktywny
  const isActive = (path: string) => {
    // Dla Dashboardu (strona główna) wymagamy idealnego dopasowania
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    // Dla innych (Klienci, Projekty) wystarczy, że URL się od tego zaczyna
    // Dzięki temu jak wejdziesz w szczegóły projektu, guzik "Projekty" nadal świeci
    return pathname.startsWith(path)
  }

  return (
    <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <Package2 className="h-6 w-6" />
        <span className="sr-only">Freelance Hub</span>
      </Link>
      
      <Link 
        href="/dashboard" 
        className={cn(
          "transition-colors hover:text-foreground",
          isActive('/dashboard') ? "text-foreground font-bold" : "text-muted-foreground"
        )}
      >
        Dashboard
      </Link>

      <Link 
        href="/dashboard/clients" 
        className={cn(
          "transition-colors hover:text-foreground",
          isActive('/dashboard/clients') ? "text-foreground font-bold" : "text-muted-foreground"
        )}
      >
        Klienci
      </Link>

      <Link 
        href="/dashboard/projects" 
        className={cn(
          "transition-colors hover:text-foreground",
          isActive('/dashboard/projects') ? "text-foreground font-bold" : "text-muted-foreground"
        )}
      >
        Projekty
      </Link>
    </nav>
  )
}