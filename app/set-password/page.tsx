'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSetPassword() {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/portal')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080E2A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif', padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,24,102,0.4)',
        borderRadius: '1.5rem', padding: '3rem',
        width: '100%', maxWidth: '420px'
      }}>
        <p style={{ color: '#FFAFC5', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Her Future Sale</p>
        <h1 style={{ color: '#FF1866', fontWeight: 800, fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome!</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2rem' }}>Set your password to access your portal.</p>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', color: '#FF1866', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>New Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Create a password"
            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,24,102,0.3)', color: 'white', fontSize: '1rem', padding: '0.5rem 0', outline: 'none' }}
          />
        </div>

        {error && <p style={{ color: '#FF1866', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

        <button
          onClick={handleSetPassword}
          disabled={loading}
          style={{
            width: '100%', background: '#FF1866', color: 'white',
            border: 'none', borderRadius: '100px', padding: '1rem',
            fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em',
            textTransform: 'uppercase', cursor: 'pointer'
          }}
        >
          {loading ? 'Setting up...' : 'Enter My Portal →'}
        </button>
      </div>
    </div>
  )
}