'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  BarChart3, 
  Palette, 
  Calendar, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Clock, 
  DollarSign,
  Briefcase,
  Sliders,
  CheckCircle,
  XCircle,
  LogOut
} from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AdminDashboardPage() {
  const [seccion, setSeccion] = useState<'metricas' | 'editor' | 'servicios'>('metricas')
  const [periodoMétricas, setPeriodoMétricas] = useState<'hoy' | 'semana' | 'mes' | 'historico'>('semana')
  
  const [negocio, setNegocio] = useState<any>(null)
  const [turnos, setTurnos] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  // Formulario nuevo servicio
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoPrecio, setNuevoPrecio] = useState('')
  const [nuevaDuracion, setNuevaDuracion] = useState('30')

  // Editor Visual
  const [colorPrincipal, setColorPrincipal] = useState('#e11d48')
  const [colorFondo, setColorFondo] = useState('#fff1f2')
  const [tipoFondo, setTipoFondo] = useState('color')
  const [fondoDegradado, setFondoDegradado] = useState('linear-gradient(to bottom, #fff1f2, #ffe4e6)')
  const [tipoFuente, setTipoFuente] = useState('Poppins')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    const { data: negData } = await supabase
      .from('negocios')
      .select('*')
      .limit(1)
      .single()

    if (negData) {
      setNegocio(negData)
      setColorPrincipal(negData.color_principal || '#e11d48')
      setColorFondo(negData.color_fondo || '#fff1f2')
      setTipoFondo(negData.tipo_fondo || 'color')
      setFondoDegradado(negData.fondo_degradado || 'linear-gradient(to bottom, #fff1f2, #ffe4e6)')

      // Cargar Servicios
      const { data: servData } = await supabase
        .from('servicios')
        .select('*')
        .eq('negocio_id', negData.id)
      if (servData) setServicios(servData)

      // Cargar Turnos
      const { data: turnosData } = await supabase
        .from('turnos')
        .select('*, servicios(nombre, precio)')
        .eq('negocio_id', negData.id)
        .order('created_at', { ascending: false })
      if (turnosData) setTurnos(turnosData)
    }
    setCargando(false)
  }

  // Crear nuevo servicio/producto
  const handleAgregarServicio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoNombre || !nuevoPrecio) return

    const { error } = await supabase.from('servicios').insert([
      {
        negocio_id: negocio.id,
        nombre: nuevoNombre,
        precio: parseFloat(nuevoPrecio),
        duracion_minutos: parseInt(nuevaDuracion),
        activo: true
      }
    ])

    if (!error) {
      setNuevoNombre('')
      setNuevoPrecio('')
      cargarDatos()
    }
  }

  // Eliminar servicio
  const handleEliminarServicio = async (id: string) => {
    await supabase.from('servicios').delete().eq('id', id)
    cargarDatos()
  }

  // Guardar Editor Visual
  const handleGuardarEstilos = async () => {
    setGuardando(true)
    await supabase
      .from('negocios')
      .update({
        color_principal: colorPrincipal,
        color_fondo: colorFondo,
        tipo_fondo: tipoFondo,
        fondo_degradado: fondoDegradado,
      })
      .eq('id', negocio.id)
    setGuardando(false)
    alert('¡Marca actualizada con éxito!')
  }

  // Filtro de turnos por período
  const turnosFiltrados = turnos.filter(t => {
    const fechaTurno = new Date(t.created_at)
    const ahora = new Date()
    if (periodoMétricas === 'hoy') {
      return fechaTurno.toDateString() === ahora.toDateString()
    }
    if (periodoMétricas === 'semana') {
      const hace7Dias = new Date(ahora.setDate(ahora.getDate() - 7))
      return fechaTurno >= hace7Dias
    }
    if (periodoMétricas === 'mes') {
      return fechaTurno.getMonth() === ahora.getMonth() && fechaTurno.getFullYear() === ahora.getFullYear()
    }
    return true
  })

  const facturacionTotal = turnosFiltrados.reduce((acc, curr) => acc + (curr.monto_cobrado || curr.servicios?.precio || 0), 0)

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        <p className="text-sm font-bold animate-pulse">Cargando Panel FacilApp...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-rose-500 selection:text-white">
      
      {/* SIDEBAR LATERAL PROFESIONAL */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800/80 p-5 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-rose-500/20">
              F
            </div>
            <div>
              <p className="font-extrabold text-sm text-white tracking-tight">{negocio?.nombre || 'Mi Comercio'}</p>
              <p className="text-[10px] text-slate-400">Panel Administrador</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setSeccion('metricas')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                seccion === 'metricas' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Rendimiento & Turnos</span>
            </button>

            <button
              onClick={() => setSeccion('servicios')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                seccion === 'servicios' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Gestor de Servicios</span>
            </button>

            <button
              onClick={() => setSeccion('editor')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                seccion === 'editor' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Personalizar Web</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 border border-slate-700/60 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Mi Web en Vivo</span>
          </a>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        
        {seccion === 'metricas' && (
          <div className="space-y-6">
            
            {/* Header + Filtro de Tiempo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
              <div>
                <h2 className="text-xl font-extrabold text-white">Reporte de Facturación</h2>
                <p className="text-xs text-slate-400 mt-0.5">Control de ingresos y volumen de turnos</p>
              </div>

              <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                {(['hoy', 'semana', 'mes', 'historico'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodoMétricas(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                      periodoMétricas === p ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Métrica Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facturación ({periodoMétricas})</p>
                <p className="text-3xl font-black text-emerald-400 mt-2">${facturacionTotal.toLocaleString('es-AR')}</p>
                <p className="text-[11px] text-slate-500 mt-1">Suma de reservas e ingresos</p>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Turnos Totales</p>
                <p className="text-3xl font-black text-rose-400 mt-2">{turnosFiltrados.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">En el rango seleccionado</p>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Servicios Activos</p>
                <p className="text-3xl font-black text-indigo-400 mt-2">{servicios.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">Disponibles en tu web</p>
              </div>
            </div>

            {/* Lista de Reservas */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Listado de Turnos Registrados</h3>

              {turnosFiltrados.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">No hay reservas registradas en este período.</p>
              ) : (
                <div className="space-y-2.5">
                  {turnosFiltrados.map((t) => (
                    <div key={t.id} className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white text-sm">{t.cliente_nombre}</p>
                        <p className="text-slate-400">📲 {t.cliente_whatsapp} | 💅 {t.servicios?.nombre || 'Servicio'}</p>
                      </div>
                      <span className="font-black text-emerald-400 text-sm">${t.servicios?.precio || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {seccion === 'servicios' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white">Cargar Nuevo Servicio o Producto</h2>
              
              <form onSubmit={handleAgregarServicio} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Nombre del Servicio (ej. Kapping Gel)"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none col-span-2"
                />
                <input
                  type="number"
                  placeholder="Precio ($ ARS)"
                  value={nuevoPrecio}
                  onChange={(e) => setNuevoPrecio(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </form>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-300">Servicios Activos en el Sistema</h3>

              <div className="space-y-2">
                {servicios.map((s) => (
                  <div key={s.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white text-sm">{s.nombre}</p>
                      <p className="text-slate-400">{s.duracion_minutos} minutos de sesión</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-emerald-400 text-sm">${s.precio}</span>
                      <button
                        onClick={() => handleEliminarServicio(s.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {seccion === 'editor' && (
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-6 max-w-xl">
            <h2 className="text-lg font-bold text-white">Personalización de Marca</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Color Principal de Botones</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorPrincipal}
                    onChange={(e) => setColorPrincipal(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer p-1"
                  />
                  <span className="font-mono text-xs text-slate-300">{colorPrincipal}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Color de Fondo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorFondo}
                    onChange={(e) => setColorFondo(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer p-1"
                  />
                  <span className="font-mono text-xs text-slate-300">{colorFondo}</span>
                </div>
              </div>

              <button
                onClick={handleGuardarEstilos}
                disabled={guardando}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-lg shadow-rose-500/20 disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Publicar Cambios 🚀'}
              </button>
            </div>
          </div>
        )}

      </main>

    </div>
  )
}