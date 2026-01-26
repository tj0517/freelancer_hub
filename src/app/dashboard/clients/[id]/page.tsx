import { getClientByIdService } from "@/services/clients"
import { deleteClient } from "@/app/dashboard/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Mail, Phone, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SubmitButton } from "@/components/submit-button"


export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params

  const client = await getClientByIdService(id)

  if (!client) return <div>Nie znaleziono klienta.</div>


  const totalSpent = client.projects.reduce((sum: number, project: any) => {
    return sum + (project.budget || 0)
  }, 0)

  return (
    <div className="flex flex-col gap-6 p-6">
      

      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{client.company_name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <span className={client.status === 'active' ? "text-green-600" : "text-gray-500"}>
               ● {client.status === 'active' ? 'Aktywny' : 'Nieaktywny'}
            </span>
          </p>
        </div>
      </div>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        

        <Card>
          <CardHeader>
            <CardTitle>Dane Kontaktowe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Osoba kontaktowa</p>
                <p className="text-sm text-muted-foreground">{client.first_name} {client.last_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <a href={`mailto:${client.email}`} className="text-sm text-blue-600 hover:underline">
                  {client.email}
                </a>
              </div>
            </div>

            {client.phone && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Telefon</p>
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>


        <Card className="bg-slate-900 text-white border-none">
          <CardHeader>
            <CardTitle className="text-slate-200">Wartość Klienta (LTV)</CardTitle>
            <CardDescription className="text-slate-400">
              Suma budżetów wszystkich projektów
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(totalSpent)}
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Liczba projektów: {client.projects.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500 text-white border-2">
          <CardHeader>
            <CardTitle className="text-red-500">Usuń Klienta</CardTitle>
            <CardDescription className="text-slate-400">
              Usuń klienta z bazy danych
            </CardDescription>
          </CardHeader>
          <CardContent>
         <form
                action={deleteClient}
              >
                <input type="hidden" name="clientId" value={client.id} />

                <SubmitButton
                  variant="destructive"
                  loadingText="Usuwanie..."
                >
                  Usuń tego klienta trwale
                </SubmitButton>
              </form>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-4">Historia Projektów</h2>
      <Card>
        <CardContent className="p-0">
          {client.projects.length > 0 ? (
            <div className="divide-y">
              {client.projects.map((project: any) => (
                <div key={project.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <Link href={`/dashboard/projects/${project.id}`} className="font-medium hover:underline flex items-center gap-2">
                      {project.name}
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {project.description || "Brak opisu"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                        <p className="text-sm font-medium">
                            {project.budget ? `${project.budget} PLN` : '-'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(project.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                        {project.status === 'completed' ? 'Zakończony' : 
                         project.status === 'in_progress' ? 'W trakcie' : 'Planowanie'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Ten klient nie ma jeszcze przypisanych projektów.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}