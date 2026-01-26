import { createClient } from "@/utils/supabase/server"

export async function getUserProfileService(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }
  
  return data
}
