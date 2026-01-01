"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type TimeLog = {
    id: string
    hours: number
    stage: string
    created_at: string
    description?: string
}

const stageLabels: Record<string, string> = {
    planning: "Planowanie",
    design: "Design",
    development: "Programowanie",
    testing: "Testy",
}

export function ProjectHoursList({ timeLogs }: { timeLogs: TimeLog[] }) {
    // Sort by date desc
    const sortedLogs = [...(timeLogs || [])].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle>Historia Logowania Czasu</CardTitle>
            </CardHeader>
            <CardContent>
                {sortedLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Brak zarejestrowanych godzin.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Etap</TableHead>
                                <TableHead>Opis</TableHead>
                                <TableHead className="text-right">Godziny</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {stageLabels[log.stage] || log.stage}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={log.description}>
                                        {log.description || "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {log.hours.toFixed(1)} h
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
