import { createAdminClient } from '@/utils/supabase/admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, fullName, cohort } = await request.json()

  // Verify the caller is an admin using server client
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('INVITE ROUTE USER:', user?.id, 'AUTH ERROR:', authError)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

  console.log('PROFILE:', profile, 'PROFILE ERROR:', profileError)

 if (profile?.role !== 'admin') {
  console.log('NOT ADMIN - role is:', profile?.role)
  return NextResponse.json({ error: 'Admins only' }, { status: 403 })
  }

  // Use admin client to send invite
  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, cohort }
  })

  console.log('INVITE ERROR:', error)
  console.log('INVITE DATA:', data?.user?.id)

  if (error) return NextResponse.json({ error: error.message, details: error }, { status: 400 })

  // Pre-create profile
  await adminSupabase.from('profiles').insert({
    id: data.user.id,
    email,
    full_name: fullName,
    cohort,
    role: 'member'
  })

  return NextResponse.json({ success: true })
}