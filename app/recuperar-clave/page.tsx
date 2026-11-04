'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

function FormularioRecuperar() {
  const router = useRouter()
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null)

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMensaje({
          tipo: 'exito',
          texto: 'Enlace verificado. Ingresá tu nueva contraseña.'
        })
      }
    })
  }, [])

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

  async function handleCambiarClave(e: React.FormEvent) {
    e.preventDefault()
    setMensaje(null)

    const errorClave = validarContrasena(nuevaPassword)
    if (errorClave) {
      setMensaje({ tipo: 'error', texto: errorClave })
      return
    }

    if (nuevaPassword !== confirmarPassword) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden.' })
      return
    }

    setCargando(true)

    const { error } = await supabase.auth.updateUser({
      password: nuevaPassword
    })

    setCargando(false)

    if (error) {
      setMensaje({ tipo: 'error', texto: error.message })
    } else {
      alert('¡Tu contraseña se actualizó correctamente! Ya podés iniciar sesión.')
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h1 className="text-xl font-black text-white text-center mb-1">Restablecer Contraseña</h1>
        <p className="text-xs text-slate-400 text-center mb-6">Ingresá tu nueva clave para actualizar el acceso.</p>

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

        <form onSubmit={handleCambiarClave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nueva Contraseña</label>
            <input
              type="password"
              required
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder="Mín. 8 caracteres, mayúscula y número"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Debe incluir mínimo 8 caracteres, una mayúscula, una minúscula y un número.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              required
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              placeholder="Repetí la contraseña"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg mt-2"
          >
            {cargando ? 'Guardando cambios...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function RecuperarClavePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-xs text-slate-500">Cargando...</p>
      </div>
    }>
      <FormularioRecuperar />
    </Suspense>
  )
}