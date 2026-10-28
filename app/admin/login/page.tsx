'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ArrowRight, ShieldCheck, UserPlus, KeyRound, CheckCircle2 } from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AuthPage() {
  const router = useRouter()
  const [modo, setModo] = useState<'login' | 'registro' | 'recuperar'>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensajeError, setMensajeError] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')

  const limpiarAvisos = () => {
    setMensajeError('')
    setMensajeExito('')
  }

  // 1. INICIAR SESIÓN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    limpiarAvisos()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setCargando(false)

    if (error) {
      setMensajeError(error.message === 'Invalid login credentials' 
        ? 'Correo o contraseña incorrectos.' 
        : error.message)
    } else if (data?.user) {
      router.push('/admin')
    }
  }

  // 2. CREAR CUENTA
  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    limpiarAvisos()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined
      }
    })

    setCargando(false)

    if (error) {
      setMensajeError(error.message)
    } else {
      // Si Supabase tiene auto-confirm activo, inicia sesión directo
      if (data.session) {
        router.push('/admin')
      } else {
        setMensajeExito('¡Cuenta creada! Te enviamos un email para confirmar tu cuenta.')
      }
    }
  }

  // 3. RECUPERAR CONTRASEÑA
  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    limpiarAvisos()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined,
    })

    setCargando(false)

    if (error) {
      setMensajeError(error.message)
    } else {
      setMensajeExito('Te enviamos un correo con las instrucciones para restablecer tu contraseña.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Encabezado dinámico */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            {modo === 'login' && <Lock className="w-6 h-6" />}
            {modo === 'registro' && <UserPlus className="w-6 h-6" />}
            {modo === 'recuperar' && <KeyRound className="w-6 h-6" />}
          </div>
          <h1 className="text-xl font-black text-white">
            {modo === 'login' && 'Iniciar Sesión'}
            {modo === 'registro' && 'Crear Cuenta Admin'}
            {modo === 'recuperar' && 'Recuperar Clave'}
          </h1>
          <p className="text-xs text-slate-400">
            {modo === 'login' && 'Ingresá a tu panel de control de FacilApp'}
            {modo === 'registro' && 'Comenzá a gestionar tus turnos hoy mismo'}
            {modo === 'recuperar' && 'Ingresá tu correo para recibir el enlace'}
          </p>
        </div>

        {/* Mensajes de feedback */}
        {mensajeError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl text-center">
            {mensajeError}
          </div>
        )}

        {mensajeExito && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* Formulario */}
        <form 
          onSubmit={
            modo === 'login' 
              ? handleLogin 
              : modo === 'registro' 
              ? handleRegistro 
              : handleRecuperar
          } 
          className="space-y-4"
        >
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

          {modo !== 'recuperar' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-bold text-slate-400">Contraseña</label>
                {modo === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      limpiarAvisos()
                      setModo('recuperar')
                    }}
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    ¿Olvidaste tu clave?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  minLength={6}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <span>
              {cargando 
                ? 'Procesando...' 
                : modo === 'login' 
                ? 'Ingresar al Panel' 
                : modo === 'registro' 
                ? 'Registrarme' 
                : 'Enviar enlace al correo'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Alternar modos */}
        <div className="pt-2 text-center border-t border-slate-800 space-y-2">
          {modo === 'login' ? (
            <p className="text-xs text-slate-400">
              ¿No tenés una cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  limpiarAvisos()
                  setModo('registro')
                }}
                className="text-indigo-400 font-bold hover:underline"
              >
                Registrate acá
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              ¿Ya tenés cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  limpiarAvisos()
                  setModo('login')
                }}
                className="text-indigo-400 font-bold hover:underline"
              >
                Iniciá sesión
              </button>
            </p>
          )}

          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Acceso seguro con Supabase Auth
          </p>
        </div>

      </div>
    </div>
  )
}