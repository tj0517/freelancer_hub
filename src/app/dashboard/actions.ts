'use server'

import { createClient } from "@/utils/supabase/server"
import { Currency } from "lucide-react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const clientId = formData.get("clientId") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as string
  const deadline = formData.get("deadline") as string
  const budget = formData.get("budget")
  const currency = formData.get("currency") as string

  await supabase.from('projects').insert({
    name,
    client_id: clientId,
    description,
    status,
    deadline: deadline || null,
    budget: budget ? parseFloat(budget.toString()) : null,
    currency
  })

  revalidatePath('/dashboard/projects')
}

export async function cClient(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get("companyName") as string
  const nip = formData.get("nip") as string
  const email = formData.get("email") as string
  
  if (!name) throw new Error("Nazwa firmy jest wymagana")

  await supabase.from("clients").insert({
    company_name: name,
    nip,
    email: email,
    status: 'active'
  })

  revalidatePath("/dashboard/clients")
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get("title") as string
  const projectId = formData.get("projectId") as string
  const deadline = formData.get("deadline") as string // Opcjonalny termin

  if (!title || !projectId) return

  await supabase.from('tasks').insert({
    project_id: projectId,
    title: title,
    is_completed: false,
    due_date: deadline || null
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function toggleTask(taskId: string, currentState: boolean, projectId: string) {
  const supabase = await createClient()

  await supabase
    .from('tasks')
    .update({ is_completed: !currentState })
    .eq('id', taskId)

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteTask(formData: FormData) {
  const supabase = await createClient()
  const taskId = formData.get("taskId") as string
  const projectId = formData.get("projectId") as string

  await supabase.from('tasks').delete().eq('id', taskId)
  
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateProjectDetails(formData: FormData) {
  const supabase = await createClient()
  
  const projectId = formData.get("projectId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as string
  const deadline = formData.get("deadline") as string
  const budget = formData.get("budget")
  const currency = formData.get("currency") as string



  await supabase
    .from('projects')
    .update({
      name,
      description,
      status,
      deadline: deadline || null, 
      budget: budget ? parseFloat(budget.toString()) : null,
      currency: currency || 'PLN',
    })
    .eq('id', projectId)

  // 3. Odświeżamy widok
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateProjectStatus(formData: FormData) {
  const supabase = await createClient()
  
  const projectId = formData.get("projectId") as string
  const status = formData.get("status") as string

  if (!projectId || !status) return;

  await supabase
    .from('projects')
    .update({ status: status })
    .eq('id', projectId)

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteProject(formData: FormData) {
  const supabase = await createClient()
  const projectId = formData.get("projectId") as string

  await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  redirect('/dashboard/projects')
}


export async function uploadFile(formData: FormData) {
  const supabase = await createClient()

  const projectId = formData.get("projectId") as string
  const file = formData.get("file") as File

  if (!file || !projectId) return

  const timestamp = Date.now()
  const filePath = `${projectId}/${timestamp}_${file.name}`

  const { error: uploadError } = await supabase
    .storage
    .from('project-files')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Błąd uploadu:', uploadError)
    throw new Error('Nie udało się wgrać pliku')
  }

  await supabase
    .from('project_files')
    .insert({
      project_id: projectId,
      name: file.name,    
      file_path: filePath, 
      type: file.type,   
      size: file.size      
    })

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function downloadFile(formData: FormData) {
  const supabase = await createClient()
  const filePath = formData.get("filePath") as string

  const { data, error } = await supabase
    .storage
    .from('project-files')
    .createSignedUrl(filePath, 60)

  if (error || !data) {
    console.error("Błąd generowania linku:", error)
    return
  }

  redirect(data.signedUrl)
}

export async function logProjectTime(formData: FormData) {
  const supabase = await createClient()

  const projectId = formData.get("projectId") as string
  const hours = parseFloat(formData.get("hours") as string)
  const description = formData.get("description") as string
  const stage = formData.get("stage") as string

  if (!projectId || !hours) {
    throw new Error("Brak wymaganych danych")
  }

  const { error } = await supabase.from("time_logs").insert({
    project_id: projectId,
    hours: hours,
    description: description,
    stage: stage,
    logged_date: new Date().toISOString()
  })

  if (error) {
    console.error("Błąd logowania czasu:", error)
    throw new Error("Nie udało się dodać czasu")
  }

  revalidatePath(`/dashboard/projects`) // Odśwież widok
}