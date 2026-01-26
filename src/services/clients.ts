import { createClient } from "@/utils/supabase/server"

export async function createClientService(data: {
  company_name: string
  nip: string
  email: string
  status: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from("clients").insert(data)
  if (error) throw error
}

export async function updateClientService(id: string, data: {
  company_name: string
  nip: string
  email: string
  status: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from("clients").update(data).eq("id", id)
  if (error) throw error
}

export async function deleteClientService(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("clients").delete().eq("id", id)
  if (error) throw error
}

export async function getClientsService() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("clients")
    .select("*, projects(count)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getRecentClientsService(limit: number = 5) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getClientByIdService(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("clients")
    .select(`
      *,
      projects (
        id,
        name,
        status,
        deadline,
        budget,
        currency
      )
    `)
    .eq("id", id)
    .single()

  if (error) return null
  return data
}

export async function getActiveClientsService() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('status', 'active')
    
  if (error) throw error
  return data
}

