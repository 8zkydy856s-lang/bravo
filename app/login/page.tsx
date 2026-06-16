'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    email: '', password: '', jmeno: '', prijmeni: '',
    pohlavie: '', telefon: '', datum_narozeni: '',
    newsletter: false, notifikace_nabidky: false, notifikace_novinky: false
  })

  const set = (k: string, v: any) => setForm(f => ({...f, [k]: v}))

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: {
          jmeno: form.jmeno, prijmeni: form.prijmeni,
          pohlavie: form.pohlavie, telefon: form.telefon,
          datum_narozeni: form.datum_narozeni,
          newsletter: form.newsletter,
          notifikace_nabidky: form.notifikace_nabidky,
          notifikace_novinky: form.notifikace_novinky
        }}
      })
      if (error) setMessage(error.message)
      else setMessage('Zkontroluj e-mail pro potvrzení registrace.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      if (error) setMessage(error.message)
      else window.location.href = '/'
    }
    setLoading(false)
  }

  const inp = (ph: string, k: string, type='text') => (
    <input type={type} placeholder={ph} value={(form as any)[k]} onChange={e => set(k, e.target.value)}
      style={{width:'100%',padding:'12px 14px',border:'1px solid #e0d9d0',borderRadius:'10px',fontSize:'14px',marginBottom:'10px',boxSizing:'border-box',outline:'none',fontFamily:'Inter,sans-serif'}} />
  )

  return (
    <main style={{minHeight:'100vh',background:'#f7f3ec',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',padding:'20px',boxSizing:'border-box'}}>
      <div style={{background:'white',borderRadius:'20px',padding:'32px 28px',width:'100%',maxWidth:'380px',boxShadow:'0 2px 20px rgba(0,0,0,0.07)'}}>
        <h1 style={{fontSize:'24px',fontWeight:'300',letterSpacing:'0.3em',color:'#1a1208',margin:'0 0 2px'}}>BRAVO</h1>
        <p style={{fontSize:'11px',color:'#8a7f70',letterSpacing:'0.12em',margin:'0 0 24px'}}>Luxembourg · specialty coffee</p>

        <h2 style={{fontSize:'15px',fontWeight:'600',color:'#1a1208',margin:'0 0 16px'}}>{isRegister ? 'Vytvořit účet' : 'Přihlásit se'}</h2>

        {isRegister && <>
          <div style={{display:'flex',gap:'8px',marginBottom:'0'}}>
            <input type="text" placeholder="Jméno" value={form.jmeno} onChange={e => set('jmeno', e.target.value)}
              style={{width:'50%',padding:'12px 14px',border:'1px solid #e0d9d0',borderRadius:'10px',fontSize:'14px',marginBottom:'10px',boxSizing:'border-box',outline:'none'}} />
            <input type="text" placeholder="Příjmení" value={form.prijmeni} onChange={e => set('prijmeni', e.target.value)}
              style={{width:'50%',padding:'12px 14px',border:'1px solid #e0d9d0',borderRadius:'10px',fontSize:'14px',marginBottom:'10px',boxSizing:'border-box',outline:'none'}} />
          </div>

          <select value={form.pohlavie} onChange={e => set('pohlavie', e.target.value)}
            style={{width:'100%',padding:'12px 14px',border:'1px solid #e0d9d0',borderRadius:'10px',fontSize:'14px',marginBottom:'10px',boxSizing:'border-box',outline:'none',background:'white',color: form.pohlavie ? '#1a1208' : '#aaa'}}>
            <option value="">Pohlaví</option>
            <option value="muz">Muž</option>
            <option value="zena">Žena</option>
            <option value="jine">Jiné</option>
          </select>

          {inp('Telefon', 'telefon', 'tel')}
          {inp('Datum narození', 'datum_narozeni', 'date')}
        </>}

        {inp('E-mail', 'email', 'email')}
        {inp('Heslo (min. 6 znaků)', 'password', 'password')}

        {isRegister && <>
          <p style={{fontSize:'12px',color:'#8a7f70',margin:'8px 0 6px',fontWeight:'500'}}>Notifikace & preference</p>
          {[
            ['newsletter', 'Chci dostávat newsletter a novinky'],
            ['notifikace_nabidky', 'Upozornit mě na speciální nabídky'],
            ['notifikace_novinky', 'Novinky v menu a seasonal specials'],
          ].map(([k, label]) => (
            <label key={k} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',color:'#1a1208',marginBottom:'8px',cursor:'pointer'}}>
              <input type="checkbox" checked={(form as any)[k]} onChange={e => set(k, e.target.checked)}
                style={{width:'16px',height:'16px',accentColor:'#1a1208'}} />
              {label}
            </label>
          ))}
        </>}

        <button onClick={handleSubmit} disabled={loading}
          style={{width:'100%',padding:'13px',background:'#1a1208',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'500',cursor:'pointer',marginTop:'12px',marginBottom:'14px',fontFamily:'Inter,sans-serif'}}>
          {loading ? 'Načítám...' : isRegister ? 'Zaregistrovat se' : 'Přihlásit se'}
        </button>

        {message && <p style={{fontSize:'13px',color: message.includes('Zkontroluj') ? '#2e7d32' : '#c0392b',textAlign:'center',margin:'0 0 10px'}}>{message}</p>}

        <p style={{fontSize:'13px',color:'#8a7f70',textAlign:'center',margin:0}}>
          {isRegister ? 'Už máš účet?' : 'Nemáš účet?'}{' '}
          <span onClick={() => {setIsRegister(!isRegister); setMessage('')}} style={{color:'#1a1208',cursor:'pointer',fontWeight:'600'}}>
            {isRegister ? 'Přihlásit se' : 'Registrovat'}
          </span>
        </p>
      </div>
    </main>
  )
}
