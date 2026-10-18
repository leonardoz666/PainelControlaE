'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react'
import { api, ApiError } from '@/app/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void api('/auth/me').then(() => router.replace('/')).catch(() => undefined)
  }, [router])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) })
      router.replace('/')
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'Não foi possível entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main id="main-content" className="login-shell">
      <section className="login-brand-panel" aria-label="ControlaÊ">
        <div className="login-brand"><span><Crown size={23} aria-hidden="true" /></span><div><strong>ControlaÊ</strong><small>Painel CEO</small></div></div>
        <div className="login-message">
          <h1>Controle da plataforma, sem interferir na operação.</h1>
          <p>Gerencie estabelecimentos, acessos e disponibilidade em um ambiente separado dos restaurantes.</p>
        </div>
        <p className="login-environment"><LockKeyhole size={15} aria-hidden="true" /> Ambiente restrito à administração</p>
      </section>

      <section className="login-access-panel">
        <form onSubmit={submit} className="login-form" aria-busy={loading}>
          <div className="login-mobile-mark"><Crown size={22} aria-hidden="true" /></div>
          <h2>Entrar no Painel CEO</h2>
          <p>Use sua credencial administrativa. Acessos dos restaurantes entram pelo link de cada estabelecimento.</p>

          <label className="login-label" htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="username" spellCheck={false} required value={email} onChange={event => setEmail(event.target.value)} className="login-input" />

          <label className="login-label" htmlFor="senha">Senha</label>
          <div className="login-password">
            <input id="senha" name="senha" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={senha} onChange={event => setSenha(event.target.value)} className="login-input" />
            <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>
          </div>

          {error && <p role="alert" aria-live="polite" className="login-error">{error}</p>}
          <button type="submit" disabled={loading} className="login-submit">
            {loading && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
