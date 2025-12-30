import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Building2, User } from "lucide-react"

export default async function ClientsPage() {
  const supabase = await createClient()


  const { data: clients } = await supabase
    .from('clients')
    .select('*, projects(count)') 
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Klienci</h1>
          <p className="text-muted-foreground">Baza Twoich kontrahentów.</p>
        </div>

      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients?.map((client: any) => (
          <Card key={client.id} className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {client.company_name}
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="mr-2 h-4 w-4" />
                  {client.first_name} {client.last_name}
                </div>
                <div className="text-sm font-medium">
                  Aktywne projekty: {client.projects[0].count}
                </div>
              </div>
              
              <div className="mt-4">
                <Link href={`/dashboard/clients/${client.id}`}>
                  <Button variant="outline" className="w-full group">
                    Zobacz Profil
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}