import { createClient } from "@/utils/supabase/server"

export async function logTimeService(data: {
  project_id: string
  hours: number
  description: string
  stage: string
  logged_date: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('time_logs').insert(data)
  if (error) throw error
}
