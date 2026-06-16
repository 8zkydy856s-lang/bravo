'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Zkontroluj e-mail pro potvrzeni registrace.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else window.location.href = '/'
    }
    setLoading(false)
  }

  return (
    <main style={{minHeight:'100vh',background:'#f7f3ec',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'white',borderRadius:'20px',padding:'32px 28px',width:'320px',boxShadow:'0 2px 20px rgba(0,0,0,0.08)'}}>
        <h1 style={{fontSize:'24px',fontWeight:'300',letterSpacing:'0.3em',color:'#1a1208',margin:'0 0 4px'}}>BRAVO</h1>
        <p style={{fontSize:'11px',color:'#8a7f70',letterSpacing:'0.1em',margin:'0 0 28px'}}>Luxembourg specialty coffee</p>
        <h2 style={{fontSize:'16px',fontWeight:'500',color:'#1a1208',margin:'0 0 20px'}}>{isRegister ? 'Vytvorit ucet' : 'Prihlasit se'}</h2>
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} style={{width:'100%',padding:'12px',border:'1px solid #e0d9d0',borderRadius:'10px',fontSize:'14px',marginBottom:'12px',boxSizing:'border-box',outline:'none'}} />
        <input type="password" placeholder="Heslo" value={password} onChange={e => setPassword(e.target.value)} style={{width:'100%',padding:'12px',border:'1px solid #e0d9d0',borderRadius:'10px',fontSize:'14px',marginBottom:'20px',boxSizing:'border-box',outline:'none'}} />
        <button onClick={handleSubmit} disabled={loading} style={{width:'100%',padding:'13px',background:'#1a1208',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'500',cursor:'pointer',marginBottom:'16px'}}>
          {loading ? 'Nacitam...' : isRegister ? 'Zaregistrovat se' : 'Prihlasit se'}
        </button>
        {message && <p style={{fontSize:'13px',color:'#c0392b',textAlign:'center',margin:'0 0 12px'}}>{message}</p>}
        <p style={{fontSize:'13px',color:'#8a7f70',textAlign:'center',margin:0}}>
          {isRegister ? 'Uz mas ucet?' : 'Nemas ucet?'}{' '}
          <span onClick={() => setIsRegister(!isRegister)} style={{color:'#1a1208',cursor:'pointer',fontWeight:'500'}}>
            {isRegister ? 'Prihlasit se' : 'Registrovat'}
          </span>
        </p>
      </div>
    </main>
  )
}
