import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error) {
            // Redirect to the requested page or dashboard
            return NextResponse.redirect(`${origin}${redirectTo}`)
        }
    }

    // If there's an error or no code, redirect to login
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
