'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { cClient } from "@/app/dashboard/actions"

export function NewClientDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Wywołujemy Twoją server action
      await cClient(formData)
      // Jeśli się uda (nie rzuci błędem), zamykamy okno
      setOpen(false)
    } catch (error) {
      console.error("Błąd dodawania klienta:", error)
      alert("Wystąpił błąd podczas dodawania klienta.") // Prosta obsługa błędu
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && setOpen(val)}>
      <DialogTrigger asChild>
        {/* Przycisk otwierający modal */}
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Dodaj Klienta
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj nowego klienta</DialogTitle>
          <DialogDescription>
            Wprowadź dane firmy, aby utworzyć profil klienta.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="grid gap-4 py-4">
          
          {/* Nazwa firmy */}
          <div className="grid gap-2">
            <Label htmlFor="companyName">Nazwa firmy *</Label>
            <Input 
              id="companyName" 
              name="companyName" 
              placeholder="np. Acme Corp" 
              required 
              disabled={isSubmitting}
            />
          </div>

          {/* NIP */}
          <div className="grid gap-2">
            <Label htmlFor="nip">NIP</Label>
            <Input 
              id="nip" 
              name="nip" 
              placeholder="np. 1234567890" 
              disabled={isSubmitting}
            />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email kontaktowy</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="kontakt@firma.pl" 
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                'Zapisz klienta'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}