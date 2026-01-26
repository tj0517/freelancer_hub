import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Calendar, CheckCircle2, Clock, Download, FileText, Upload, ArrowLeftCircle } from "lucide-react"
import { TaskList } from "@/components/dashboard/task-list"
import Link from "next/link"
import { updateProjectDetails, updateProjectStatus, downloadFile } from "@/app/dashboard/actions"
import { deleteProject } from "@/app/dashboard/actions"
import { UploadFileDialog } from "@/components/dashboard/upload-file"
import { ProjectTimeManager } from "@/components/dashboard/TImesheet"
import { ProjectHoursList } from "@/components/dashboard/project-hours-list"
import { SubmitButton } from "@/components/submit-button"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailsPage({ params }: PageProps) {

  const { id } = await params

  const supabase = await createClient()



  const { data: project, error } = await supabase
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


  if (error || !project) {
    notFound()
  }

  const totalTasks = project.tasks?.length || 0
  const completedTasks = project.tasks?.filter((t: any) => t.is_completed).length || 0

  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
  const estimatedHours = (project.budget && project.hourly_rate) ? (project.budget / project.hourly_rate).toFixed(1) : "0"

  return (
    <div className="flex flex-col gap-6">

      <div className="w-full">
        <Link href="/dashboard">
          <ArrowLeftCircle strokeWidth={2} size={40} />
        </Link>

      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="capitalize">
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Klient: <span className="font-medium text-foreground">{project.clients?.company_name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">

          {project.status !== 'completed' && (
            <form action={updateProjectStatus}>
              <input type="hidden" name="projectId" value={project.id} />

              <input type="hidden" id="status" name="status" value="completed" />

              <SubmitButton
                size="sm"
                className="bg-green-600 hover:bg-green-700 hover:cursor-pointer text-white"
                loadingText="Zamykanie..."
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Zakończ Projekt
              </SubmitButton>
            </form>
          )}
        </div>
      </div>

      <ProjectTimeManager project={project} />



      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Przegląd</TabsTrigger>
          <TabsTrigger value="files">Pliki i Dokumenty</TabsTrigger>
          <TabsTrigger value="settings">Ustawienia</TabsTrigger>
          <TabsTrigger value="time_logs">Czas Pracy</TabsTrigger>
        </TabsList>


        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">


            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Postęp prac</CardTitle>
                <CardDescription>Status realizacji zlecenia do terminu {project.deadline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm pb-4">
                  <span>Realizacja</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />

                <div className="mt-6 grid gap-4 md:grid-cols-2">

                  <div className="flex items-center gap-4 rounded-lg border px-6 py-2">
                    <Calendar className="h-6 w-6 text-green-500 " />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Data startu</p>
                      <p className="text-xs text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Formalności</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid gap-1">
                  <span className="font-medium">Status Umowy</span>
                  <span className="text-muted-foreground">Wystawiona</span>
                </div>
                <Separator />
                <div className="grid gap-1">
                  <span className="font-medium">Status Faktury</span>
                  <span className="text-muted-foreground">Wystawiona</span>
                </div>
                <Separator />
                <div className="grid gap-1">
                  <span className="font-medium">Budzet projektu</span>
                  <span className="text-muted-foreground">{project?.budget + " " + project?.currency || "Brak ustalonego budzetu"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Lista Zadań (To-Do)</CardTitle>
                <CardDescription>Zarządzaj zakresem prac w projekcie.</CardDescription>
              </CardHeader>
              <CardContent>

                <TaskList tasks={project.tasks || []} projectId={project.id} deadline_date={project.deadline_date} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dane Kontaktowe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid gap-1">
                  <span className="font-medium">Firma</span>
                  <a href={"/dashboard/clients/" + project.client_id} className="text-muted-foreground">{project.clients?.company_name}</a>
                </div>
                <Separator />
                <div className="grid gap-1">
                  <span className="font-medium">Email</span>
                  <a href={`mailto:${project.clients?.email}`} className="text-blue-600 hover:underline">
                    {project.clients?.email || "Brak emaila"}
                  </a>
                </div>
                <Separator />
                <div className="grid gap-1">
                  <span className="font-medium">Telefon</span>
                  <span className="text-muted-foreground">{project.clients?.phone || "Brak telefonu"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="files">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Dokumenty</CardTitle>

                <UploadFileDialog projectId={project.id} />
              </CardHeader>
              <CardContent>
                {(project.project_files && project.project_files.length > 0) ? (
                  <div className="grid gap-3 pt-4">
                    {project.project_files.map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-md bg-slate-50">


                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-10 w-10 flex items-center justify-center rounded bg-white border">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate pr-4">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB • {new Date(file.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <form action={downloadFile}>
                          <input type="hidden" name="filePath" value={file.file_path} />
                          <SubmitButton variant="ghost" size="icon" title="Pobierz plik" loadingText="">
                            <Download className="h-4 w-4 text-slate-500 hover:text-black" />
                          </SubmitButton>
                        </form>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Brak dokumentów w tym projekcie.</p>
                    <p className="text-xs">Wgraj umowy, briefy lub faktury.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="time_logs">
          <ProjectHoursList timeLogs={project.time_logs} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia Projektu</CardTitle>
              <CardDescription>
                Edytuj kluczowe parametry projektu. Zmiany są widoczne natychmiast.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateProjectDetails} className="space-y-6">
                <input type="hidden" name="projectId" value={project.id} />

                <div className="grid gap-2">
                  <Label htmlFor="name">Nazwa Projektu</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={project.name}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  <div className="grid gap-2">
                    <Label htmlFor="status">Etap (Status)</Label>
                    <select
                      id="status"
                      name="status"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      defaultValue={project.status}
                    >
                      <option value="planning">Planowanie</option>
                      <option value="in_progress">W Realizacji</option>
                      <option value="review">Odbiór</option>
                      <option value="completed">Zakończony</option>
                    </select>
                  </div>


                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"

                      defaultValue={project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">

                  <div className="grid gap-2">
                    <Label htmlFor="budget">Budżet</Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      step="0.01"
                      defaultValue={project.budget}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="currency">Waluta</Label>
                    <select
                      id="currency"
                      name="currency"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      defaultValue={project.currency || 'PLN'}
                    >
                      <option value="PLN">PLN</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>



                <div className="grid gap-2">
                  <Label htmlFor="description">Opis Projektu</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={5}
                    defaultValue={project.description}
                  />
                </div>

                <div className="flex justify-end gap-8">
                  <SubmitButton loadingText="Zapisywanie...">Zapisz wszystkie zmiany</SubmitButton>
                </div>
              </form>

            </CardContent>
          </Card>
          <Card className="border-red-200 mt-6">
            <CardHeader>
              <CardTitle className="text-red-600">Strefa Niebezpieczna</CardTitle>
              <CardDescription>
                Usunięcie projektu jest nieodwracalne. Wszystkie zadania i pliki zostaną skasowane.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={deleteProject}
              >
                <input type="hidden" name="projectId" value={project.id} />

                <SubmitButton
                  variant="destructive"
                  loadingText="Usuwanie..."
                >
                  Usuń ten projekt trwale
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  )
}