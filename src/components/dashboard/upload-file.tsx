'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadFile } from "@/app/dashboard/actions"
import { useState } from "react"
import { UploadCloud } from "lucide-react"

export function UploadFileDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsUploading(true)
    try {
      await uploadFile(formData)
      setOpen(false) // Zamknij dopiero jak się uda
    } catch (e) {
      alert("Błąd podczas wysyłania pliku")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UploadCloud className="mr-2 h-4 w-4" />
          Dodaj plik
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Wgraj dokument</DialogTitle>
          <DialogDescription>
            Plik będzie widoczny dla Ciebie i dla klienta w Portalu.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="projectId" value={projectId} />

          <div className="grid gap-2">
            <Label htmlFor="file">Wybierz plik</Label>
            <Input 
              id="file" 
              name="file" 
              type="file" 
              required 
            />
          </div>

          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Wysyłanie..." : "Wyślij do chmury"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}