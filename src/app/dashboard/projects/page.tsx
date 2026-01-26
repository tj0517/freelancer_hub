import { getAllProjects } from "@/services/projects"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export default async function ProjectsListPage() {
  const projects = await getAllProjects()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projekty</h1>
          <p className="text-muted-foreground">Przegląd wszystkich zleceń w systemie.</p>
        </div>
      
      </div>

      <Card>
          <CardHeader className="px-7">
          <CardTitle>Lista Projektów</CardTitle>
          <CardDescription>Zarządzaj projektami</CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead >Nazwa Projektu</TableHead>
                <TableHead>Klient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Akcja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects?.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>{project.clients?.company_name}</TableCell>
                  <TableCell>
                    <Badge variant={project.status === 'completed' ? 'secondary' : 'default'}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(project.deadline).toLocaleDateString('pl-PL')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>
                        Szczegóły <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}