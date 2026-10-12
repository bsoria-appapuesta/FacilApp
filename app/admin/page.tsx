'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<'metricas' | 'editor'>('metricas')
  const [negocio, setNegocio] = useState<any>(null)
  const [turnos, setTurnos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  // Estado para el Editor Visual
  const [colorPrincipal, setColorPrincipal] = useState('#e11d48')
  const [colorFondo, setColorFondo] = useState('#fff1f2')
  const [tipoFuente, setTipoFuente] = useState('Sans-Serif')
  const [guardandoEstilos, setGuardandoEstilos] = useState(false)

  useEffect(() => {
    cargarDatosAdmin()
  }, [])

  async function cargarDatosAdmin() {
    setCargando(true)
    
    // 1. Cargar datos del negocio
    const { data: negData } = await supabase
      .from('negocios')
      .select('*')
      .eq('slug', 'barberia-demo')
      .single()

    if (negData) {
      setNegocio(negData)
      setColorPrincipal(negData.color_principal || '#e11d48')
      setColorFondo(negData.color_fondo || '#fff1f2')
      setTipoFuente(negData.tipo_fuente || 'Sans-Serif')

      // 2. Cargar turnos de este negocio
      const { data: turnosData } = await supabase
        .from('turnos')
        .select('*, servicios(nombre, precio)')
        .eq('negocio_id', negData.id)
        .order('created_at', { ascending: false })

      if (turnosData) {
        setTurnos(turnosData)
      }
    }
    setCargando(false)
  }

  // Guardar personalización visual en Supabase
  const guardarPersonalizacion = async () => {
    if (!negocio) return
    setGuardandoEstilos(true)

    const { error } = await supabase
      .from('negocios')
      .update({
        color_principal: colorPrincipal,
        color_fondo: colorFondo,
        tipo_fuente: tipoFuente,
      })
      .eq('id', negocio.id)

    setGuardandoEstilos(false)

    if (error) {
      alert('Error al guardar estilos: ' + error.message)
    } else {
      alert('¡Estilos visuales actualizados con éxito! Revisá /barberia-demo para ver los cambios.')
    }
  }

  // Cambiar estado de turno (Atendido / Cancelado)
  const cambiarEstadoTurno = async (turnoId: string, nuevoEstado: string, precioServicio: number) => {
    const { error } = await supabase
      .from('turnos')
      .update({ 
        estado: nuevoEstado,
        atendido: nuevoEstado === 'confirmado',
        monto_cobrado: nuevoEstado === 'confirmado' ? precioServicio : 0
      })
      .eq('id', turnoId)

    if (!error) {
      cargarDatosAdmin()
    }
  }

  // Cálculos de métricas en tiempo real
  const totalFacturacion = turnos
    .filter(t => t.estado === 'confirmado' || t.atendido)
    .reduce((acc, curr) => acc + (curr.servicios?.precio || 0), 0)

  const totalTurnos = turnos.length
  const turnosConfirmados = turnos.filter(t => t.estado === 'confirmado').length

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-lg font-medium animate-pulse">Cargando Panel de Control...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabecera Admin */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {negocio?.nombre || 'Mi Comercio'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Panel de Control & Editor de Marca</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setTab('metricas')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                tab === 'metricas' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              📊 Rendimiento & Agenda
            </button>
            <button
              onClick={() => setTab('editor')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                tab === 'editor' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              🎨 Personalizar Web
            </button>
          </div>
        </div>

        {tab === 'metricas' ? (
          <div className="space-y-6">
            
            {/* Tarjetas de Métricas en Tiempo Real */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facturación Estimada</p>
                <p className="text-3xl font-black text-emerald-400 mt-2">${totalFacturacion.toLocaleString('es-AR')}</p>
                <p className="text-[11px] text-slate-500 mt-1">Suma de turnos completados</p>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reservas Totales</p>
                <p className="text-3xl font-black text-rose-400 mt-2">{totalTurnos}</p>
                <p className="text-[11px] text-slate-500 mt-1">Turnos recibidos desde la web</p>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Turnos Confirmados</p>
                <p className="text-3xl font-black text-indigo-400 mt-2">{turnosConfirmados}</p>
                <p className="text-[11px] text-slate-500 mt-1">Efectividad del negocio</p>
              </div>
            </div>

            {/* Listado de Turnos / Agenda */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
              <h2 className="text-lg font-bold mb-4 text-white">Agenda de Reservas</h2>

              {turnos.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">Aún no hay turnos registrados en la base de datos.</p>
              ) : (
                <div className="space-y-3">
                  {turnos.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-base">{t.cliente_nombre}</p>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            t.estado === 'confirmado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            t.estado === 'cancelado' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {t.estado}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          📲 {t.cliente_whatsapp} | 💅 {t.servicios?.nombre || 'Servicio'} (${t.servicios?.precio})
                        </p>
                        <p className="text-xs text-rose-400 font-semibold mt-0.5">
                          📅 {new Date(t.fecha_hora).toLocaleDateString('es-AR')} - ⏰ {new Date(t.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                        </p>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => cambiarEstadoTurno(t.id, 'confirmado', t.servicios?.precio || 0)}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/30 transition"
                        >
                          Confirmar / Atendido
                        </button>
                        <button
                          onClick={() => cambiarEstadoTurno(t.id, 'cancelado', 0)}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/30 transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Editor Visual de Marca */
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Editor Visual de tu Sitio Web</h2>
              <p className="text-xs text-slate-400 mt-0.5">Personalizá la estética de tu perfil sin escribir una sola línea de código.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Opciones de Personalización */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">COLOR PRINCIPAL (Botones y destacados)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={colorPrincipal}
                      onChange={(e) => setColorPrincipal(e.target.value)}
                      className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer p-1"
                    />
                    <span className="font-mono text-sm text-slate-300">{colorPrincipal}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">COLOR DE FONDO DE PÁGINA</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={colorFondo}
                      onChange={(e) => setColorFondo(e.target.value)}
                      className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer p-1"
                    />
                    <span className="font-mono text-sm text-slate-300">{colorFondo}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">TIPO DE FUENTE</label>
                  <select
                    value={tipoFuente}
                    onChange={(e) => setTipoFuente(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none"
                  >
                    <option value="Sans-Serif">Moderna / Limpia (Sans-Serif)</option>
                    <option value="Serif">Elegante / Clásica (Serif)</option>
                    <option value="Monospace">Urbana / Minimalista (Monospace)</option>
                  </select>
                </div>

                <button
                  onClick={guardarPersonalizacion}
                  disabled={guardandoEstilos}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-rose-500/20 text-sm mt-4 disabled:opacity-50"
                >
                  {guardandoEstilos ? 'Guardando Cambios...' : 'Guardar y Publicar Estilo 🚀'}
                </button>
              </div>

              {/* Vista Previa Interactiva */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Vista Previa de Tu Página</p>
                
                <div 
                  className="w-full max-w-xs p-5 rounded-3xl border shadow-xl transition-all"
                  style={{ backgroundColor: colorFondo, fontFamily: tipoFuente }}
                >
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl bg-white shadow-sm">
                    💅
                  </div>
                  <h3 className="text-center font-bold text-slate-900 text-base">{negocio?.nombre || 'Demo'}</h3>
                  <p className="text-center text-xs text-slate-500 mb-4">Estética Studio</p>

                  <div className="bg-white/80 p-3 rounded-xl mb-3 border border-slate-200/50">
                    <p className="text-xs font-bold text-slate-800">Kapping Gel</p>
                    <p className="text-[10px] text-slate-500">$15.000</p>
                  </div>

                  <button
                    style={{ backgroundColor: colorPrincipal }}
                    className="w-full text-white text-xs font-bold py-2.5 rounded-xl shadow-md text-center"
                  >
                    Confirmar Reserva ✨
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}