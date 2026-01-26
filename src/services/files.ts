import { createClient } from "@/utils/supabase/server"

export async function uploadFileService(file: File, projectId: string) {
  const supabase = await createClient()

  const timestamp = Date.now()
  const filePath = `${projectId}/${timestamp}_${file.name}`

  // 1. Upload do Storage
  const { error: uploadError } = await supabase
    .storage
    .from('project-files')
    .upload(filePath, file)

  if (uploadError) {
    throw uploadError
  }

  // 2. Rekord w bazie
  const { error: dbError } = await supabase
    .from('project_files')
    .insert({
      project_id: projectId,
      name: file.name,    
      file_path: filePath, 
      type: file.type,   
      size: file.size      
    })

  if (dbError) throw dbError
}

export async function getFileDownloadUrlService(filePath: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .storage
    .from('project-files')
    .createSignedUrl(filePath, 60)

  if (error || !data) {
    throw error || new Error("Failed to generate URL")
  }

  return data.signedUrl
}
