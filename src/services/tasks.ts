import { createClient } from "@/utils/supabase/server"

export async function createTaskService(data: {
  project_id: string
  title: string
  is_completed: boolean
  due_date: string | null
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').insert(data)
  if (error) throw error
}

export async function toggleTaskService(taskId: string, currentState: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .update({ is_completed: !currentState })
    .eq('id', taskId)
    
  if (error) throw error
}

export async function deleteTaskService(taskId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw error
}
