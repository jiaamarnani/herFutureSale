'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/set-password')
      }
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#080E2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'white' }}>Setting up your account...</p>
    </div>
  )
}