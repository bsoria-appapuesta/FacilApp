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

  // Estado para el Editor Visual Avanzado
  const [colorPrincipal, setColorPrincipal] = useState('#e11d48')
  const [colorFondo, setColorFondo] = useState('#fff1f2')
  const [tipoFondo, setTipoFondo] = useState('color') // 'color', 'degradado', 'imagen'
  const [fondoDegradado, setFondoDegradado] = useState('linear-gradient(to bottom, #fff1f2, #ffe4e6)')
  const [fondoImagenUrl, setFondoImagenUrl] = useState('')
  const [tipoFuente, setTipoFuente] = useState('Poppins')
  const [tamanoTitulo, setTamanoTitulo] = useState('text-2xl')
  const [bordesRedondeados, setBordesRedondeados] = useState('rounded-2xl')
  const [instagram, setInstagram] = useState('')
  const [bannerPromo, setBannerPromo] = useState('')
  const [guardandoEstilos, setGuardandoEstilos] = useState(false)

  useEffect(() => {
    cargarDatosAdmin()
  }, [])

  async function cargarDatosAdmin() {
    setCargando(true)
    
    const { data: negData } = await supabase
      .from('negocios')
      .select('*')
      .eq('slug', 'barberia-demo')
      .single()

    if (negData) {
      setNegocio(negData)
      setColorPrincipal(negData.color_principal || '#e11d48')
      setColorFondo(negData.color_fondo || '#fff1f2')
      setTipoFondo(negData.tipo_fondo || 'color')
      setFondoDegradado(negData.fondo_degradado || 'linear-gradient(to bottom, #fff1f2, #ffe4e6)')
      setFondoImagenUrl(negData.fondo_imagen_url || '')
      setTipoFuente(negData.tipo_fuente || 'Poppins')
      setTamanoTitulo(negData.tamano_titulo || 'text-2xl')
      setBordesRedondeados(negData.bordes_redondeados || 'rounded-2xl')
      setInstagram(negData.instagram_username || '')
      setBannerPromo(negData.banner_promo || '')

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

  const guardarPersonalizacion = async () => {
    if (!negocio) return
    setGuardandoEstilos(true)

    const { error } = await supabase
      .from('negocios')
      .update({
        color_principal: colorPrincipal,
        color_fondo: colorFondo,
        tipo_fondo: tipoFondo,
        fondo_degradado: fondoDegradado,
        fondo_imagen_url: fondoImagenUrl,
        tipo_fuente: tipoFuente,
        tamano_titulo: tamanoTitulo,
        bordes_redondeados: bordesRedondeados,
        instagram_username: instagram,
        banner_promo: bannerPromo,
      })
      .eq('id', negocio.id)

    setGuardandoEstilos(false)

    if (error) {
      alert('Error al guardar estilos: ' + error.message)
    } else {
      alert('¡Estilos de marca actualizados con éxito! Revisa /barberia-demo.')
    }
  }

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

  const totalFacturacion = turnos
    .filter(t => t.estado === 'confirmado' || t.atendido)
    .reduce((acc, curr) => acc + (curr.servicios?.precio || 0), 0)

  const totalTurnos = turnos.length
  const turnosConfirmados = turnos.filter(t => t.estado === 'confirmado').length

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-lg font-medium animate-pulse">Cargando Panel Admin...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {negocio?.nombre || 'Mi Comercio'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Panel de Control & Constructor de Marca Pro</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setTab('metricas')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                tab === 'metricas' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              📊 Métricas & Agenda
            </button>
            <button
              onClick={() => setTab('editor')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                tab === 'editor' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              🎨 Personalizar Marca Pro
            </button>
          </div>
        </div>

        {tab === 'metricas' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facturación Estimada</p>
                <p className="text-3xl font-black text-emerald-400 mt-2">${totalFacturacion.toLocaleString('es-AR')}</p>
                <p className="text-[11px] text-slate-500 mt-1">Turnos atendidos/confirmados</p>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reservas Totales</p>
                <p className="text-3xl font-black text-rose-400 mt-2">{totalTurnos}</p>
                <p className="text-[11px] text-slate-500 mt-1">Recibidas desde la web</p>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Turnos Confirmados</p>
                <p className="text-3xl font-black text-indigo-400 mt-2">{turnosConfirmados}</p>
                <p className="text-[11px] text-slate-500 mt-1">Efectividad del local</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
              <h2 className="text-lg font-bold mb-4 text-white">Agenda de Reservas</h2>
              {turnos.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">Aún no hay turnos en la base de datos.</p>
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
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => cambiarEstadoTurno(t.id, 'confirmado', t.servicios?.precio || 0)}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/30 hover:bg-emerald-600/30 transition"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => cambiarEstadoTurno(t.id, 'cancelado', 0)}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-rose-600/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/30 hover:bg-rose-600/30 transition"
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
          /* EDITOR VISUAL AVANZADO ESTILO LINKTREE PRO */
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Constructor de Marca Pro</h2>
              <p className="text-xs text-slate-400 mt-0.5">Diseñá la presencia visual de tu negocio como en Linktree o Canva.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Formulario de Controles */}
              <div className="space-y-5">
                
                {/* 1. TIPOGRAFÍA Y TAMAÑOS */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">1. Tipografía & Tamaños</p>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Fuente Principal</label>
                    <select
                      value={tipoFuente}
                      onChange={(e) => setTipoFuente(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Poppins">Poppins (Moderna & Cuidada)</option>
                      <option value="Montserrat">Montserrat (Urbana / Barberías / Marcas)</option>
                      <option value="Playfair Display">Playfair Display (Elegante & Lujo / Estética)</option>
                      <option value="Inter">Inter (Limpia & Minimalista)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Tamaño del Título</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Normal', value: 'text-xl' },
                        { label: 'Grande', value: 'text-2xl' },
                        { label: 'Extra', value: 'text-3xl' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setTamanoTitulo(item.value)}
                          className={`py-2 text-xs font-bold rounded-xl border transition ${
                            tamanoTitulo === item.value
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. ESTILO DE FONDO */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">2. Fondo de la Página</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Color Plano', value: 'color' },
                      { label: 'Degradado', value: 'degradado' },
                      { label: 'Foto / Imagen', value: 'imagen' },
                    ].map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setTipoFondo(f.value)}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${
                          tipoFondo === f.value
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {tipoFondo === 'color' && (
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        value={colorFondo}
                        onChange={(e) => setColorFondo(e.target.value)}
                        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer p-1"
                      />
                      <span className="font-mono text-xs text-slate-300">{colorFondo}</span>
                    </div>
                  )}

                  {tipoFondo === 'degradado' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Estilo de Degradado</label>
                      <select
                        value={fondoDegradado}
                        onChange={(e) => setFondoDegradado(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="linear-gradient(to bottom, #fff1f2, #ffe4e6)">Rosa Soft (Estética)</option>
                        <option value="linear-gradient(to bottom, #0f172a, #1e293b)">Noche Mística (Barbería Dark)</option>
                        <option value="linear-gradient(to bottom, #fefce8, #fef9c3)">Calidez Dorada</option>
                        <option value="linear-gradient(to bottom, #f0fdf4, #dcfce7)">Menta Menta Refresh</option>
                      </select>
                    </div>
                  )}

                  {tipoFondo === 'imagen' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">URL de la Imagen de Fondo</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={fondoImagenUrl}
                        onChange={(e) => setFondoImagenUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* 3. COLORES Y FORMA DE TARJETAS */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">3. Botones y Destacados</p>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={colorPrincipal}
                      onChange={(e) => setColorPrincipal(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer p-1"
                    />
                    <div>
                      <span className="font-mono text-xs text-slate-300 block">{colorPrincipal}</span>
                      <span className="text-[10px] text-slate-500">Color principal de marca</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Forma de las Tarjetas</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Suave', value: 'rounded-xl' },
                        { label: 'Redondeado', value: 'rounded-3xl' },
                        { label: 'Cápsula', value: 'rounded-full' },
                      ].map((b) => (
                        <button
                          key={b.value}
                          type="button"
                          onClick={() => setBordesRedondeados(b.value)}
                          className={`py-2 text-xs font-bold rounded-xl border transition ${
                            bordesRedondeados === b.value
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. REDES Y BANNER PROMO */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">4. Extras de Marca (Linktree Style)</p>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Instagram (@usuario)</label>
                    <input
                      type="text"
                      placeholder="ej. tuinmueble_estetica"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Banner Promocional Superior</label>
                    <input
                      type="text"
                      placeholder="ej. 🔥 10% OFF reservando esta semana"
                      value={bannerPromo}
                      onChange={(e) => setBannerPromo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={guardarPersonalizacion}
                  disabled={guardandoEstilos}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-rose-500/20 text-sm mt-2 disabled:opacity-50"
                >
                  {guardandoEstilos ? 'Guardando Estilos...' : 'Publicar Marca Pro 🚀'}
                </button>
              </div>

              {/* Vista Previa Interactiva */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-start sticky top-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Vista Previa Móvil</p>
                
                <div 
                  className={`w-full max-w-xs p-5 shadow-2xl border transition-all overflow-hidden relative ${bordesRedondeados}`}
                  style={{ 
                    background: tipoFondo === 'degradado' 
                      ? fondoDegradado 
                      : tipoFondo === 'imagen' && fondoImagenUrl 
                        ? `url(${fondoImagenUrl}) center/cover no-repeat` 
                        : colorFondo,
                    fontFamily: tipoFuente 
                  }}
                >
                  {/* Overlay para legibilidad si hay foto de fondo */}
                  {tipoFondo === 'imagen' && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] -z-0"></div>
                  )}

                  <div className="relative z-10 space-y-3">
                    {bannerPromo && (
                      <div className="bg-slate-900/90 text-white text-[10px] font-bold py-1 px-3 rounded-full text-center border border-slate-700/50">
                        {bannerPromo}
                      </div>
                    )}

                    <div className="text-center">
                      <div className="w-14 h-14 bg-white/90 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl shadow-sm border border-slate-200">
                        💅
                      </div>
                      <h3 className={`font-black tracking-tight ${tamanoTitulo} ${tipoFondo === 'degradado' && fondoDegradado.includes('#0f172a') ? 'text-white' : 'text-slate-900'}`}>
                        {negocio?.nombre || 'Demo Studio'}
                      </h3>
                      {instagram && (
                        <p className="text-[11px] font-semibold text-rose-500 mt-0.5">@{instagram}</p>
                      )}
                    </div>

                    <div className={`p-3 bg-white/90 backdrop-blur-sm border border-slate-100 flex justify-between items-center ${bordesRedondeados}`}>
                      <div>
                        <p className="font-bold text-xs text-slate-800">Kapping Gel</p>
                        <p className="text-[10px] text-slate-400">60 min</p>
                      </div>
                      <span 
                        className="font-black text-xs px-2.5 py-1 rounded-lg"
                        style={{ color: colorPrincipal, backgroundColor: `${colorPrincipal}15` }}
                      >
                        $15.000
                      </span>
                    </div>

                    <button
                      style={{ backgroundColor: colorPrincipal }}
                      className={`w-full text-white text-xs font-bold py-3 shadow-md text-center ${bordesRedondeados}`}
                    >
                      Reservar Turno ✨
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}