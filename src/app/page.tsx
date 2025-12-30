import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()


    if (profile?.role === 'client_user') {
      redirect('/portal') 
    } else {
      redirect('/dashboard') 
    }
  }


  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Freelance Hub
        </h1>
        <p className="mt-2 text-slate-600">
          System operacyjny dla Twojej firmy.
        </p>
      </div>
      <div className="flex gap-4">
        <Button size="lg">Logowanie</Button>
        <Button variant="outline" size="lg">Dokumentacja</Button>
      </div>
    </div>
  )
}