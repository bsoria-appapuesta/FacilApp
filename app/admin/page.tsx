'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, ShieldCheck, CheckCircle2, Lock } from 'lucide-react'

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
          texto: 'Cuenta creada. Revisá tu casilla de correo para confirmar el acceso.'
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
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* ENCABEZADO */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight">FacilApp</h1>
          <p className="text-xs text-slate-400">Tu plataforma de turnos online y catálogo digital</p>
        </div>

        {/* SELECTOR DE PESTAÑAS */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setModo('login'); setMensaje(null) }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              modo === 'login' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setModo('registro'); setMensaje(null) }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              modo === 'registro' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* LEYENDA Y CONDICIONES (SOLO VISIBLE EN REGISTRO) */}
        {modo === 'registro' && (
          <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Prueba Gratis: 10 Días
              </span>
              <span className="text-xs font-black text-white">
                $13.800 <span className="text-[10px] text-slate-400 font-normal">/ mes</span>
              </span>
            </div>

            <ul className="text-[11px] text-slate-300 space-y-1.5 pt-1 border-t border-slate-800">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Probá la plataforma completa sin poner tarjeta ahora.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>0% de comisiones por reservas o pedidos recibidos.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Finalizados los 10 días, abonás mes a mes sin permanencia ni ataduras.</span>
              </li>
            </ul>
          </div>
        )}

        {/* MENSAJES DE ESTADO */}
        {mensaje && (
          <div
            className={`p-3.5 rounded-2xl text-xs border ${
              mensaje.tipo === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Correo electrónico
            </label>
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
              <label className="block text-xs font-semibold text-slate-300">
                Contraseña
              </label>
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
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg mt-2"
          >
            {cargando ? 'Procesando...' : modo === 'login' ? 'Entrar a mi panel' : 'Comenzar mi prueba de 10 días'}
          </button>
        </form>

        {modo === 'registro' && (
          <p className="text-[10px] text-center text-slate-500 leading-relaxed">
            Al registrarte aceptás los términos de uso del servicio. Renovación voluntaria mensual al concluir el período de prueba.
          </p>
        )}
      </div>

      {/* MODAL RECUPERAR CONTRASEÑA */}
      {mostrarRecuperar && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" /> Recuperar contraseña
            </h3>
            <p className="text-xs text-slate-400">
              Ingresá tu correo electrónico registrado y te enviaremos el enlace para restablecerla.
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
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargandoRecuperar}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow"
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