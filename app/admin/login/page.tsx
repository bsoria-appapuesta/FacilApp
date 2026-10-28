'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setErrorMsg('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setCargando(false)

    if (error) {
      setErrorMsg('Credenciales inválidas. Verificá tu correo y contraseña.')
    } else if (data?.user) {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-white">Acceso al Panel</h1>
          <p className="text-xs text-slate-400">Ingresá tus credenciales para administrar FacilApp</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                placeholder="admin@tunegocio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <span>{cargando ? 'Ingresando...' : 'Iniciar Sesión'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-800">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Acceso seguro y encriptado
          </p>
        </div>

      </div>
    </div>
  )
}