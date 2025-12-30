import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package } from "lucide-react"
import Link from "next/link"
import { signOut } from "@/app/login/actions"

export default async function PortalDashboard() {
  const supabase = await createClient()


  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')


  const { data: profile } = await supabase
    .from('profiles')
    .select('client_id, role')
    .eq('id', user.id)
    .single()


  if (!profile?.client_id) {
    redirect('/dashboard')
  }

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      tasks (count)
    `)
    .eq('client_id', profile.client_id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">

      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Package className="h-6 w-6 text-blue-600" />
          <span>Panel Klienta</span>
        </div>
        <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
          <span></span>
          <form action={signOut}>
                <button type="submit" className="w-full text-left cursor-pointer">
                Wyloguj się
                </button>
              </form>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-8 p-8 max-w-5xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Twoje Projekty</h1>
          <p className="text-muted-foreground mt-2">
            Śledź postępy prac i akceptuj etapy w czasie rzeczywistym.
          </p>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden border-l-4 border-l-blue-600 shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between bg-white pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription>Termin: {new Date(project.deadline).toLocaleDateString()}</CardDescription>
                  </div>
                  <Badge variant={project.status === 'completed' ? 'secondary' : 'default'} className="text-sm px-3 py-1">
                    {project.status === 'in_progress' ? 'W Realizacji' : project.status}
                  </Badge>
                </CardHeader>
                <CardContent className="bg-white pt-0 pb-6">
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      <strong>{project.tasks?.[0]?.count || 0}</strong> aktywnych zadań
                    </div>
                    <Button asChild>
                     
                      <Link href={`/portal/projects/${project.id}`}>
                        Zobacz postępy <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium">Brak aktywnych projektów</h3>
            <p className="text-muted-foreground">Skontaktuj się z administratorem.</p>
          </div>
        )}
      </main>
    </div>
  )
}