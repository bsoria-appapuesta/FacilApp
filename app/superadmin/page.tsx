'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { 
  ShieldCheck, 
  Calendar, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  ExternalLink,
  RefreshCw,
  LogOut,
  Sliders,
  DollarSign
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TU EMAIL COMO SUPERADMIN
const SUPERADMIN_EMAIL = 'braiandsoria@gmail.com'

export default function SuperAdminPage() {
  const router = useRouter()
  const [cargando, setCargando] = useState(true)
  const [procesandoAccion, setProcesandoAccion] = useState(false)
  const [esAutorizado, setEsAutorizado] = useState(false)
  const [negocios, setNegocios] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'prueba' | 'vencidos'>('todos')

  useEffect(() => {
    verificarAdmin()
  }, [])

  async function verificarAdmin() {
    setCargando(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    if (user.email !== SUPERADMIN_EMAIL) {
      alert('Acceso restringido: No tenés permisos de Superadmin.')
      router.push('/admin')
      return
    }

    setEsAutorizado(true)
    await cargarNegocios()
    setCargando(false)
  }

  async function cargarNegocios() {
    const { data: listaNegocios, error } = await supabase
      .from('negocios')
      .select('*, turnos:turnos(count)')
      .order('created_at', { ascending: false })

    if (error) {
      alert('Error cargando negocios: ' + error.message)
    } else if (listaNegocios) {
      setNegocios(listaNegocios)
    }
  }

  async function handleExtender30Dias(negocio: any) {
    if (!confirm(`¿Confirmás el pago y la extensión de 30 días para "${negocio.nombre}"?`)) return

    setProcesandoAccion(true)

    const fechaBase = negocio.fecha_vencimiento && new Date(negocio.fecha_vencimiento) > new Date()
      ? new Date(negocio.fecha_vencimiento)
      : new Date()

    const nuevaFechaVencimiento = new Date(fechaBase.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const { error } = await supabase
      .from('negocios')
      .update({
        estado: 'activo',
        fecha_vencimiento: nuevaFechaVencimiento
      })
      .eq('id', negocio.id)

    setProcesandoAccion(false)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      await cargarNegocios()
      alert(`¡Suscripción extendida para ${negocio.nombre} hasta el ${new Date(nuevaFechaVencimiento).toLocaleDateString()}!`)
    }
  }

  async function handleSuspender(negocioId: string) {
    if (!confirm('¿Seguro que querés suspender este negocio? Su panel quedará bloqueado hasta nuevo pago.')) return

    setProcesandoAccion(true)
    const { error } = await supabase
      .from('negocios')
      .update({ estado: 'suspendido' })
      .eq('id', negocioId)

    setProcesandoAccion(false)

    if (!error) {
      await cargarNegocios()
    }
  }

  async function handleCerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-xs text-slate-500 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" /> Verificando permisos de Superadmin...
        </p>
      </div>
    )
  }

  if (!esAutorizado) return null

  const hoy = new Date()

  const negociosConDias = negocios.map(n => {
    const fVenc = n.fecha_vencimiento ? new Date(n.fecha_vencimiento) : null
    const diffDias = fVenc ? Math.ceil((fVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)) : 0
    const esVencido = (n.estado !== 'activo' && fVenc && hoy > fVenc) || n.estado === 'suspendido'
    return {
      ...n,
      diasRestantes: diffDias,
      estaVencido: esVencido,
      totalTurnos: n.turnos?.[0]?.count || 0
    }
  })

  const negociosFiltrados = negociosConDias.filter(n => {
    const coincideTexto = n.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
                          n.slug?.toLowerCase().includes(busqueda.toLowerCase()) ||
                          n.id?.toLowerCase().includes(busqueda.toLowerCase())

    if (!coincideTexto) return false

    if (filtroEstado === 'activos') return n.estado === 'activo' && !n.estaVencido
    if (filtroEstado === 'prueba') return n.estado === 'prueba' && !n.estaVencido
    if (filtroEstado === 'vencidos') return n.estaVencido
    return true
  })

  const totalActivos = negociosConDias.filter(n => n.estado === 'activo' && !n.estaVencido).length
  const totalPrueba = negociosConDias.filter(n => n.estado === 'prueba' && !n.estaVencido).length
  const totalVencidos = negociosConDias.filter(n => n.estaVencido).length
  const ingresoMensualEstimado = totalActivos * 13800

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ENCABEZADO */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex justify-between items-center flex-wrap gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Panel Maestro • FacilApp</h1>
              <p className="text-xs text-slate-400">Sesión iniciada como: {SUPERADMIN_EMAIL}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cargarNegocios}
              disabled={procesandoAccion}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Refrescar lista"
            >
              <RefreshCw className={`w-4 h-4 ${procesandoAccion ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCerrarSesion}
              className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Negocios</span>
            <p className="text-2xl font-black text-white">{negocios.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Suscripciones Pagas</span>
            <p className="text-2xl font-black text-emerald-400">{totalActivos}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">En Prueba Gratuita</span>
            <p className="text-2xl font-black text-amber-400">{totalPrueba}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> MRR Estimado
            </span>
            <p className="text-2xl font-black text-indigo-400">${ingresoMensualEstimado.toLocaleString()}</p>
          </div>
        </div>

        {/* BÚSQUEDA Y FILTROS */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre, slug o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${filtroEstado === 'todos' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Todos ({negocios.length})
            </button>
            <button
              onClick={() => setFiltroEstado('activos')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${filtroEstado === 'activos' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Pagos ({totalActivos})
            </button>
            <button
              onClick={() => setFiltroEstado('prueba')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${filtroEstado === 'prueba' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Prueba ({totalPrueba})
            </button>
            <button
              onClick={() => setFiltroEstado('vencidos')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${filtroEstado === 'vencidos' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Vencidos ({totalVencidos})
            </button>
          </div>
        </div>

        {/* TABLA DE NEGOCIOS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="p-4">Negocio / Slug</th>
                  <th className="p-4">Creado</th>
                  <th className="p-4">Estado Suscripción</th>
                  <th className="p-4">Vencimiento</th>
                  <th className="p-4 text-center">Turnos</th>
                  <th className="p-4 text-right">Acciones de Cobro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {negociosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No se encontraron negocios con esos filtros.
                    </td>
                  </tr>
                ) : (
                  negociosFiltrados.map((neg) => {
                    const fechaCreacion = neg.created_at ? new Date(neg.created_at).toLocaleDateString() : '-'
                    const fechaVencTxt = neg.fecha_vencimiento ? new Date(neg.fecha_vencimiento).toLocaleDateString() : 'Sin definir'
                    const whatsAppLimpio = neg.whatsapp?.replace(/\D/g, '')

                    return (
                      <tr key={neg.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shrink-0">
                              {neg.nombre?.charAt(0) || 'L'}
                            </div>
                            <div className="truncate">
                              <p className="font-bold text-white text-sm truncate">{neg.nombre}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>/{neg.slug}</span>
                                <a 
                                  href={`/${neg.slug}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                                >
                                  Ver <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-slate-400 whitespace-nowrap">
                          {fechaCreacion}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          {neg.estaVencido ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              <XCircle className="w-3 h-3" /> Vencido / Bloqueado
                            </span>
                          ) : neg.estado === 'activo' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Suscripción Activa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              <Clock className="w-3 h-3" /> Prueba ({neg.diasRestantes}d)
                            </span>
                          )}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <p className="font-bold text-slate-200">{fechaVencTxt}</p>
                          <p className="text-[10px] text-slate-500">
                            {neg.diasRestantes > 0 ? `${neg.diasRestantes} días restantes` : 'Expiró'}
                          </p>
                        </td>

                        <td className="p-4 text-center whitespace-nowrap">
                          <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg font-bold text-slate-300">
                            {neg.totalTurnos}
                          </span>
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {whatsAppLimpio && (
                              <a
                                href={`https://wa.me/${whatsAppLimpio}?text=${encodeURIComponent(`¡Hola ${neg.nombre}! Confirmamos la renovación de tu suscripción en FacilApp por 30 días más. ¡Gracias por confiar en nosotros!`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl border border-emerald-500/30 transition"
                                title="Avisar por WhatsApp"
                              >
                                <FaWhatsapp className="w-4 h-4" />
                              </a>
                            )}

                            <button
                              onClick={() => handleExtender30Dias(neg)}
                              disabled={procesandoAccion}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition text-[11px] shadow flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> +30 Días (Pagó)
                            </button>

                            {!neg.estaVencido && (
                              <button
                                onClick={() => handleSuspender(neg.id)}
                                disabled={procesandoAccion}
                                className="p-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 rounded-xl border border-rose-500/20 transition"
                                title="Suspender acceso"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}