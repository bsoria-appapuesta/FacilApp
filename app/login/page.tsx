'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabInicial = searchParams.get('tab') === 'registro' ? 'registro' : 'login'

  const [modo, setModo] = useState<'login' | 'registro'>(tabInicial)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null)

  const [mostrarRecuperar, setMostrarRecuperar] = useState(false)
  const [emailRecuperar, setEmailRecuperar] = useState('')
  const [cargandoRecuperar, setCargandoRecuperar] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMensaje(null)
    setCargando(true)

    if (modo === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      setCargando(false)

      if (error) {
        setMensaje({ tipo: 'error', texto: error.message })
        return
      }

      if (data.user?.email === 'braiandsoria@gmail.com') {
        router.push('/superadmin')
      } else {
        router.push('/admin')
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      setCargando(false)

      if (error) {
        setMensaje({ tipo: 'error', texto: error.message })
        return
      }

      if (data.session) {
        if (data.user?.email === 'braiandsoria@gmail.com') {
          router.push('/superadmin')
        } else {
          router.push('/admin')
        }
      } else {
        setMensaje({
          tipo: 'exito',
          texto: 'Cuenta creada. Revisá tu bandeja de correo para confirmar el registro.'
        })
      }
    }
  }

  async function handleSolicitarRecuperacion(e: React.FormEvent) {
    e.preventDefault()
    setCargandoRecuperar(true)

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://facilapp-seven.vercel.app'

    const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperar, {
      redirectTo: `${siteUrl}/recuperar-clave`
    })

    setCargandoRecuperar(false)

    if (error) {
      alert('Error al enviar correo: ' + error.message)
    } else {
      alert(`Te enviamos un enlace de recuperación a ${emailRecuperar}.`)
      setMostrarRecuperar(false)
      setEmailRecuperar('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-white">FacilApp</h1>
          <p className="text-xs text-slate-400 mt-1">Gestión de turnos y suscripciones</p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setModo('login'); setMensaje(null) }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              modo === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setModo('registro'); setMensaje(null) }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              modo === 'registro' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {mensaje && (
          <div
            className={`p-3 rounded-xl text-xs mb-4 border ${
              mensaje.tipo === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300">Contraseña</label>
              {modo === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setEmailRecuperar(email)
                    setMostrarRecuperar(true)
                  }}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg mt-2"
          >
            {cargando ? 'Procesando...' : modo === 'login' ? 'Entrar a mi panel' : 'Crear mi cuenta'}
          </button>
        </form>
      </div>

      {mostrarRecuperar && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-base font-bold text-white">Recuperar contraseña</h3>
            <p className="text-xs text-slate-400">
              Ingresá tu correo electrónico registrado y te enviaremos un enlace para cambiar tu contraseña.
            </p>

            <form onSubmit={handleSolicitarRecuperacion} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={emailRecuperar}
                  onChange={(e) => setEmailRecuperar(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setMostrarRecuperar(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargandoRecuperar}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                >
                  {cargandoRecuperar ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-xs text-slate-500">Cargando...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}