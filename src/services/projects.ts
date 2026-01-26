import { createClient } from "@/utils/supabase/server"

export async function getProjectById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (
        company_name,
        email,
        phone
      ),
      tasks (*),
      project_files(*),
      time_logs (
        id, hours, stage, created_at, description
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error("Error fetching project:", error)
    return null
  }

  return data
}

export async function createProjectService(data: {
  name: string
  client_id: string
  description: string
  status: string
  deadline: string | null
  budget: number | null
  currency: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').insert(data)
  if (error) throw error
}

export async function updateProjectService(id: string, data: {
  name?: string
  description?: string
  status?: string
  deadline?: string | null
  budget?: number | null
  currency?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').update(data).eq('id', id)
  if (error) throw error
}

// --- Dashboard Queries ---

export async function getDashboardStats() {
  const supabase = await createClient()
  
  const [
    { count: totalClients },
    { count: activeProjects },
    { data: budgetData } 
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).neq('status', 'completed'),
    supabase.from('projects').select('budget').not('budget', 'is', null)
  ])

  const totalBudget = budgetData?.reduce((acc, curr) => acc + (curr.budget || 0), 0) || 0

  return {
    totalClients: totalClients || 0,
    activeProjects: activeProjects || 0,
    totalBudget
  }
}

export async function getRecentProjects(limit: number = 5) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*, clients(company_name)')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return data || []
}

export async function getAllProjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*, clients(company_name)')
    .order('deadline', { ascending: true })
  
  return data || []
}

export async function deleteProjectService(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

