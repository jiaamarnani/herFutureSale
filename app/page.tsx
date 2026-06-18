'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [applyFname, setApplyFname] = useState('')
  const [applyLname, setApplyLname] = useState('')
  const [applyEmail, setApplyEmail] = useState('')
  const [applyUni, setApplyUni] = useState('')
  const [applyYear, setApplyYear] = useState('')
  const [applyInterest, setApplyInterest] = useState('')
  const [applyStatus, setApplyStatus] = useState('')
  const [applyLoading, setApplyLoading] = useState(false)

  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [activeModal])

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) }
      })
    }, { threshold: 0.12 })
    reveals.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  async function handleLogin() {
    setLoginLoading(true)
    setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (error) {
      setLoginError(error.message)
      setLoginLoading(false)
      return
    }
    router.push('/portal')
  }

  async function handleApply() {
    setApplyLoading(true)
    setApplyStatus('')
    const { error } = await supabase.from('applications').insert({
      first_name: applyFname,
      last_name: applyLname,
      email: applyEmail,
      university: applyUni,
      graduation_year: applyYear,
      interest_area: applyInterest
    })
    if (error) {
      setApplyStatus('Something went wrong. Please try again.')
      setApplyLoading(false)
      return
    }
    if (error) {
  console.log('APPLY ERROR:', error)
  setApplyStatus('Something went wrong. Please try again.')
  setApplyLoading(false)
  return
}
    setApplyStatus('success')
    setApplyLoading(false)
    setApplyFname(''); setApplyLname(''); setApplyEmail('')
    setApplyUni(''); setApplyYear(''); setApplyInterest('')
    
  }

  return (
    <>
      <style>{`
        :root {
          --hot-pink: #FF1866;
          --deep-navy: #080E2A;
          --blush-white: #FFF5F8;
          --light-pink: #FFAFC5;
          --navy-blue: #1A3A8F;
          --navy-mid: #0F1E4A;
          --white: #FFFFFF;
          --font-display: 'Bricolage Grotesque', sans-serif;
          --font-body: 'Outfit', sans-serif;
          --font-accent: 'Instrument Serif', serif;
        }
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: var(--font-body); background: var(--white); color: var(--deep-navy); overflow-x: hidden; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1.25rem 3rem; display: flex; align-items: center; justify-content: space-between; transition: background 0.35s, backdrop-filter 0.35s; }
        nav.scrolled { background: rgba(8,14,42,0.93); backdrop-filter: blur(14px); }
        .nav-logo { font-family: var(--font-display); font-weight: 800; font-size: 1.1rem; color: var(--white); letter-spacing: 0.04em; text-decoration: none; }
        .nav-logo span { color: var(--hot-pink); }
        .nav-links { display: flex; gap: 2.5rem; list-style: none; }
        .nav-links a { color: rgba(255,255,255,0.65); text-decoration: none; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.2s; cursor: pointer; }
        .nav-links a:hover { color: var(--white); }
        .nav-dropdown { position: relative; }
        .nav-dropdown > a::after { content: ' ▾'; font-size: 0.6rem; opacity: 0.6; }
        .dropdown-menu { position: absolute; top: calc(100% + 0.75rem); left: 50%; transform: translateX(-50%) translateY(-6px); background: rgba(8,14,42,0.97); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 0.5rem; list-style: none; min-width: 160px; opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s; }
        .nav-dropdown:hover .dropdown-menu { opacity: 1; visibility: visible; pointer-events: all; transform: translateX(-50%) translateY(0); }
        .dropdown-menu li a { display: block; padding: 0.6rem 1rem; border-radius: 0.5rem; color: rgba(255,255,255,0.7); font-size: 0.8rem; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; white-space: nowrap; transition: background 0.15s, color 0.15s; }
        .dropdown-menu li a:hover { background: rgba(255,24,102,0.15); color: var(--light-pink); }
        .nav-actions { display: flex; gap: 1rem; align-items: center; }
        .btn-ghost { color: var(--white); background: transparent; border: 1px solid rgba(255,255,255,0.25); padding: 0.5rem 1.25rem; border-radius: 100px; font-size: 0.8rem; font-weight: 500; cursor: pointer; font-family: var(--font-body); text-decoration: none; transition: border-color 0.2s, background 0.2s; }
        .btn-ghost:hover { border-color: var(--white); background: rgba(255,255,255,0.08); }
        .btn-primary { background: var(--hot-pink); color: var(--white); border: none; padding: 0.6rem 1.5rem; border-radius: 100px; font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: var(--font-body); text-decoration: none; position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(255,24,102,0.4); }
        .hero { min-height: 100vh; background: var(--deep-navy); display: flex; flex-direction: column; justify-content: center; padding: 8rem 3rem 6rem; position: relative; overflow: hidden; }
        .blob { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; animation: blobDrift 14s ease-in-out infinite alternate; }
        .blob-1 { width: 650px; height: 650px; background: radial-gradient(circle, #FF1866 0%, #FF6BA0 60%, transparent 100%); top: -220px; right: -80px; opacity: 0.32; animation-delay: 0s; }
        .blob-2 { width: 420px; height: 420px; background: radial-gradient(circle, #FFAFC5 0%, #FF1866 70%, transparent 100%); bottom: -80px; left: 220px; opacity: 0.18; animation-delay: -5s; }
        .blob-3 { width: 280px; height: 280px; background: radial-gradient(circle, #1A3A8F 0%, transparent 100%); top: 35%; left: 28%; opacity: 0.6; animation-delay: -9s; }
        @keyframes blobDrift { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(28px,-18px) scale(1.06); } 100% { transform: translate(-18px,28px) scale(0.94); } }
        .hero-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 64px 64px; }
        .hero-content { position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; width: 100%; }
        .hero-brand-statement { font-family: var(--font-accent); font-style: italic; font-weight: 400; font-size: clamp(1.1rem, 2vw, 1.5rem); color: rgba(255,255,255,0.7); letter-spacing: 0.01em; margin-bottom: 1.75rem; opacity: 0; transform: translateY(18px); animation: fadeUp 0.7s ease forwards 0.2s; }
        .hero-brand-statement span { color: var(--hot-pink); }
        .hero-headline { font-family: var(--font-display); font-weight: 800; font-size: clamp(2.5rem, 5.5vw, 5rem); line-height: 0.9; color: var(--white); letter-spacing: -0.025em; margin-bottom: 1.75rem; }
        .hero-headline .line { display: block; overflow: hidden; }
        .hero-headline .line-inner { display: block; opacity: 0; transform: translateY(105%); animation: lineReveal 0.85s cubic-bezier(0.16,1,0.3,1) forwards; }
        .hero-headline .line:nth-child(1) .line-inner { animation-delay: 0.35s; }
        .hero-headline .line:nth-child(2) .line-inner { animation-delay: 0.5s; }
        .hero-headline .line:nth-child(3) .line-inner { animation-delay: 0.65s; }
        @keyframes lineReveal { to { opacity:1; transform:translateY(0); } }
        .hero-headline .accent { color: var(--hot-pink); font-family: var(--font-accent); font-style: italic; font-weight: 300; }
        .hero-sub { font-size: clamp(1rem, 1.4vw, 1.2rem); color: rgba(255,255,255,0.6); max-width: 540px; line-height: 1.7; margin-bottom: 2.75rem; opacity: 0; transform: translateY(18px); animation: fadeUp 0.7s ease forwards 1s; }
        .hero-ctas { display: flex; gap: 1rem; flex-wrap: wrap; opacity: 0; transform: translateY(18px); animation: fadeUp 0.7s ease forwards 1.15s; }
        .btn-hero-primary { background: var(--hot-pink); color: var(--white); border: none; padding: 1rem 2.25rem; border-radius: 100px; font-size: 1rem; font-weight: 600; cursor: pointer; font-family: var(--font-body); text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.3s; }
        .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 44px rgba(255,24,102,0.5); }
        .btn-hero-secondary { color: var(--white); background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.18); padding: 1rem 2.25rem; border-radius: 100px; font-size: 1rem; font-weight: 500; cursor: pointer; font-family: var(--font-body); text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; transition: background 0.2s, border-color 0.2s; }
        .btn-hero-secondary:hover { background: rgba(255,255,255,0.13); border-color: rgba(255,255,255,0.35); }
        .hero-stats { position: absolute; bottom: 4.5rem; right: 3rem; display: flex; gap: 3rem; opacity: 0; animation: fadeUp 0.7s ease forwards 1.3s; }
        .hero-stat { text-align: right; }
        .hero-stat-num { font-family: var(--font-display); font-weight: 800; font-size: 2.4rem; color: var(--white); line-height: 1; }
        .hero-stat-num em { color: var(--hot-pink); font-style: normal; }
        .hero-stat-label { font-size: 0.7rem; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 0.25rem; }
        .scroll-indicator { position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: rgba(255,255,255,0.35); font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0; animation: fadeUp 0.7s ease forwards 1.6s; }
        .scroll-line { width: 1px; height: 48px; background: linear-gradient(to bottom, rgba(255,255,255,0.3), transparent); animation: scrollDrop 2s ease-in-out infinite; }
        @keyframes scrollDrop { 0% { transform:scaleY(0); transform-origin:top; opacity:1; } 49% { transform:scaleY(1); transform-origin:top; opacity:1; } 50% { transform:scaleY(1); transform-origin:bottom; opacity:1; } 100% { transform:scaleY(0); transform-origin:bottom; opacity:0; } }
        @keyframes fadeUp { to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.4); } }
        .marquee-section { background: var(--hot-pink); padding: 0.9rem 0; overflow: hidden; }
        .marquee-track { display: flex; gap: 0; width: max-content; animation: marqueeScroll 28s linear infinite; }
        .marquee-item { font-family: var(--font-display); font-weight: 700; font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--white); white-space: nowrap; padding: 0 2.5rem; }
        .marquee-item .dot { color: rgba(255,255,255,0.4); }
        @keyframes marqueeScroll { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .about-section { padding: 7rem 3rem; background: var(--white); }
        .about-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: center; }
        .section-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: var(--hot-pink); margin-bottom: 1rem; }
        .about-headline { font-family: var(--font-display); font-weight: 800; font-size: clamp(2.2rem, 4vw, 3.6rem); line-height: 1.03; letter-spacing: -0.02em; color: var(--deep-navy); }
        .about-headline .italic { font-family: var(--font-accent); font-style: italic; font-weight: 300; color: var(--hot-pink); }
        .about-text { font-size: 1rem; line-height: 1.75; color: rgba(8,14,42,0.65); margin-top: 1.5rem; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .stat-card { padding: 1.75rem; background: var(--blush-white); border-radius: 1.25rem; border: 1px solid rgba(255,24,102,0.1); transition: transform 0.25s, box-shadow 0.25s; }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 14px 44px rgba(255,24,102,0.1); }
        .stat-number { font-family: var(--font-display); font-weight: 800; font-size: 2.6rem; color: var(--hot-pink); line-height: 1; margin-bottom: 0.5rem; }
        .stat-desc { font-size: 0.85rem; color: rgba(8,14,42,0.55); line-height: 1.5; }
        .pillars-section { background: var(--deep-navy); padding: 7rem 3rem; position: relative; overflow: hidden; }
        .pillars-section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--hot-pink), transparent); }
        .pillars-inner { max-width: 1200px; margin: 0 auto; }
        .section-header { text-align: center; margin-bottom: 4rem; }
        .section-title { font-family: var(--font-display); font-weight: 800; font-size: clamp(2rem, 4vw, 3.2rem); color: var(--white); letter-spacing: -0.02em; line-height: 1.05; }
        .section-title .pink { color: var(--hot-pink); }
        .section-title .italic { font-family: var(--font-accent); font-style: italic; font-weight: 300; }
        .section-sub { margin-top: 1rem; font-size: 0.975rem; color: rgba(255,255,255,0.45); max-width: 480px; margin-left: auto; margin-right: auto; }
        .pillars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .pillar-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 1.5rem; padding: 2.5rem 2rem; position: relative; overflow: hidden; transition: transform 0.3s, border-color 0.3s, background 0.3s; }
        .pillar-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(140deg, rgba(255,24,102,0.07), transparent 60%); opacity: 0; transition: opacity 0.3s; }
        .pillar-card:hover { transform: translateY(-7px); border-color: rgba(255,24,102,0.38); background: rgba(255,255,255,0.07); }
        .pillar-card:hover::before { opacity: 1; }
        .pillar-icon { width: 52px; height: 52px; background: rgba(255,24,102,0.14); border: 1px solid rgba(255,24,102,0.28); border-radius: 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 1.5rem; }
        .pillar-number { position: absolute; top: 1.5rem; right: 1.75rem; font-family: var(--font-display); font-weight: 800; font-size: 4.5rem; color: rgba(255,255,255,0.035); line-height: 1; transition: color 0.3s; pointer-events: none; }
        .pillar-card:hover .pillar-number { color: rgba(255,24,102,0.07); }
        .pillar-title { font-family: var(--font-display); font-weight: 700; font-size: 1.25rem; color: var(--white); margin-bottom: 0.75rem; letter-spacing: -0.01em; }
        .pillar-desc { font-size: 0.875rem; line-height: 1.7; color: rgba(255,255,255,0.5); }
        .pillar-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.5rem; }
        .pillar-tag { background: rgba(255,175,197,0.1); color: var(--light-pink); padding: 0.25rem 0.75rem; border-radius: 100px; font-size: 0.7rem; font-weight: 500; letter-spacing: 0.04em; }
        .chapter-section { padding: 7rem 3rem; background: var(--blush-white); }
        .chapter-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: center; }
        .chapter-step { display: flex; gap: 1.5rem; margin-bottom: 2.5rem; position: relative; }
        .chapter-step::after { content: ''; position: absolute; left: 20px; top: 44px; width: 1px; height: calc(100% + 0.5rem); background: linear-gradient(to bottom, rgba(255,24,102,0.3), transparent); }
        .chapter-step:last-child::after { display: none; }
        .step-num { width: 40px; height: 40px; min-width: 40px; background: var(--hot-pink); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 0.85rem; color: var(--white); position: relative; z-index: 1; }
        .step-title { font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; color: var(--deep-navy); margin-bottom: 0.35rem; }
        .step-desc { font-size: 0.875rem; line-height: 1.65; color: rgba(8,14,42,0.55); }
        .chapter-visual { position: relative; padding-bottom: 3rem; }
        .chapter-card-main { background: var(--deep-navy); border-radius: 1.5rem; padding: 2.5rem; color: var(--white); position: relative; overflow: hidden; }
        .chapter-card-main::before { content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; background: radial-gradient(circle, rgba(255,24,102,0.28), transparent 70%); border-radius: 50%; pointer-events: none; }
        .chapter-badge { display: inline-block; background: rgba(255,24,102,0.18); color: var(--light-pink); padding: 0.3rem 0.85rem; border-radius: 100px; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.25rem; }
        .chapter-card-title { font-family: var(--font-display); font-weight: 800; font-size: 1.6rem; line-height: 1.15; margin-bottom: 0.75rem; }
        .chapter-card-title .pink { color: var(--hot-pink); }
        .chapter-card-sub { font-size: 0.85rem; color: rgba(255,255,255,0.45); line-height: 1.6; }
        .chapter-features { list-style: none; display: flex; flex-direction: column; gap: 0.7rem; margin-top: 1.75rem; }
        .chapter-features li { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: rgba(255,255,255,0.65); }
        .chapter-features li::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--hot-pink); min-width: 6px; }
        .chapter-float { position: absolute; bottom: -0.5rem; right: -1rem; background: var(--white); border-radius: 1rem; padding: 1.1rem 1.4rem; box-shadow: 0 20px 56px rgba(8,14,42,0.14); display: flex; align-items: center; gap: 1rem; }
        .float-icon { width: 44px; height: 44px; border-radius: 0.75rem; background: linear-gradient(135deg, var(--hot-pink), #FF6BA0); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .float-label { font-size: 0.65rem; color: rgba(8,14,42,0.38); text-transform: uppercase; letter-spacing: 0.1em; }
        .float-value { font-family: var(--font-display); font-weight: 700; font-size: 0.9rem; color: var(--deep-navy); }
        .ai-section { padding: 6rem 3rem; background: var(--navy-mid); position: relative; overflow: hidden; }
        .ai-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 15% 50%, rgba(255,24,102,0.13), transparent 45%), radial-gradient(ellipse at 85% 50%, rgba(26,58,143,0.25), transparent 45%); pointer-events: none; }
        .ai-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 5rem; position: relative; }
        .coming-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,24,102,0.18); border: 1px solid rgba(255,24,102,0.35); color: var(--light-pink); padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 1.5rem; }
        .coming-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--hot-pink); animation: pulse 2s infinite; }
        .ai-title { font-family: var(--font-display); font-weight: 800; font-size: clamp(2rem, 4vw, 3rem); color: var(--white); line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 1.25rem; }
        .ai-title .pink { color: var(--hot-pink); }
        .ai-title .italic { font-family: var(--font-accent); font-style: italic; font-weight: 300; }
        .ai-desc { font-size: 1rem; line-height: 1.7; color: rgba(255,255,255,0.5); max-width: 460px; }
        .ai-footnote { font-size: 0.78rem; color: rgba(255,255,255,0.28); margin-top: 1.5rem; }
        .ai-visual { flex-shrink: 0; width: 340px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.25rem; padding: 1.75rem; }
        .ai-mock-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .ai-avatar { width: 38px; height: 38px; background: linear-gradient(135deg, var(--hot-pink), #FF6BA0); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
        .ai-name { font-size: 0.85rem; font-weight: 600; color: var(--white); }
        .ai-role { font-size: 0.68rem; color: rgba(255,255,255,0.38); }
        .ai-bubbles { display: flex; flex-direction: column; gap: 0.75rem; }
        .ai-bubble { padding: 0.7rem 1rem; border-radius: 0.875rem; font-size: 0.78rem; line-height: 1.5; max-width: 88%; }
        .ai-bubble.ai { background: rgba(255,24,102,0.13); color: var(--light-pink); border-bottom-left-radius: 0.2rem; align-self: flex-start; }
        .ai-bubble.user { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.75); border-bottom-right-radius: 0.2rem; align-self: flex-end; }
        .ai-typing { display: flex; gap: 4px; padding: 0.7rem 1rem; background: rgba(255,24,102,0.13); border-radius: 0.875rem; border-bottom-left-radius: 0.2rem; width: fit-content; }
        .ai-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--light-pink); animation: typeBounce 1.2s ease-in-out infinite; }
        .ai-typing span:nth-child(2) { animation-delay: 0.18s; }
        .ai-typing span:nth-child(3) { animation-delay: 0.36s; }
        @keyframes typeBounce { 0%,100% { transform:translateY(0); opacity:0.4; } 50% { transform:translateY(-5px); opacity:1; } }
        .apply-section { padding: 7rem 3rem; text-align: center; background: linear-gradient(140deg, #FF1866 0%, #C7055A 100%); position: relative; overflow: hidden; }
        .apply-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 18% 20%, rgba(255,255,255,0.09), transparent 28%), radial-gradient(circle at 82% 80%, rgba(255,255,255,0.06), transparent 28%); pointer-events: none; }
        .apply-inner { position: relative; max-width: 680px; margin: 0 auto; }
        .apply-title { font-family: var(--font-display); font-weight: 800; font-size: clamp(2.8rem, 6vw, 5rem); color: var(--white); line-height: 0.95; letter-spacing: -0.025em; margin-bottom: 1.5rem; }
        .apply-title .italic { font-family: var(--font-accent); font-style: italic; font-weight: 300; }
        .apply-sub { font-size: 1.1rem; color: rgba(255,255,255,0.72); line-height: 1.65; margin-bottom: 2.75rem; }
        .btn-apply { display: inline-flex; align-items: center; gap: 0.75rem; background: var(--white); color: var(--hot-pink); padding: 1.15rem 2.75rem; border-radius: 100px; font-size: 1rem; font-weight: 700; font-family: var(--font-body); text-decoration: none; transition: transform 0.2s, box-shadow 0.3s; cursor: pointer; border: none; }
        .btn-apply:hover { transform: translateY(-2px); box-shadow: 0 18px 52px rgba(0,0,0,0.22); }
        footer { background: var(--deep-navy); padding: 4.5rem 3rem 2.5rem; border-top: 1px solid rgba(255,255,255,0.05); }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 4rem; margin-bottom: 3rem; padding-bottom: 3rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .footer-logo { font-family: var(--font-display); font-weight: 800; font-size: 1.1rem; color: var(--white); letter-spacing: 0.04em; margin-bottom: 0.75rem; }
        .footer-logo span { color: var(--hot-pink); }
        .footer-tagline { font-size: 0.85rem; color: rgba(255,255,255,0.35); line-height: 1.65; max-width: 230px; }
        .footer-col-title { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 1.25rem; }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
        .footer-links a { color: rgba(255,255,255,0.45); text-decoration: none; font-size: 0.875rem; transition: color 0.2s; cursor: pointer; }
        .footer-links a:hover { color: var(--white); }
        .footer-bottom { display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-size: 0.75rem; color: rgba(255,255,255,0.2); }
        .footer-socials { display: flex; gap: 0.75rem; }
        .social-link { width: 36px; height: 36px; border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.38); text-decoration: none; font-size: 0.75rem; font-weight: 600; transition: border-color 0.2s, color 0.2s, background 0.2s; }
        .social-link:hover { border-color: var(--hot-pink); color: var(--hot-pink); background: rgba(255,24,102,0.1); }
        .footer-bar { background: var(--hot-pink); text-align: center; padding: 1rem 3rem; font-family: var(--font-display); font-weight: 700; font-size: 0.8rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--white); }
        .footer-bar a { color: var(--white); text-decoration: none; opacity: 0.85; transition: opacity 0.2s; }
        .footer-bar a:hover { opacity: 1; }
        .footer-bar .sep { opacity: 0.4; margin: 0 1rem; }
        .stats-section { padding: 7rem 3rem; background: var(--deep-navy); position: relative; overflow: hidden; }
        .stats-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 80% 20%, rgba(255,24,102,0.1), transparent 50%); pointer-events: none; }
        .stats-section-inner { max-width: 1200px; margin: 0 auto; }
        .stats-section-header { margin-bottom: 4rem; }
        .stats-section-title { font-family: var(--font-display); font-weight: 800; font-size: clamp(2rem, 4vw, 3.2rem); color: var(--white); letter-spacing: -0.02em; line-height: 1.1; margin-top: 0.75rem; }
        .stats-section-title .italic-pink { font-family: var(--font-accent); font-style: italic; font-weight: 400; color: var(--hot-pink); }
        .data-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .data-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 1.5rem; padding: 2.25rem 2rem; position: relative; overflow: hidden; transition: border-color 0.3s, background 0.3s; }
        .data-card::before { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--hot-pink), transparent); opacity: 0; transition: opacity 0.3s; }
        .data-card:hover { border-color: rgba(255,24,102,0.3); background: rgba(255,255,255,0.06); }
        .data-card:hover::before { opacity: 1; }
        .data-num { font-family: var(--font-display); font-weight: 800; font-size: clamp(3rem, 6vw, 5rem); color: var(--hot-pink); line-height: 1; margin-bottom: 1rem; letter-spacing: -0.03em; }
        .data-num span { font-size: 0.55em; opacity: 0.8; }
        .data-body { font-size: 0.9rem; line-height: 1.75; color: rgba(255,255,255,0.6); margin-bottom: 1.25rem; }
        .data-source { font-size: 0.7rem; color: rgba(255,255,255,0.25); letter-spacing: 0.02em; font-style: italic; line-height: 1.5; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.06); }
        .modal-overlay { position: fixed; inset: 0; z-index: 999; background: rgba(8,14,42,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 2rem; opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.3s ease, visibility 0.3s; }
        .modal-overlay.open { opacity: 1; visibility: visible; pointer-events: all; }
        .modal-box { background: var(--white); border-radius: 1.5rem; max-width: 680px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 3rem; position: relative; transform: translateY(20px); transition: transform 0.35s cubic-bezier(0.16,1,0.3,1); }
        .modal-overlay.open .modal-box { transform: translateY(0); }
        .modal-close { position: absolute; top: 1.25rem; right: 1.25rem; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid rgba(8,14,42,0.15); background: none; cursor: pointer; font-size: 1.1rem; color: rgba(8,14,42,0.4); display: flex; align-items: center; justify-content: center; transition: border-color 0.2s, color 0.2s, background 0.2s; }
        .modal-close:hover { border-color: var(--hot-pink); color: var(--hot-pink); background: rgba(255,24,102,0.05); }
        .modal-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--hot-pink); margin-bottom: 0.75rem; }
        .modal-title { font-family: var(--font-display); font-weight: 800; font-size: clamp(1.5rem, 3vw, 2rem); color: var(--deep-navy); letter-spacing: -0.02em; margin-bottom: 1.75rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(8,14,42,0.08); }
        .modal-body p { font-size: 0.975rem; line-height: 1.9; color: rgba(8,14,42,0.68); margin-bottom: 1.1rem; }
        .modal-body p:last-child { margin-bottom: 0; }
        .modal-body .bold { font-weight: 700; color: var(--deep-navy); }
        .modal-body .pink { color: var(--hot-pink); font-weight: 500; }
        .modal-body .bold-italic { font-weight: 700; font-style: italic; color: var(--deep-navy); }
        #modal-login .modal-box { background: var(--deep-navy); border: 1px solid rgba(255,24,102,0.4); padding: 0; overflow: hidden; max-width: 480px; }
        .login-modal-header { padding: 2.5rem 2.5rem 2rem; border-bottom: 1px solid rgba(255,24,102,0.2); position: relative; }
        .login-modal-header .modal-close { position: absolute; top: 1.25rem; right: 1.25rem; border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.4); }
        .login-modal-header .modal-close:hover { border-color: var(--hot-pink); color: var(--hot-pink); }
        .login-modal-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--light-pink); margin-bottom: 0.5rem; }
        .login-modal-title { font-family: var(--font-display); font-weight: 800; font-size: clamp(2rem, 4vw, 3rem); color: var(--hot-pink); letter-spacing: -0.02em; line-height: 1; text-transform: uppercase; }
        .login-form-grid { display: grid; grid-template-columns: 1fr; }
        .login-field { padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,24,102,0.2); }
        .login-field label { display: block; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--hot-pink); margin-bottom: 0.6rem; }
        .login-field input { width: 100%; background: transparent; border: none; outline: none; font-family: var(--font-body); font-size: 1rem; color: rgba(255,255,255,0.5); padding: 0; }
        .login-field input::placeholder { color: rgba(255,255,255,0.3); }
        .login-field input:focus { color: var(--white); }
        .login-field-last { padding: 1.75rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; border-bottom: none; }
        .btn-login-submit { width: 100%; background: var(--hot-pink); color: var(--white); border: none; padding: 1rem; border-radius: 100px; font-family: var(--font-display); font-weight: 700; font-size: 0.85rem; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: transform 0.2s, box-shadow 0.3s; }
        .btn-login-submit:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(255,24,102,0.5); }
        .login-forgot { font-size: 0.75rem; color: rgba(255,255,255,0.3); text-decoration: none; transition: color 0.2s; cursor: pointer; }
        .login-forgot:hover { color: var(--light-pink); }
        #modal-apply .modal-box { background: var(--deep-navy); border: 1px solid rgba(255,24,102,0.4); padding: 0; overflow: hidden; max-width: 760px; }
        .apply-modal-header { padding: 2.5rem 2.5rem 2rem; border-bottom: 1px solid rgba(255,24,102,0.2); position: relative; }
        .apply-modal-header .modal-close { position: absolute; top: 1.25rem; right: 1.25rem; border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.4); }
        .apply-modal-header .modal-close:hover { border-color: var(--hot-pink); color: var(--hot-pink); }
        .apply-modal-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--light-pink); margin-bottom: 0.5rem; }
        .apply-modal-title { font-family: var(--font-display); font-weight: 800; font-size: clamp(2rem, 4vw, 3rem); color: var(--hot-pink); letter-spacing: -0.02em; line-height: 1; text-transform: uppercase; }
        .apply-form-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .apply-field { padding: 1.5rem 2rem; border-right: 1px solid rgba(255,24,102,0.2); border-bottom: 1px solid rgba(255,24,102,0.2); }
        .apply-field:nth-child(even) { border-right: none; }
        .apply-field-last { grid-column: 1 / -1; border-right: none; padding: 1.75rem 2rem; display: flex; justify-content: center; border-bottom: none; flex-direction: column; align-items: center; gap: 1rem; }
        .apply-field label { display: block; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--hot-pink); margin-bottom: 0.6rem; }
        .apply-field input, .apply-field select { width: 100%; background: transparent; border: none; outline: none; font-family: var(--font-body); font-size: 1rem; font-weight: 400; color: rgba(255,255,255,0.5); padding: 0; appearance: none; -webkit-appearance: none; cursor: pointer; }
        .apply-field select option { background: var(--deep-navy); color: var(--white); }
        .apply-field input::placeholder { color: rgba(255,255,255,0.3); }
        .apply-field input:focus, .apply-field select:focus { color: var(--white); }
        .apply-field select:invalid { color: rgba(255,255,255,0.3); }
        .btn-apply-submit { background: var(--hot-pink); color: var(--white); border: none; padding: 1rem 3rem; border-radius: 100px; font-family: var(--font-display); font-weight: 700; font-size: 0.85rem; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: transform 0.2s, box-shadow 0.3s; }
        .btn-apply-submit:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(255,24,102,0.5); }
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-d1 { transition-delay: 0.1s; }
        .reveal-d2 { transition-delay: 0.2s; }
        .reveal-d3 { transition-delay: 0.3s; }
        .reveal-d4 { transition-delay: 0.4s; }
        @media (max-width: 900px) {
          nav { padding: 1rem 1.5rem; }
          .nav-links { display: none; }
          .hero { padding: 7rem 1.5rem 9rem; }
          .hero-stats { display: none; }
          .about-section, .chapter-section { padding: 5rem 1.5rem; }
          .stats-section { padding: 5rem 1.5rem; }
          .data-grid { grid-template-columns: 1fr; }
          .pillars-section, .ai-section, .apply-section { padding: 5rem 1.5rem; }
          .about-inner { grid-template-columns: 1fr; gap: 3rem; }
          .pillars-grid { grid-template-columns: 1fr; }
          .chapter-inner { grid-template-columns: 1fr; gap: 3rem; }
          .ai-inner { flex-direction: column; }
          .ai-visual { width: 100%; }
          .footer-top { grid-template-columns: 1fr 1fr; gap: 2.5rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; }
          .footer-bar { font-size: 0.65rem; letter-spacing: 0.1em; padding: 1rem 1.5rem; }
        }
      `}</style>

      {/* NAV */}
      <nav id="mainNav" className={scrolled ? 'scrolled' : ''}>
        <a href="#" className="nav-logo">Her Future <span>Sale</span></a>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li className="nav-dropdown">
            <a href="#">About</a>
            <ul className="dropdown-menu">
              <li><a href="#" onClick={e => { e.preventDefault(); setActiveModal('mission') }}>Our Mission</a></li>
              <li><a href="#" onClick={e => { e.preventDefault(); setActiveModal('vision') }}>Our Vision</a></li>
            </ul>
          </li>
          <li><a href="#" onClick={e => { e.preventDefault(); setActiveModal('apply') }}>Apply</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
        <div className="nav-actions">
          <button className="btn-ghost" onClick={() => setActiveModal('login')}>Member Login</button>
          <button className="btn-primary" onClick={() => setActiveModal('apply')}>Apply Now →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="hero-grid"></div>
        <div className="hero-content">
          <div className="hero-brand-statement">You were not built to wait to be discovered<span>.</span></div>
          <h1 className="hero-headline">
            <span className="line"><span className="line-inner">Built for Women</span></span>
            <span className="line"><span className="line-inner">Who Mean</span></span>
            <span className="line"><span className="line-inner accent">Business.</span></span>
          </h1>
          <p className="hero-sub">Her Future Sale takes college women from zero experience to confident, career-ready professionals — through hands-on sales training, communication mastery, and a community that actually shows up for you.</p>
          <div className="hero-ctas">
            <button className="btn-hero-primary" onClick={() => setActiveModal('apply')}>Apply to the Program →</button>
            <a href="#" className="btn-hero-secondary">Learn More</a>
          </div>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><div className="hero-stat-num">3<em>+</em></div><div className="hero-stat-label">Core Pillars</div></div>
          <div className="hero-stat"><div className="hero-stat-num">100<em>%</em></div><div className="hero-stat-label">Hands-On Learning</div></div>
          <div className="hero-stat"><div className="hero-stat-num">1<em>st</em></div><div className="hero-stat-label">Of Its Kind</div></div>
        </div>
        <div className="scroll-indicator"><div className="scroll-line"></div><span>Scroll</span></div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-section" aria-hidden="true">
        <div className="marquee-track">
          {['Sales Mastery','Communication','Career Readiness','Cold Calling','Confidence','Leadership','Interview Skills','Sales Mastery','Communication','Career Readiness','Cold Calling','Confidence','Leadership','Interview Skills'].map((item, i) => (
            <span key={i} className="marquee-item">{item} <span className="dot">·</span></span>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section className="about-section">
        <div className="about-inner">
          <div className="reveal">
            <p className="section-label">What is Her Future Sale?</p>
            <h2 className="about-headline">The program that gives college women their <span className="italic">edge.</span></h2>
            <p className="about-text">Her Future Sale is a structured, chapter-based program built to close the confidence gap for women entering sales, business, and client-facing careers. We don't just teach theory — we build the real skills that get you hired, promoted, and respected.</p>
            <p className="about-text" style={{marginTop:'1rem'}}>From your first cold call to your first offer letter, Her Future Sale is with you at every step.</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card reveal reveal-d1"><div className="stat-number">3</div><div className="stat-desc">Core curriculum pillars — Sales, Communication, and Career Readiness</div></div>
            <div className="stat-card reveal reveal-d2"><div className="stat-number">0→1</div><div className="stat-desc">Designed for women with zero sales experience who are ready to go all in</div></div>
            <div className="stat-card reveal reveal-d3"><div className="stat-number">AI</div><div className="stat-desc">Powered practice tools for cold calls, pitches, and interview prep</div></div>
            <div className="stat-card reveal reveal-d4"><div className="stat-number">∞</div><div className="stat-desc">A chapter network and community that outlasts your four years</div></div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="stats-section-inner">
          <div className="stats-section-header reveal">
            <p className="section-label" style={{color:'var(--hot-pink)'}}>Why It Matters</p>
            <h2 className="stats-section-title">The gap is real.<br /><span className="italic-pink">The data proves it.</span></h2>
          </div>
          <div className="data-grid">
            <div className="data-card reveal reveal-d1"><div className="data-num">77<span>%</span></div><p className="data-body">The gender pay gap in sales widens by 77% after just five years. Women enter the field nearly equal and fall further behind the longer they stay — despite outperforming men the entire time.</p><p className="data-source">Xactly × University of Houston × San Diego State University, July 2024</p></div>
            <div className="data-card reveal reveal-d2"><div className="data-num">50<span>%</span></div><p className="data-body">Girls' sense of feeling "smart" drops by 50% between ages 13 and 18. Early mentorship is one of the only proven interventions that reverses this trend.</p><p className="data-source">Etre × YPulse National Survey, February 2024. Published via Business Wire</p></div>
            <div className="data-card reveal reveal-d3"><div className="data-num">52<span>%</span></div><p className="data-body">52% of graduates with a bachelor's degree end up underemployed within one year of graduation. Ten years later, 45% still have not caught up.</p><p className="data-source">Burning Glass Institute and Strada Institute for the Future of Work, 2024</p></div>
            <div className="data-card reveal reveal-d4"><div className="data-num">25<span>%</span></div><p className="data-body">Only 25% of today's college graduates enter the workforce with well-developed public speaking skills — yet 95% of HR officials rank oral communication as the single most important entry-level skill.</p><p className="data-source">National Communication Association, citing Conference Board survey of HR officials</p></div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="pillars-section">
        <div className="pillars-inner">
          <div className="section-header reveal">
            <p className="section-label" style={{color:'var(--light-pink)'}}>Curriculum</p>
            <h2 className="section-title">Three Pillars of <span className="italic pink">Confidence</span></h2>
            <p className="section-sub">Everything you need to walk into any room and own it.</p>
          </div>
          <div className="pillars-grid">
            <div className="pillar-card reveal reveal-d1"><div className="pillar-number">01</div><div className="pillar-icon">◈</div><h3 className="pillar-title">Sales Mastery</h3><p className="pillar-desc">Learn the art and science of selling — from cold outreach to closing. Build a repeatable process you can use in any industry, any role.</p><div className="pillar-tags"><span className="pillar-tag">Cold Calling</span><span className="pillar-tag">Objection Handling</span><span className="pillar-tag">Closing Techniques</span><span className="pillar-tag">Sales Frameworks</span></div></div>
            <div className="pillar-card reveal reveal-d2"><div className="pillar-number">02</div><div className="pillar-icon">◎</div><h3 className="pillar-title">Communication Excellence</h3><p className="pillar-desc">Speak clearly, persuasively, and with presence. Master the way you show up in meetings, pitches, and every professional conversation.</p><div className="pillar-tags"><span className="pillar-tag">Executive Presence</span><span className="pillar-tag">Storytelling</span><span className="pillar-tag">Body Language</span></div></div>
            <div className="pillar-card reveal reveal-d3"><div className="pillar-number">03</div><div className="pillar-icon">◇</div><h3 className="pillar-title">Career Readiness</h3><p className="pillar-desc">Translate your training into real offers. Build your brand, ace your interviews, and negotiate what you're actually worth.</p><div className="pillar-tags"><span className="pillar-tag">Interview Prep</span><span className="pillar-tag">Resume & LinkedIn</span><span className="pillar-tag">Personal Brand</span></div></div>
          </div>
        </div>
      </section>

      {/* CHAPTER MODEL */}
      <section className="chapter-section">
        <div className="chapter-inner">
          <div>
            <p className="section-label reveal">How It Works</p>
            <h2 className="section-title reveal" style={{color:'var(--deep-navy)', fontSize:'clamp(2rem,3.5vw,3rem)'}}>The Chapter <span className="italic" style={{color:'var(--hot-pink)'}}>Model</span></h2>
            <p className="reveal" style={{fontSize:'0.975rem', color:'rgba(8,14,42,0.55)', lineHeight:'1.7', maxWidth:'420px', marginTop:'1rem', marginBottom:'2.5rem'}}>Her Future Sale runs on a chapter system — structured to take you from orientation to career-ready in a single semester.</p>
            <div>
              {[
                { n:1, title:'Join Your Chapter', desc:'Apply, get accepted, and join a cohort of driven women at your school. Set your goals and get oriented.' },
                { n:2, title:'Learn the Curriculum', desc:'Work through the three pillars with interactive lessons, workshops, and real-world practice scenarios.' },
                { n:3, title:'Practice & Get Feedback', desc:'Role-play cold calls, mock interviews, and pitch simulations with peers and AI-powered coaching tools.' },
                { n:4, title:'Track Your Progress', desc:'Your personal dashboard keeps your milestones, skill unlocks, and journey to confident all in one place.' },
                { n:5, title:'Enter the Workforce Ready', desc:'Walk into your first room — interview, pitch, or boardroom — with the confidence, skills, and professional presence to own it.' },
              ].map(step => (
                <div key={step.n} className={`chapter-step reveal reveal-d${Math.min(step.n, 4)}`}>
                  <div className="step-num">{step.n}</div>
                  <div><div className="step-title">{step.title}</div><div className="step-desc">{step.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="chapter-visual reveal">
            <div className="chapter-card-main">
              <div className="chapter-badge">Member Dashboard Preview</div>
              <h3 className="chapter-card-title">Your Progress, <span className="pink">Visualized.</span></h3>
              <p className="chapter-card-sub">Track every lesson, practice session, and milestone in your personal Her Future Sale dashboard.</p>
              <ul className="chapter-features">
                <li>Personal skill progress tracker</li>
                <li>Interactive learning modules</li>
                <li>Session history & feedback logs</li>
                <li>Chapter leaderboard & community</li>
                <li>AI cold call practice scores</li>
              </ul>
            </div>
            <div className="chapter-float">
              <div className="float-icon">✦</div>
              <div><div className="float-label">Current Milestone</div><div className="float-value">Sales Fundamentals</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* AI TEASER */}
      <section className="ai-section">
        <div className="ai-inner">
          <div className="reveal">
            <div className="coming-badge"><span className="dot"></span>Coming Soon</div>
            <h2 className="ai-title">AI-Powered <span className="italic pink">Cold Call</span><br />Practice — On Demand.</h2>
            <p className="ai-desc">Practice your pitch with an AI prospect that pushes back, handles objections, and gives you real-time coaching. No judgment. No scheduling. Just reps.</p>
            <p className="ai-footnote">Launching with the member portal · Available to all Her Future Sale members</p>
          </div>
          <div className="ai-visual reveal">
            <div className="ai-mock-header">
              <div className="ai-avatar">🤖</div>
              <div><div className="ai-name">Her Future Sale AI Coach</div><div className="ai-role">Cold Call Practice Mode</div></div>
            </div>
            <div className="ai-bubbles">
              <div className="ai-bubble ai">"Hello — I'm going to stop you right there, we're not interested."</div>
              <div className="ai-bubble user">"Totally fair, Sarah — I'll be under 30 seconds. Most SDRs I talk to are struggling with..."</div>
              <div className="ai-bubble ai">"We already have a solution for that."</div>
              <div className="ai-typing"><span></span><span></span><span></span></div>
            </div>
          </div>
        </div>
      </section>

      {/* APPLY CTA */}
      <section className="apply-section">
        <div className="apply-inner">
          <h2 className="apply-title reveal">Your seat is<br /><span className="italic">waiting for you.</span></h2>
          <p className="apply-sub reveal">Applications are open for the next cohort. Join a community of ambitious college women who are done waiting and ready to lead.</p>
          <button className="btn-apply reveal" onClick={() => setActiveModal('apply')}>Apply to Her Future Sale Today →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div><div className="footer-logo">Her Future <span>Sale</span></div><p className="footer-tagline">Built for college women who mean business. From beginner to confident.</p></div>
            <div><p className="footer-col-title">Program</p><ul className="footer-links"><li><a href="#">About Her Future Sale</a></li><li><a href="#">Curriculum</a></li><li><a href="#">AI Practice Tool</a></li></ul></div>
            <div><p className="footer-col-title">Community</p><ul className="footer-links"><li><a href="#" onClick={e => { e.preventDefault(); setActiveModal('apply') }}>Apply Now</a></li><li><a href="#" onClick={e => { e.preventDefault(); setActiveModal('login') }}>Member Login</a></li><li><a href="#">Find a Chapter</a></li><li><a href="#">Contact</a></li></ul></div>
            <div><p className="footer-col-title">Follow</p><ul className="footer-links"><li><a href="#">Instagram</a></li><li><a href="#">LinkedIn</a></li><li><a href="#">TikTok</a></li></ul></div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2026 Her Future Sale. All rights reserved.</p>
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="LinkedIn">in</a>
              <a href="#" className="social-link" aria-label="Instagram">ig</a>
              <a href="#" className="social-link" aria-label="TikTok">tt</a>
            </div>
          </div>
        </div>
      </footer>
      <div className="footer-bar">HER FUTURE SALE <span className="sep">|</span> <a href="https://herfuturesale.com">herfuturesale.com</a> <span className="sep">|</span> <a href="https://instagram.com/herfuturesale">@herfuturesale</a></div>

      {/* MODAL: MISSION */}
      <div className={`modal-overlay${activeModal === 'mission' ? ' open' : ''}`} id="modal-mission" onClick={() => setActiveModal(null)}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setActiveModal(null)}>✕</button>
          <p className="modal-label">Our Foundation</p>
          <h2 className="modal-title">Our Mission</h2>
          <div className="modal-body">
            <p><span className="bold">Her Future Sale exists to give college women the one thing most institutions never hand them: the ability to own their value before the world teaches them to shrink.</span></p>
            <p>We believe the women who win early in their careers are not always the most qualified. They are the ones who learned how to walk into a room with confidence, articulate what they bring to the table without apology, and ask for exactly what they deserve. That skill is not luck and it is not personality. It is learned. And we are here to teach it.</p>
            <p>Our mission is to close the gap between the ambitious woman sitting in a lecture hall and the version of her that lands the co-op she actually wants, earns the opportunity she worked for, and builds a career on her own terms.</p>
          </div>
        </div>
      </div>

      {/* MODAL: VISION */}
      <div className={`modal-overlay${activeModal === 'vision' ? ' open' : ''}`} id="modal-vision" onClick={() => setActiveModal(null)}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setActiveModal(null)}>✕</button>
          <p className="modal-label">Our Foundation</p>
          <h2 className="modal-title">Our Vision</h2>
          <div className="modal-body">
            <p><span className="bold">We envision a world where no college woman enters the workforce without knowing her worth, without the tools to communicate it, and without a community of women beside her who refuse to settle for less.</span></p>
            <p>Her Future Sale is not a club you join to add a line to your resume. It is the place where you figure out who you are professionally before anyone else gets to define that for you.</p>
            <p><span className="pink">We are building a generation of women who do not wait to be discovered. They show up. They speak up. They close.</span></p>
            <p><span className="bold-italic">That is what we are building. And we are just getting started.</span></p>
          </div>
        </div>
      </div>

      {/* MODAL: LOGIN */}
      <div className={`modal-overlay${activeModal === 'login' ? ' open' : ''}`} id="modal-login" onClick={() => setActiveModal(null)}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <div className="login-modal-header">
            <button className="modal-close" onClick={() => setActiveModal(null)}>✕</button>
            <p className="login-modal-label">Her Future Sale</p>
            <h2 className="login-modal-title">Member Login</h2>
          </div>
          <div className="login-form-grid">
            <div className="login-field">
              <label>Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Your email address" />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Your password" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div className="login-field-last">
              {loginError && <p style={{color:'#FF1866', fontSize:'0.8rem', width:'100%', textAlign:'center'}}>{loginError}</p>}
              <button className="btn-login-submit" onClick={handleLogin}>{loginLoading ? 'Logging in...' : 'Login →'}</button>
              <a className="login-forgot">Forgot your password?</a>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: APPLY */}
      <div className={`modal-overlay${activeModal === 'apply' ? ' open' : ''}`} id="modal-apply" onClick={() => setActiveModal(null)}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <div className="apply-modal-header">
            <button className="modal-close" onClick={() => setActiveModal(null)}>✕</button>
            <p className="apply-modal-label">Her Future Sale</p>
            <h2 className="apply-modal-title">Apply Now</h2>
          </div>
          {applyStatus === 'success' ? (
            <div style={{padding:'3rem', textAlign:'center'}}>
              <p style={{color:'#FF1866', fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.5rem', marginBottom:'1rem'}}>Application Received! 🎉</p>
              <p style={{color:'rgba(255,255,255,0.5)', fontSize:'0.9rem'}}>We'll be in touch soon. Keep an eye on your inbox.</p>
              <button className="btn-apply-submit" style={{marginTop:'2rem'}} onClick={() => { setApplyStatus(''); setActiveModal(null) }}>Close</button>
            </div>
          ) : (
            <div className="apply-form-grid">
              <div className="apply-field"><label>First Name</label><input type="text" value={applyFname} onChange={e => setApplyFname(e.target.value)} placeholder="First Name" /></div>
              <div className="apply-field"><label>Last Name</label><input type="text" value={applyLname} onChange={e => setApplyLname(e.target.value)} placeholder="Last Name" /></div>
              <div className="apply-field"><label>School Email</label><input type="email" value={applyEmail} onChange={e => setApplyEmail(e.target.value)} placeholder="School Email" /></div>
              <div className="apply-field"><label>University</label><input type="text" value={applyUni} onChange={e => setApplyUni(e.target.value)} placeholder="Your University" /></div>
              <div className="apply-field">
                <label>Graduation Year</label>
                <select value={applyYear} onChange={e => setApplyYear(e.target.value)} required>
                  <option value="" disabled>Select year</option>
                  {['2025','2026','2027','2028','2029'].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="apply-field">
                <label>Interest Area</label>
                <select value={applyInterest} onChange={e => setApplyInterest(e.target.value)} required>
                  <option value="" disabled>Select focus</option>
                  {['Confidence','Interview Skills','Sales','Community'].map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div className="apply-field-last">
                {applyStatus && <p style={{color:'#FF1866', fontSize:'0.8rem'}}>{applyStatus}</p>}
                <button className="btn-apply-submit" onClick={handleApply}>{applyLoading ? 'Submitting...' : 'Submit Application →'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}