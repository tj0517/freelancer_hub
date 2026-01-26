 import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Tworzymy pustą odpowiedź, do której potem dokleimy ciasteczka
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // UWAGA: Sprawdź czy na pewno masz taką nazwę zmiennej w .env. 
    // Standardowo jest to NEXT_PUBLIC_SUPABASE_ANON_KEY
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // To wywołanie odświeża token (Refresh Token), jeśli jest stary!
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // --- OCHRONA TRAS (POPRAWIONA) ---

  // 1. Zignoruj pliki statyczne i API auth (bardzo ważne!)
  // Jeśli tego nie zrobisz, middleware będzie próbował przekierować 
  // zapytania o pliki CSS, JS czy obrazki na stronę /login
  if (
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') || // <-- Ważne dla potwierdzania maila!
    url.pathname.includes('.') // np. favicon.ico, logo.png
  ) {
    return response
  }

  // 2. Jeśli użytkownik NIE jest zalogowany i próbuje wejść na chronioną trasę
  if (!user && !url.pathname.startsWith('/login')) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 3. Jeśli użytkownik JEST zalogowany i wchodzi na login -> wywal go do dashboardu
  if (user && url.pathname.startsWith('/login')) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}