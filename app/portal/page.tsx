'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function PortalPage() {
  const [profile, setProfile] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [completed, setCompleted] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'modules' | 'confidence'>('dashboard')
  const [confidenceLog, setConfidenceLog] = useState<any[]>([])
  const [confidenceScore, setConfidenceScore] = useState(3)
  const [confidenceSubmitting, setConfidenceSubmitting] = useState(false)
  const [confidenceSuccess, setConfidenceSuccess] = useState(false)
  const [uploadingModuleId, setUploadingModuleId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingUploadModuleId, setPendingUploadModuleId] = useState<number | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const [{ data: profileData }, { data: modulesData }, { data: completedData }, { data: confidenceData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('modules').select('*').order('order_index'),
      supabase.from('user_modules').select('*').eq('user_id', user.id),
      supabase.from('confidence_log').select('*').eq('user_id', user.id).order('logged_at', { ascending: true })
    ])

    if (profileData?.role === 'admin') { router.push('/admin'); return }
    setProfile(profileData)
    setModules(modulesData || [])
    setCompleted(completedData || [])
    setConfidenceLog(confidenceData || [])
    setLoading(false)
  }

  async function handleComplete(moduleId: number) {
    const { data: { user } } = await supabase.auth.getUser()
    const alreadyDone = completed.find(c => c.module_id === moduleId)
    if (alreadyDone) return
    const { data } = await supabase.from('user_modules').insert({
      user_id: user?.id,
      module_id: moduleId
    }).select().single()
    if (data) setCompleted(prev => [...prev, data])
  }

  async function handleFileUpload(moduleId: number, file: File) {
    setUploadingModuleId(moduleId)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${moduleId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('module-uploads')
      .upload(filePath, file)

    if (uploadError) {
      console.log('Upload error:', uploadError)
      setUploadingModuleId(null)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('module-uploads')
      .getPublicUrl(filePath)

    // Check if already completed
    const existing = completed.find(c => c.module_id === moduleId)

    if (existing) {
      // Update existing record
      const { data } = await supabase.from('user_modules')
        .update({ file_url: filePath })
        .eq('id', existing.id)
        .select().single()
      if (data) setCompleted(prev => prev.map(c => c.id === existing.id ? data : c))
    } else {
      // Insert new completion with file
      const { data } = await supabase.from('user_modules').insert({
        user_id: user.id,
        module_id: moduleId,
        file_url: filePath
      }).select().single()
      if (data) setCompleted(prev => [...prev, data])
    }

    setUploadingModuleId(null)
  }

  async function getFileUrl(filePath: string) {
    const { data } = await supabase.storage
      .from('module-uploads')
      .createSignedUrl(filePath, 3600)
    return data?.signedUrl
  }

  async function handleViewFile(filePath: string) {
    const url = await getFileUrl(filePath)
    if (url) window.open(url, '_blank')
  }

  async function handleLogConfidence() {
    setConfidenceSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('confidence_log').insert({
      user_id: user?.id, score: confidenceScore
    }).select().single()
    if (data) {
      setConfidenceLog(prev => [...prev, data])
      setConfidenceSuccess(true)
      setTimeout(() => setConfidenceSuccess(false), 3000)
    }
    setConfidenceSubmitting(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ background: '#080E2A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      Loading...
    </div>
  )

  const totalModules = modules.length
  const completedCount = completed.length
  const progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0
  const pillars = ['Sales Mastery', 'Communication', 'Career Readiness']
  const confidenceLabels = [
    'Feeling lost, unsure, stressed.',
    'A lil stressed, second-guessing, hesitant.',
    'Getting there, finding my footing, figuring it out.',
    'Locked in, clear, building momentum.',
    "Unstoppable, ready, I've got this."
  ]
  const s = styles

  return (
    <div style={s.page}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={async e => {
          const file = e.target.files?.[0]
          if (file && pendingUploadModuleId) {
            await handleFileUpload(pendingUploadModuleId, file)
            setPendingUploadModuleId(null)
          }
          e.target.value = ''
        }}
      />

      <div style={s.sidebar}>
        <div style={s.logo}>Her Future <span style={{ color: '#FF1866' }}>Sale</span></div>
        <p style={s.welcomeName}>Hey, {profile?.full_name?.split(' ')[0]} 👋</p>
        <p style={s.cohort}>{profile?.cohort || 'Member'}</p>

        <div style={s.progressBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={s.progressLabel}>Overall Progress</span>
            <span style={s.progressPct}>{progress}%</span>
          </div>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressFill, width: `${progress}%` }} />
          </div>
          <p style={s.progressSub}>{completedCount} of {totalModules} modules</p>
        </div>

        {(['dashboard', 'modules', 'confidence'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...s.navBtn, ...(activeTab === tab ? s.navBtnActive : {}) }}>
            {tab === 'dashboard' && '◈ Dashboard'}
            {tab === 'modules' && '◎ Modules'}
            {tab === 'confidence' && '◉ Confidence'}
          </button>
        ))}

        <button
          onClick={handleLogout}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF1866')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          onMouseDown={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(255,24,102,0.5)')}
          onMouseUp={e => (e.currentTarget.style.boxShadow = 'none')}
          style={{ marginTop: 'auto', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', borderRadius: '100px', padding: '0.6rem', cursor: 'pointer', fontSize: '0.75rem', transition: 'border-color 0.2s, box-shadow 0.2s' }}
        >
          Sign Out
        </button>
      </div>

      <div style={s.main}>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={s.heading}>Your Dashboard</h2>
            <div style={s.statsRow}>
              <div style={s.statCard}>
                <div style={s.statNum}>{progress}%</div>
                <div style={s.statLabel}>Overall Progress</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statNum}>{completedCount}</div>
                <div style={s.statLabel}>Modules Completed</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statNum}>{totalModules - completedCount}</div>
                <div style={s.statLabel}>Modules Remaining</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statNum}>{confidenceLog.length > 0 ? `${confidenceLog[confidenceLog.length - 1]?.score}/5` : '—'}</div>
                <div style={s.statLabel}>Latest Confidence</div>
              </div>
            </div>

            <h3 style={{ ...s.heading, fontSize: '1.1rem', marginTop: '2rem' }}>Progress by Pillar</h3>
            {pillars.map(pillar => {
              const pillarModules = modules.filter(m => m.pillar === pillar)
              const pillarDone = completed.filter(c => pillarModules.find(m => m.id === c.module_id)).length
              const pillarPct = pillarModules.length > 0 ? Math.round((pillarDone / pillarModules.length) * 100) : 0
              return (
                <div key={pillar} style={s.pillarRow}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={s.pillarName}>{pillar}</span>
                    <span style={s.pillarPct}>{pillarDone}/{pillarModules.length}</span>
                  </div>
                  <div style={s.progressTrack}>
                    <div style={{ ...s.progressFill, width: `${pillarPct}%` }} />
                  </div>
                </div>
              )
            })}

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ ...s.heading, fontSize: '1.1rem' }}>Confidence Over Time</h3>
              {confidenceLog.length > 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '120px' }}>
                    {confidenceLog.map((entry, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '100%', background: `rgba(255,24,102,${0.3 + (entry.score / 5) * 0.7})`, borderRadius: '4px 4px 0 0', height: `${(entry.score / 5) * 100}px`, transition: 'height 0.5s ease', minWidth: '8px' }} />
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>
                          {new Date(entry.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>First entry</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Latest: <span style={{ color: '#FF1866', fontWeight: 700 }}>{confidenceLog[confidenceLog.length - 1]?.score}/5</span></span>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.9rem' }}>No entries yet — log your first confidence score in the Confidence tab!</p>
              )}
            </div>
          </div>
        )}

        {/* MODULES */}
        {activeTab === 'modules' && (
          <div>
            <h2 style={s.heading}>Curriculum</h2>
            {pillars.map(pillar => (
              <div key={pillar} style={{ marginBottom: '2.5rem' }}>
                <h3 style={s.pillarHeading}>{pillar}</h3>
                {modules.filter(m => m.pillar === pillar).map(module => {
                  const completion = completed.find(c => c.module_id === module.id)
                  const isDone = !!completion
                  const hasFile = !!completion?.file_url
                  const isUploading = uploadingModuleId === module.id

                  return (
                    <div key={module.id} style={{ ...s.moduleCard, ...(isDone ? s.moduleCardDone : {}) }}>
                      <div style={{ flex: 1 }}>
                        <p style={s.moduleTitle}>{module.title}</p>
                        <p style={s.moduleDesc}>{module.description}</p>
                        {hasFile && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', color: '#4ade80', fontSize: '0.75rem', fontWeight: 600 }}>
                            📎 File uploaded
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                        {hasFile && (
                          <button
                            onClick={() => handleViewFile(completion.file_url)}
                            style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '100px', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            View File
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setPendingUploadModuleId(module.id)
                            fileInputRef.current?.click()
                          }}
                          disabled={isUploading}
                          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '100px', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          {isUploading ? 'Uploading...' : hasFile ? '↑ Replace' : '↑ Upload File'}
                        </button>
                        <button
                          onClick={() => handleComplete(module.id)}
                          disabled={isDone}
                          style={{ ...s.completeBtn, ...(isDone ? s.completeBtnDone : {}) }}
                        >
                          {isDone ? 'Done ✓' : 'Mark Complete'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {/* CONFIDENCE */}
        {activeTab === 'confidence' && (
          <div>
            <h2 style={s.heading}>Confidence Tracker</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Log how confident you feel today. Track your growth over the semester.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,24,102,0.2)', borderRadius: '1rem', padding: '2rem', marginBottom: '2.5rem' }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>How confident do you feel today?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                {confidenceLabels.map((label, i) => (
                  <div key={i} onClick={() => setConfidenceScore(i + 1)} style={{
                    padding: '0.85rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.875rem',
                    border: confidenceScore === i + 1 ? '1px solid rgba(255,24,102,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    background: confidenceScore === i + 1 ? 'rgba(255,24,102,0.15)' : 'rgba(255,255,255,0.03)',
                    color: confidenceScore === i + 1 ? 'white' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1rem'
                  }}>
                    <span style={{ width: '24px', height: '24px', minWidth: '24px', borderRadius: '50%', background: confidenceScore === i + 1 ? '#FF1866' : 'rgba(255,255,255,0.06)', border: confidenceScore === i + 1 ? 'none' : '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: confidenceScore === i + 1 ? 'white' : 'rgba(255,255,255,0.3)' }}>{i + 1}</span>
                    {label}
                  </div>
                ))}
              </div>
              <button
                onClick={handleLogConfidence}
                disabled={confidenceSubmitting}
                style={{ background: confidenceSuccess ? '#4ade80' : '#FF1866', color: 'white', border: 'none', borderRadius: '100px', padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.1em', transition: 'background 0.3s' }}
              >
                {confidenceSuccess ? '✓ Logged!' : confidenceSubmitting ? 'Saving...' : 'Log My Confidence →'}
              </button>
            </div>

            {confidenceLog.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '2rem' }}>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem' }}>Your Confidence Over Time</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '120px' }}>
                  {confidenceLog.map((entry, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: '100%', background: `rgba(255,24,102,${0.3 + (entry.score / 5) * 0.7})`, borderRadius: '4px 4px 0 0', height: `${(entry.score / 5) * 100}px`, transition: 'height 0.5s ease', minWidth: '8px' }} />
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>
                        {new Date(entry.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>First entry</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Latest: <span style={{ color: '#FF1866', fontWeight: 700 }}>{confidenceLog[confidenceLog.length - 1]?.score}/5</span></span>
                </div>
              </div>
            )}

            {confidenceLog.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.9rem' }}>No entries yet — log your first confidence score above!</p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: '100vh', background: '#080E2A', fontFamily: 'sans-serif' },
  sidebar: { width: '260px', minWidth: '260px', background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,24,102,0.15)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  logo: { fontWeight: 800, fontSize: '1rem', color: 'white', marginBottom: '0.5rem' },
  welcomeName: { color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '0.1rem' },
  cohort: { color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginBottom: '1.25rem' },
  progressBox: { background: 'rgba(255,24,102,0.08)', border: '1px solid rgba(255,24,102,0.2)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem' },
  progressLabel: { color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' },
  progressPct: { color: '#FF1866', fontWeight: 700, fontSize: '0.85rem' },
  progressTrack: { height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #FF1866, #FF6BA0)', borderRadius: '100px', transition: 'width 0.5s ease' },
  progressSub: { color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', marginTop: '0.4rem' },
  navBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', width: '100%' },
  navBtnActive: { background: 'rgba(255,24,102,0.15)', color: 'white' },
  main: { flex: 1, padding: '2.5rem 3rem', overflowY: 'auto' },
  heading: { color: 'white', fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.5rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' },
  statCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center' },
  statNum: { color: '#FF1866', fontWeight: 800, fontSize: '2rem', lineHeight: 1 },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.5rem' },
  pillarRow: { marginBottom: '1rem' },
  pillarName: { color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' },
  pillarPct: { color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' },
  pillarHeading: { color: '#FF1866', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' },
  moduleCard: { display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '0.75rem', transition: 'border-color 0.2s' },
  moduleCardDone: { borderColor: 'rgba(255,24,102,0.3)', background: 'rgba(255,24,102,0.05)' },
  moduleTitle: { color: 'white', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' },
  moduleDesc: { color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' },
  completeBtn: { background: '#FF1866', color: 'white', border: 'none', borderRadius: '100px', padding: '0.6rem 1.25rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  completeBtnDone: { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', cursor: 'default' },
  empty: { color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' },
}