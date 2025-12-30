import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge" 
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog"
import { Activity, CreditCard, DollarSign, Users, Briefcase, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import { NewClientDialog } from "@/components/dashboard/createClient"

export default async function DashboardPage() {
  const supabase = await createClient()


  const [
    recentProjectsRes, 
    revenueRes, 
    clientsCountRes, 
    activeProjectsCountRes,
    recentClientsRes,
    allClientsListRes
  ] = await Promise.all([
    // 1. Ostatnie 5 projektów do tabeli głównej
    supabase.from('projects').select('*, clients(company_name)').order('created_at', { ascending: false }).limit(5),
    
    // 2. Budżet
    supabase.from('projects').select('budget'),
    
    // 3. Liczba wszystkich klientów
    supabase.from('clients').select('*', { count: 'exact', head: true }),

    // 4. Liczba AKTYWNYCH projektów (w trakcie + planowanie)
    supabase.from('projects').select('*', { count: 'exact', head: true }).neq('status', 'completed'),

    // 5. Ostatni 5 klientów do bocznej tabeli
    supabase.from('clients').select('*').order('created_at', { ascending: false }).limit(5),

    // 6. Lista klientów do formularza "Nowy Projekt"
    supabase.from('clients').select('id, company_name').eq('status', 'active')
  ])

  const projects = recentProjectsRes.data || []
  const clientsList = recentClientsRes.data || []
  const formClientsList = allClientsListRes.data || []
  
  const clientsCount = clientsCountRes.count || 0
  const activeProjectsCount = activeProjectsCountRes.count || 0

  const totalRevenue = revenueRes.data?.reduce((sum, current) => {
    return sum + (current.budget || 0)
  }, 0) || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount)
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8 p-4">
      
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Całkowity Przychód</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Zrealizowane zlecenia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baza Klientów</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsCount}</div>
            <p className="text-xs text-muted-foreground">Firm w systemie</p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">W Realizacji</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjectsCount}</div>
            <p className="text-xs text-muted-foreground">Projekty wymagające uwagi</p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Najbliższy Deadline</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            
            <div className="text-xl font-bold truncate">
               {projects[0]?.deadline ? new Date(projects[0].deadline).toLocaleDateString() : '--'}
            </div>
            <p className="text-xs text-muted-foreground truncate">
                {projects[0]?.name || "Brak zadań"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
        
        <Card className="lg:col-span-2 xl:col-span-2 h-fit">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-2">
              <CardTitle>Ostatnie Projekty</CardTitle>
              <CardDescription>
                Ostatnie zlecenia w Twojej agencji.
              </CardDescription>
            </div>
            <div className="flex gap-2">
                <Link href="/dashboard/projects">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        Wszystkie <ArrowUpRight className="ml-2 h-4 w-4"/>
                    </Button>
                </Link>
                <NewProjectDialog clients={formClientsList} />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projekt</TableHead>
                  <TableHead className="hidden md:table-cell">Klient</TableHead>
                  <TableHead className="hidden sm:table-cell">Budżet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Termin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="font-medium">
                         <Link href={`/dashboard/projects/${project.id}`} className="hover:underline hover:text-blue-600">
                            {project.name}
                         </Link>
                      </div>
                      <div className="text-xs text-muted-foreground md:hidden">
                         {project.clients?.company_name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {project.clients?.company_name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        {project.budget ? formatCurrency(project.budget) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        project.status === 'completed' ? 'secondary' : 
                        project.status === 'in_progress' ? 'default' : 'outline'
                      }>
                        {project.status === 'completed' ? 'Zakończony' : 
                         project.status === 'in_progress' ? 'W trakcie' : 'Planowanie'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString('pl-PL') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                
                {projects.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                       Brak projektów. Kliknij "Nowy Projekt"!
                     </TableCell>
                   </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

       <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Nowi Klienci</CardTitle>
            <CardDescription>
              Ostatnio dodane firmy.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-full"> 

            <div className="grid gap-6">
                {clientsList.map((client) => (
                    <div key={client.id} className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                                <Briefcase className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-none">
                                    <Link href={`/dashboard/clients/${client.id}`} className="hover:underline">
                                        {client.company_name}
                                    </Link>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {client.email}
                                </p>
                            </div>
                        </div>
                        <div className={`text-xs font-medium ${client.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                            {client.status === 'active' ? 'Aktywny' : 'Lead'}
                        </div>
                    </div>
                ))}
                
                {clientsList.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Brak klientów w bazie.</p>
                )}
            </div>
            
            <div className="mt-8 space-y-3">

                <NewClientDialog />

                <Link href="/dashboard/clients" className="block">
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                        Zobacz wszystkich klientów
                    </Button>
                </Link>
                
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}