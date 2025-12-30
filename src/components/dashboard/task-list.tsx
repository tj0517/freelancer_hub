'use client'

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react"
import { createTask, toggleTask, deleteTask } from "@/app/dashboard/actions"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

interface Task {
  id: string
  title: string
  is_completed: boolean
  due_date: string | null
}

export function TaskList({ tasks, projectId, deadline_date }: { tasks: Task[], projectId: string, deadline_date?: string }) {
  
  // Stan do obsługi daty w formularzu dodawania
  const [date, setDate] = useState<Date | undefined>(
    deadline_date ? new Date(deadline_date) : undefined
  )

  return (
    <div className="space-y-6">
      
      {/* 1. FORMULARZ DODAWANIA ZADANIA */}
      <form action={createTask} className="flex gap-2 items-start">
        <input type="hidden" name="projectId" value={projectId} />
        {date && <input type="hidden" name="deadline" value={date.toISOString()} />}
        
        <div className="flex-1">
          <Input 
            name="title" 
            placeholder="Co jest do zrobienia?" 
            required 
            autoComplete="off"
          />
        </div>

        {/* Wybór daty (Opcjonalny) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[40px] px-0 lg:w-auto lg:px-3 text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">
                {date ? format(date, "d MMM", { locale: pl }) : "Termin"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button type="submit" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* 2. LISTA ZADAŃ */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
            Brak zadań. Dodaj pierwsze powyżej!
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id} 
              className={cn(
                "flex items-center justify-between p-3 rounded-md border transition-all",
                task.is_completed ? "bg-slate-50 border-slate-100" : "bg-white hover:border-blue-300"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {/* Checkbox jako wyzwalacz akcji */}
                <Checkbox 
                  checked={task.is_completed}
                  onCheckedChange={async () => {
                    await toggleTask(task.id, task.is_completed, projectId)
                  }}
                />
                
                <div className="flex flex-col min-w-0">
                  <span className={cn(
                    "text-sm font-medium truncate transition-all",
                    task.is_completed && "text-muted-foreground line-through decoration-slate-400"
                  )}>
                    {task.title}
                  </span>
                  
                  {task.due_date && (
                    <span className={cn(
                        "text-[10px] flex items-center gap-1",
                        task.is_completed ? "text-slate-300" : "text-orange-500"
                    )}>
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString('pl-PL')}
                    </span>
                  )}
                </div>
              </div>

              {/* Przycisk usuwania */}
              <form action={deleteTask}>
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="projectId" value={projectId} />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  )
}