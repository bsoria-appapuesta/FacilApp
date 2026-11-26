'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, CheckCircle2, Lock } from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Función para traducir los errores nativos de Supabase al español
function traducirError(mensajeIngles: string): string {
  const msg = mensajeIngles.toLowerCase()
  if (msg.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos. Verificalos e intentá nuevamente.'
  }
  if (msg.includes('user already registered')) {
    return 'Este correo ya tiene una cuenta registrada. Seleccioná "Iniciar Sesión".'
  }
  if (msg.includes('email rate limit exceeded')) {
    return 'Se enviaron demasiados correos en poco tiempo. Por favor, esperá unos minutos.'
  }
  if (msg.includes('network request failed') || msg.includes('failed to fetch')) {
    return 'Error de conexión. Revisá tu conexión a internet.'
  }
  if (msg.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }
  if (msg.includes('email not confirmed')) {
    return 'El correo no está confirmado todavía. Revisá tu casilla de correo.'
  }
  return mensajeIngles
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabInicial = searchParams.get('tab') === 'registro' ? 'registro' : 'login'

  const [modo, setModo] = useState<'login' | 'registro'>(tabInicial)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [cargandoGoogle, setCargandoGoogle] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null)

  const [mostrarRecuperar, setMostrarRecuperar] = useState(false)
  const [emailRecuperar, setEmailRecuperar] = useState('')
  const [cargandoRecuperar, setCargandoRecuperar] = useState(false)
  const [mensajeRecuperar, setMensajeRecuperar] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null)

  // Si ya inició sesión (por ejemplo, al regresar de Google), redirige automáticamente
  useEffect(() => {
    const verificarSesionExistente = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        if (session.user.email === 'braiandsoria@gmail.com') {
          router.push('/superadmin')
        } else {
          router.push('/admin')
        }
      }
    }
    verificarSesionExistente()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (session.user.email === 'braiandsoria@gmail.com') {
          router.push('/superadmin')
        } else {
          router.push('/admin')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  function validarContrasena(pass: string): string | null {
    if (pass.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.'
    }
    if (!/[A-Z]/.test(pass)) {
      return 'La contraseña debe contener al menos una letra mayúscula.'
    }
    if (!/[a-z]/.test(pass)) {
      return 'La contraseña debe contener al menos una letra minúscula.'
    }
    if (!/[0-9]/.test(pass)) {
      return 'La contraseña debe contener al menos un número.'
    }
    return null
  }

  async function handleLoginGoogle() {
    setMensaje(null)
    setCargandoGoogle(true)

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://facilapp-seven.vercel.app'

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/admin`,
      },
    })

    if (error) {
      setCargandoGoogle(false)
      setMensaje({ tipo: 'error', texto: traducirError(error.message) })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMensaje(null)

    if (modo === 'registro') {
      const errorClave = validarContrasena(password)
      if (errorClave) {
        setMensaje({ tipo: 'error', texto: errorClave })
        return
      }
    }

    setCargando(true)

    if (modo === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      setCargando(false)

      if (error) {
        setMensaje({ tipo: 'error', texto: traducirError(error.message) })
        return
      }

      if (data.user?.email === 'braiandsoria@gmail.com') {
        router.push('/superadmin')
      } else {
        router.push('/admin')
      }
    } else {
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://facilapp-seven.vercel.app'

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/confirmar-cuenta`,
        },
      })

      if (error) {
        setCargando(false)
        setMensaje({ tipo: 'error', texto: traducirError(error.message) })
        return
      }

      // Valida si el correo ya estaba registrado en Supabase
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setCargando(false)
        setMensaje({
          tipo: 'error',
          texto: 'Este correo ya tiene una cuenta registrada. Seleccioná "Iniciar Sesión".'
        })
        return
      }

      setCargando(false)

      // Si requiere confirmación por email, redirige directo a la pantalla del código
      if (!data.session) {
        router.push(`/confirmar-cuenta?email=${encodeURIComponent(email.trim())}`)
        return
      }

      if (email === 'braiandsoria@gmail.com') {
        router.push('/superadmin')
      } else {
        router.push('/admin')
      }
    }
  }

  async function handleSolicitarRecuperacion(e: React.FormEvent) {
    e.preventDefault()
    setMensajeRecuperar(null)
    setCargandoRecuperar(true)

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://facilapp-seven.vercel.app'

    const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperar.trim(), {
      redirectTo: `${siteUrl}/recuperar-clave`
    })

    if (error) {
      setCargandoRecuperar(false)
      setMensajeRecuperar({
        tipo: 'error',
        texto: traducirError(error.message)
      })
      return
    }

    router.push(`/recuperar-clave?email=${encodeURIComponent(emailRecuperar.trim())}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        
        {/* ENCABEZADO */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight">FacilApp</h1>
          <p className="text-xs text-slate-400">Plataforma de turnos online y catálogo digital</p>
        </div>

        {/* TARJETA DE PRECIO Y CONDICIONES */}
        <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Prueba Gratis: 10 Días
            </span>
            <span className="text-xs font-black text-white">
              $16.400 <span className="text-[10px] text-slate-400 font-normal">/ mes</span>
            </span>
          </div>

          <ul className="text-[11px] text-slate-300 space-y-1.5 pt-2 border-t border-slate-800/80">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>10 días de acceso total sin ingresar tarjeta ahora.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>0% de comisiones por reservas o turnos confirmados.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Abono mes a mes sin permanencia ni renovación obligada.</span>
            </li>
          </ul>
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
                    setMensajeRecuperar(null)
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
              placeholder={modo === 'registro' ? 'Mín. 8 caracteres, mayúscula y número' : '••••••••'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            {modo === 'registro' && (
              <p className="text-[10px] text-slate-500 mt-1">
                Debe incluir mínimo 8 caracteres, una mayúscula, una minúscula y un número.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={cargando || cargandoGoogle}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg mt-2"
          >
            {cargando 
              ? 'Procesando...' 
              : modo === 'login' 
              ? 'Entrar a mi panel' 
              : 'Comenzar mi prueba de 10 días'}
          </button>
        </form>

        {/* SEPARADOR */}
        <div className="relative flex items-center py-0.5">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="shrink mx-3 text-[11px] text-slate-500 font-medium">o continuá con</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* BOTÓN DE GOOGLE */}
        <button
          type="button"
          onClick={handleLoginGoogle}
          disabled={cargandoGoogle || cargando}
          className="w-full bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-900 font-bold py-3 px-4 rounded-xl text-xs transition shadow flex items-center justify-center gap-2.5"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.3 0 6.08-1.09 8.11-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.23 1.18-3.26 0-6.02-2.2-7-5.16H1.01v3.14C3.05 21.2 7.24 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5 14.01c-.25-.74-.39-1.54-.39-2.36 0-.82.14-1.62.39-2.36V6.15H1.01C.37 7.43 0 8.87 0 10.39s.37 2.96 1.01 4.24l3.99-3.14Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.79 0 3.41.62 4.68 1.82l3.51-3.51C18.07 1.19 15.3 0 12 0 7.24 0 3.05 2.8 1.01 6.85l3.99 3.14c.98-2.96 3.74-5.24 7-5.24Z"
            />
          </svg>
          <span>{cargandoGoogle ? 'Conectando con Google...' : 'Continuar con Google'}</span>
        </button>

        <p className="text-[10px] text-center text-slate-500 leading-relaxed pt-1">
          Al registrarte aceptás las condiciones de servicio. Renovación voluntaria de $16.400/mes tras los 10 días de prueba.
        </p>
      </div>

      {/* MODAL RECUPERAR CONTRASEÑA */}
      {mostrarRecuperar && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" /> Recuperar contraseña
            </h3>
            <p className="text-xs text-slate-400">
              Ingresá tu correo electrónico y te enviaremos el código para restablecerla.
            </p>

            {mensajeRecuperar && (
              <div
                className={`p-3 rounded-xl text-xs border ${
                  mensajeRecuperar.tipo === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {mensajeRecuperar.texto}
              </div>
            )}

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
                  Cerrar
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