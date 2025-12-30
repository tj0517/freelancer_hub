import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, CheckCircle2, Circle, Clock, Download, FileText, Package } from "lucide-react"
import { downloadFile } from "@/app/dashboard/actions" 


interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PortalProjectPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()


  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')


  const { data: profile } = await supabase
    .from('profiles')
    .select('client_id')
    .eq('id', user.id)
    .single()

  if (!profile?.client_id) redirect('/dashboard')

  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      tasks (*),
      project_files (*)
    `)
    .eq('id', id)
    .eq('client_id', profile.client_id)
    .single()

  if (!project) notFound()


  const totalTasks = project.tasks?.length || 0
  const completedTasks = project.tasks?.filter((t: any) => t.is_completed).length || 0
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm">
        <Link href="/portal" className="text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Package className="h-6 w-6 text-blue-600" />
          <span>Szczegóły Projektu</span>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-muted-foreground mt-1">ID: {project.id.slice(0, 8)}...</p>
          </div>
          <Badge variant={project.status === 'completed' ? 'secondary' : 'default'} className="text-base px-4 py-1 self-start md:self-center">
             {project.status === 'completed' ? 'Zakończony' : 
              project.status === 'in_progress' ? 'W Realizacji' : 'Planowanie'}
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="overview">Status Prac</TabsTrigger>
            <TabsTrigger value="files">Pliki do pobrania</TabsTrigger>
          </TabsList>


          <TabsContent value="overview" className="space-y-6">
            
       
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Postęp realizacji</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{progress}%</div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Ukończono {completedTasks} z {totalTasks} zadań
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Terminy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">Start: {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Plan działania</CardTitle>
                <CardDescription>Lista zadań realizowanych przez agencję.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {project.tasks && project.tasks.length > 0 ? (
                    project.tasks.map((task: any) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-md transition-colors">
                        {task.is_completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                        )}
                        <span className={task.is_completed ? "text-slate-500 line-through text-sm" : "text-slate-900 text-sm"}>
                          {task.title}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm italic">Harmonogram jest w trakcie przygotowania.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Dokumenty Projektowe</CardTitle>
                <CardDescription>Tutaj znajdziesz umowy, faktury i projekty do akceptacji.</CardDescription>
              </CardHeader>
              <CardContent>
                {project.project_files && project.project_files.length > 0 ? (
                  <div className="grid gap-3">
                    {project.project_files.map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Dodał administrator • {new Date(file.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
        
                        <form action={downloadFile}>
                          <input type="hidden" name="filePath" value={file.file_path} />
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Pobierz
                          </Button>
                        </form>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
                    <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-muted-foreground">Brak udostępnionych plików.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  )
}