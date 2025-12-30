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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createProject } from "@/app/dashboard/actions"
import { useState } from "react"
import { Plus, Loader2 } from "lucide-react" // <--- Dodałem ikonę ładowania

type Client = {
  id: string
  company_name: string
}

export function NewProjectDialog({ clients }: { clients: Client[] }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // <--- Nowy stan

  async function handleSubmit(formData: FormData) {
    if (isSubmitting) return // Dodatkowe zabezpieczenie

    setIsSubmitting(true) // Blokujemy
    try {
      await createProject(formData)
      setOpen(false) // Zamykamy modal tylko po sukcesie
    } catch (error) {
      console.error("Błąd tworzenia projektu:", error)
      // Tutaj opcjonalnie możesz dodać toast z błędem
    } finally {
      setIsSubmitting(false) // Odblokowujemy (ważne w przypadku błędu)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Zapobiegamy przypadkowemu zamknięciu modala podczas wysyłania
      if (!isSubmitting) setOpen(val)
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nowy Projekt
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Dodaj Projekt</DialogTitle>
          <DialogDescription>
            Wypełnij szczegóły nowego zlecenia.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="grid gap-4 py-4">
          
          {/* RZĄD 1: Nazwa i Klient */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nazwa Projektu</Label>
              <Input id="name" name="name" placeholder="np. Redesign Strony" required disabled={isSubmitting} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client">Klient</Label>
              <Select name="clientId" required disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* RZĄD 2: Status i Priorytet */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status początkowy</Label>
              <Select name="status" defaultValue="planning" disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planowanie</SelectItem>
                  <SelectItem value="in_progress">W Realizacji</SelectItem>
                  <SelectItem value="review">Odbiór</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Tutaj było puste miejsce w Twoim kodzie, opcjonalnie można coś dodać lub usunąć grid */}
            <div className="grid gap-2">
              {/* Pusty placeholder lub np. Priorytet */}
            </div>
          </div>

          {/* RZĄD 3: Budżet i Waluta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="budget">Budżet</Label>
              <Input 
                id="budget" 
                name="budget" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currency">Waluta</Label>
              <Select name="currency" defaultValue="PLN" disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLN">PLN</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* RZĄD 4: Termin oddania */}
          <div className="grid gap-2">
            <Label htmlFor="deadline">Termin oddania (Deadline)</Label>
            <Input id="deadline" name="deadline" type="date" required disabled={isSubmitting} />
          </div>

          {/* RZĄD 5: Opis */}
          <div className="grid gap-2">
            <Label htmlFor="description">Zakres prac (Opis)</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Krótki opis, co jest do zrobienia..." 
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tworzenie...
                </>
              ) : (
                'Utwórz Projekt'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}