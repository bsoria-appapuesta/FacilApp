'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle2 } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function RecuperarClavePage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null)

  async function handleCambiarClave(e: React.FormEvent) {
    e.preventDefault()
    setMensaje(null)

    if (password.length < 8) {
      setMensaje({ tipo: 'error', texto: 'La nueva contraseña debe tener al menos 8 caracteres.' })
      return
    }

    setCargando(true)

    const { error } = await supabase.auth.updateUser({ password })

    setCargando(false)

    if (error) {
      setMensaje({ tipo: 'error', texto: 'El enlace expiró o no es válido. Solicitá uno nuevo.' })
    } else {
      setMensaje({ tipo: 'exito', texto: '¡Contraseña actualizada con éxito! Redirigiendo a tu panel...' })
      setTimeout(() => {
        router.push('/admin')
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Nueva contraseña</h1>
          <p className="text-xs text-slate-400">Ingresá tu nueva clave para acceder a tu cuenta.</p>
        </div>

        {mensaje && (
          <div className={`p-3.5 rounded-2xl text-xs border ${
            mensaje.tipo === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 flex items-center gap-2'
          }`}>
            {mensaje.tipo === 'exito' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{mensaje.texto}</span>
          </div>
        )}

        <form onSubmit={handleCambiarClave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg"
          >
            {cargando ? 'Guardando...' : 'Cambiar contraseña y entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}