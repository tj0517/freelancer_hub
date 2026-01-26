'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { 
  createProjectService, 
  updateProjectService, 
  deleteProjectService 
} from "@/services/projects"
import { 
  createTaskService, 
  toggleTaskService, 
  deleteTaskService 
} from "@/services/tasks"
import { createClientService, deleteClientService } from "@/services/clients"
import { logTimeService } from "@/services/logs"

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string
  const clientId = formData.get("clientId") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as string
  const deadline = formData.get("deadline") as string
  const budget = formData.get("budget")
  const currency = formData.get("currency") as string

  await createProjectService({
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
  const name = formData.get("companyName") as string
  const nip = formData.get("nip") as string
  const email = formData.get("email") as string
  
  if (!name) throw new Error("Nazwa firmy jest wymagana")

  await createClientService({
    company_name: name,
    nip,
    email: email,
    status: 'active'
  })

  revalidatePath("/dashboard/clients")
}

export async function deleteClient(formData: FormData) {
  const clientId = formData.get("clientId") as string
  await deleteClientService(clientId)
  redirect('/dashboard/clients')
}

export async function createTask(formData: FormData) {
  const title = formData.get("title") as string
  const projectId = formData.get("projectId") as string
  const deadline = formData.get("deadline") as string // Opcjonalny termin

  if (!title || !projectId) return

  await createTaskService({
    project_id: projectId,
    title: title,
    is_completed: false,
    due_date: deadline || null
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function toggleTask(taskId: string, currentState: boolean, projectId: string) {
  await toggleTaskService(taskId, currentState)
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteTask(formData: FormData) {
  const taskId = formData.get("taskId") as string
  const projectId = formData.get("projectId") as string

  await deleteTaskService(taskId)
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateProjectDetails(formData: FormData) {
  const projectId = formData.get("projectId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as string
  const deadline = formData.get("deadline") as string
  const budget = formData.get("budget")
  const currency = formData.get("currency") as string

  await updateProjectService(projectId, {
    name,
    description,
    status,
    deadline: deadline || null, 
    budget: budget ? parseFloat(budget.toString()) : null,
    currency: currency || 'PLN',
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateProjectStatus(formData: FormData) {
  const projectId = formData.get("projectId") as string
  const status = formData.get("status") as string

  if (!projectId || !status) return;

  await updateProjectService(projectId, { status })
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteProject(formData: FormData) {
  const projectId = formData.get("projectId") as string
  await deleteProjectService(projectId)
  redirect('/dashboard/projects')
}


import { uploadFileService, getFileDownloadUrlService } from "@/services/files"

export async function uploadFile(formData: FormData) {
  const projectId = formData.get("projectId") as string
  const file = formData.get("file") as File

  if (!file || !projectId) return

  try {
    await uploadFileService(file, projectId)
    revalidatePath(`/dashboard/projects/${projectId}`)
  } catch (error) {
    console.error('Błąd uploadu:', error)
    throw new Error('Nie udało się wgrać pliku')
  }
}

export async function downloadFile(formData: FormData) {
  const filePath = formData.get("filePath") as string
  
  try {
    const url = await getFileDownloadUrlService(filePath)
    redirect(url)
  } catch (error) {
    console.error("Błąd generowania linku:", error)
  }
}

export async function logProjectTime(formData: FormData) {
  const projectId = formData.get("projectId") as string
  const hours = parseFloat(formData.get("hours") as string)
  const description = formData.get("description") as string
  const stage = formData.get("stage") as string

  if (!projectId || !hours) {
    throw new Error("Brak wymaganych danych")
  }

  await logTimeService({
    project_id: projectId,
    hours: hours,
    description: description,
    stage: stage,
    logged_date: new Date().toISOString()
  })

  revalidatePath(`/dashboard/projects`) // Odśwież widok
}