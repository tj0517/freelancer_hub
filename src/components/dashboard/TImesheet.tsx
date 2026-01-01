'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { logProjectTime } from "@/app/dashboard/actions"
import { Loader2, Clock, Coins } from "lucide-react"

// Typy danych (dostosuj do swoich)
type TimeLog = {
  id: string
  hours: number
  stage: string
  created_at: string
}

type Project = {
  id: string
  hourly_rate: number
  currency: string
  budget?: number
  time_logs: TimeLog[] // Zakładam, że pobierzesz to z bazy w joinie
}

export function ProjectTimeManager({ project }: { project: Project }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Obliczenia na żywo
  const totalHours = project.time_logs?.reduce((acc, log) => acc + log.hours, 0) || 0
  const totalCost = totalHours * (project.hourly_rate || 0)
  const estimatedHours = (project.budget && project.hourly_rate)
    ? (project.budget / project.hourly_rate).toFixed(1)
    : "0"

  async function handleAddLog(formData: FormData) {
    setIsSubmitting(true)
    try {
      await logProjectTime(formData)
      // Opcjonalnie: reset formularza
    } catch (e) {
      alert("Błąd")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* SEKCJA 1: Podsumowanie Finansowe */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Przepracowane Godziny
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-500" />
              {totalHours.toFixed(1)} h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Szacowane godziny
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Clock className="mr-2 h-5 w-5 text-orange-500" />
              {estimatedHours} h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktualny Koszt (Burn Rate)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Coins className="mr-2 h-5 w-5 text-green-500" />
              {totalCost.toFixed(2)} {project.currency}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Stawka: {project.hourly_rate} {project.currency}/h
            </p>
          </CardContent>
        </Card>

      </div>

      {/* SEKCJA 2: Formularz dodawania czasu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zaksięguj czas pracy</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleAddLog} className="grid gap-4 items-end grid-cols-1 md:grid-cols-4">

            {/* Ukryte ID projektu */}
            <input type="hidden" name="projectId" value={project.id} />

            <div className="grid gap-2">
              <Label>Etap</Label>
              <Select name="stage" defaultValue="development">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planowanie</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="development">Programowanie</SelectItem>
                  <SelectItem value="testing">Testy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Opis (opcjonalne)</Label>
              <Input name="description" placeholder="np. Poprawki w headerze" />
            </div>

            <div className="grid gap-2">
              <Label>Godziny</Label>
              <Input type="number" step="0.5" name="hours" placeholder="0.0" required />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Dodaj"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}