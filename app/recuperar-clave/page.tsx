'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RecuperarClavePage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenListo, setTokenListo] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // 1. Escuchar el evento oficial de recuperación de Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session) {
          setTokenListo(true)
          setError(null)
        }
      }
    )

    // 2. Verificar si ya existe una sesión activa por el token
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setTokenListo(true)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMensaje(null)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setMensaje('Contraseña actualizada con éxito. Redirigiendo...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-center">Nueva contraseña</h2>
        <p className="text-sm text-center text-gray-400">
          Ingresá tu nueva clave para acceder a tu cuenta.
        </p>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-950/50 rounded-lg border border-red-800">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="p-3 text-sm text-green-400 bg-green-950/50 rounded-lg border border-green-800">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Cambiar contraseña y entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}