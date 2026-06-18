'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [members, setMembers] = useState<any[]>([])
  const [allModules, setAllModules] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'members' | 'applications' | 'invite'>('members')
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [memberModules, setMemberModules] = useState<any[]>([])
  const [modalLoading, setModalLoading] = useState(false)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteCohort, setInviteCohort] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { checkAdminAndLoad() }, [])

  async function checkAdminAndLoad() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/portal'); return }
    loadData()
  }

  async function loadData() {
    const [{ data: membersData }, { data: modulesData }, { data: applicationsData }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('modules').select('*').order('order_index'),
      supabase.from('applications').select('*').order('created_at', { ascending: false })
    ])
    setMembers(membersData || [])
    setAllModules(modulesData || [])
    setApplications(applicationsData || [])
    setLoading(false)
  }

  async function openMemberModal(member: any) {
    setSelectedMember(member)
    setModalLoading(true)
    const { data } = await supabase.from('user_modules').select('*').eq('user_id', member.id)
    setMemberModules(data || [])
    setModalLoading(false)
  }

  function closeMemberModal() {
    setSelectedMember(null)
    setMemberModules([])
  }

  async function handleInvite() {
    setInviteStatus('Sending...')
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ email: inviteEmail, fullName: inviteName, cohort: inviteCohort })
    })
    const data = await res.json()
    if (data.error) {
      setInviteStatus(`Error: ${data.error}`)
    } else {
      setInviteStatus('Invite sent!')
      setInviteEmail(''); setInviteName(''); setInviteCohort('')
    }
  }

  if (loading) return <div style={{ background: '#080E2A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading...</div>

  const s = styles
  const pillars = ['Sales Mastery', 'Communication', 'Career Readiness']

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <div style={s.logo}>Her Future <span style={{ color: '#FF1866' }}>Sale</span></div>
        <p style={s.adminBadge}>Admin Dashboard</p>
        {(['members', 'applications', 'invite'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...s.navBtn, ...(activeTab === tab ? s.navBtnActive : {}) }}>
            {tab === 'members' && 'Members'}
            {tab === 'applications' && `Applications ${applications.length > 0 ? `(${applications.length})` : ''}`}
            {tab === 'invite' && 'Invite'}
          </button>
        ))}
      <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF1866')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          style={{ marginTop: 'auto', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', borderRadius: '100px', padding: '0.6rem', cursor: 'pointer', fontSize: '0.75rem', transition: 'border-color 0.2s', width: '100%' }}
        >
          Sign Out
        </button>
      </div>

      <div style={s.main}>

        {/* MEMBERS */}
        {activeTab === 'members' && (
          <div>
            <h2 style={s.heading}>All Members</h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Click a member's name to view their progress.</p>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Cohort', 'Role', 'Joined'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} style={s.tr}>
                    <td style={s.td}>
                      <button
                        onClick={() => openMemberModal(m)}
                        style={{ background: 'none', border: 'none', color: '#FF1866', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', padding: 0, textDecoration: 'underline' }}
                      >
                        {m.full_name || '—'}
                      </button>
                    </td>
                    <td style={s.td}>{m.email}</td>
                    <td style={s.td}>{m.cohort || '—'}</td>
                    <td style={s.td}><span style={{ ...s.badge, ...(m.role === 'admin' ? s.badgeAdmin : s.badgeMember) }}>{m.role}</span></td>
                    <td style={s.td}>{new Date(m.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* APPLICATIONS */}
        {activeTab === 'applications' && (
          <div>
            <h2 style={s.heading}>Applications</h2>
            {applications.length === 0 ? (
              <p style={s.empty}>No applications yet — they'll show up here once the form is live.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'University', 'Grad Year', 'Interest', 'Applied'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map(a => (
                    <tr key={a.id} style={s.tr}>
                      <td style={s.td}>{a.first_name} {a.last_name}</td>
                      <td style={s.td}>{a.email}</td>
                      <td style={s.td}>{a.university || '—'}</td>
                      <td style={s.td}>{a.graduation_year || '—'}</td>
                      <td style={s.td}>{a.interest_area || '—'}</td>
                      <td style={s.td}>{new Date(a.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* INVITE */}
        {activeTab === 'invite' && (
          <div>
            <h2 style={s.heading}>Invite a Member</h2>
            <div style={s.form}>
              {[
                { label: 'Full Name', value: inviteName, set: setInviteName, placeholder: 'Their full name' },
                { label: 'Email', value: inviteEmail, set: setInviteEmail, placeholder: 'their@email.com' },
                { label: 'Cohort', value: inviteCohort, set: setInviteCohort, placeholder: 'e.g. Fall 2026' },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: '1rem' }}>
                  <label style={s.label}>{f.label}</label>
                  <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={s.input} />
                </div>
              ))}
              <button onClick={handleInvite} style={s.btn}>Send Invite →</button>
              {inviteStatus && <p style={{ color: inviteStatus.includes('Error') ? '#FF1866' : '#4ade80', marginTop: '1rem' }}>{inviteStatus}</p>}
            </div>
          </div>
        )}
      </div>

      {/* MEMBER MODAL */}
      {selectedMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,14,42,0.85)', backdropFilter: 'blur(6px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={closeMemberModal}>
          <div style={{ background: '#0F1E4A', border: '1px solid rgba(255,24,102,0.3)', borderRadius: '1.5rem', width: '100%', maxWidth: '680px', maxHeight: '80vh', overflowY: 'auto', padding: '2.5rem', position: 'relative' }} onClick={e => e.stopPropagation()}>

            <button onClick={closeMemberModal} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>

            <p style={{ color: '#FFAFC5', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Member Progress</p>
            <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>{selectedMember.full_name}</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '2rem' }}>{selectedMember.email} · {selectedMember.cohort || 'No cohort'}</p>

            {modalLoading ? (
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</p>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'rgba(255,24,102,0.1)', border: '1px solid rgba(255,24,102,0.2)', borderRadius: '0.75rem', padding: '1rem', flex: 1, textAlign: 'center' }}>
                    <div style={{ color: '#FF1866', fontWeight: 800, fontSize: '1.75rem' }}>{memberModules.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Completed</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1rem', flex: 1, textAlign: 'center' }}>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '1.75rem' }}>{allModules.length - memberModules.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Remaining</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1rem', flex: 1, textAlign: 'center' }}>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '1.75rem' }}>{allModules.length > 0 ? Math.round((memberModules.length / allModules.length) * 100) : 0}%</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progress</div>
                  </div>
                </div>

                {pillars.map(pillar => {
                  const pillarModules = allModules.filter(m => m.pillar === pillar)
                  return (
                    <div key={pillar} style={{ marginBottom: '1.5rem' }}>
                      <p style={{ color: '#FF1866', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{pillar}</p>
                      {pillarModules.map(module => {
                        const isDone = !!memberModules.find(c => c.module_id === module.id)
                        return (
                          <div key={module.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.85rem 1rem', borderRadius: '0.6rem', marginBottom: '0.4rem',
                            background: isDone ? 'rgba(255,24,102,0.07)' : 'rgba(255,255,255,0.03)',
                            border: isDone ? '1px solid rgba(255,24,102,0.2)' : '1px solid rgba(255,255,255,0.05)'
                          }}>
                            <span style={{ color: isDone ? 'white' : 'rgba(255,255,255,0.35)', fontSize: '0.875rem' }}>{module.title}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {isDone && memberModules.find(c => c.module_id === module.id)?.file_url && (
                                        <button
                                            onClick={async () => {
                                                const filePath = memberModules.find(c => c.module_id === module.id)?.file_url
                                                const { data } = await supabase.storage.from('module-uploads').createSignedUrl(filePath, 3600)
                                                if (data?.signedUrl) window.open(data.signedUrl, '_blank')
                                            }}
                                            style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '100px', padding: '0.3rem 0.85rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                                        >
                                            View File
                                        </button>
                                    )}
                                    {isDone
                                        ? <span style={{ color: '#FF1866', fontSize: '0.75rem', fontWeight: 600 }}>✓ Done</span>
                                        : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>Not started</span>
                                    }
                                </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: '100vh', background: '#080E2A', fontFamily: 'sans-serif' },
  sidebar: { width: '240px', minWidth: '240px', background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,24,102,0.2)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  logo: { fontWeight: 800, fontSize: '1rem', color: 'white', marginBottom: '0.25rem' },
  adminBadge: { fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem' },
  navBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', width: '100%' },
  navBtnActive: { background: 'rgba(255,24,102,0.15)', color: 'white' },
  main: { flex: 1, padding: '2.5rem 3rem', overflowY: 'auto' },
  heading: { color: 'white', fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.5rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  td: { color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', padding: '1rem' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600 },
  badgeAdmin: { background: 'rgba(255,24,102,0.2)', color: '#FF1866' },
  badgeMember: { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' },
  form: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,24,102,0.2)', borderRadius: '1rem', padding: '2rem', maxWidth: '480px' },
  label: { display: 'block', color: '#FF1866', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' },
  input: { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,24,102,0.3)', color: 'white', fontSize: '1rem', padding: '0.5rem 0', outline: 'none' },
  btn: { background: '#FF1866', color: 'white', border: 'none', borderRadius: '100px', padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.1em' },
  empty: { color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' },
}