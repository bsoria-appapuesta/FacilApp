'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

function ConfirmarCuentaForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMensaje(null)

    // Validamos el código OTP numérico para el registro ('signup')
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: codigo.trim(),
      type: 'signup',
    })

    if (otpError) {
      setError('El código ingresado es incorrecto o ya expiró.')
      setLoading(false)
      return
    }

    setMensaje('¡Cuenta activada con éxito! Redirigiendo...')
    setTimeout(() => {
      if (email.trim() === 'braiandsoria@gmail.com') {
        router.push('/superadmin')
      } else {
        router.push('/admin')
      }
    }, 1500)
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white">
      <h2 className="text-2xl font-bold text-center">Confirmá tu cuenta</h2>
      <p className="text-xs text-center text-slate-400">
        Ingresá el código que te enviamos por correo para activar tu cuenta.
      </p>

      {error && (
        <div className="p-3 text-xs text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/30">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="p-3 text-xs text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
          {mensaje}
        </div>
      )}

      <form onSubmit={handleConfirmar} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@correo.com"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Código de confirmación
          </label>
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            maxLength={10}
            placeholder="Pegá el código acá"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white text-center tracking-widest text-lg font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg mt-2"
        >
          {loading ? 'Verificando...' : 'Activar cuenta y entrar'}
        </button>
      </form>
    </div>
  )
}

export default function ConfirmarCuentaPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Suspense fallback={<p className="text-xs text-slate-500">Cargando...</p>}>
        <ConfirmarCuentaForm />
      </Suspense>
    </div>
  )
}