'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Share2, 
  MessageCircle, 
  Music2, 
  Globe, 
  ShoppingBag, 
  Calendar, 
  Sparkles, 
  Plus, 
  MapPin,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const HORARIOS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
]

export default function Home() {
  const [negocio, setNegocio] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [servicioSel, setServicioSel] = useState<any>(null)
  
  // Estados de interacción
  const [seccionAbierta, setSeccionAbierta] = useState<'turnos' | 'galeria' | null>('turnos')
  const [copiado, setCopiado] = useState(false)
  
  // Formulario de Reserva
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('10:00')
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)
  const [linkWa, setLinkWa] = useState('')

  useEffect(() => {
    cargarPerfil()
  }, [])

  async function cargarPerfil() {
    const { data: negData } = await supabase
      .from('negocios')
      .select('*')
      .limit(1)
      .single()

    if (negData) {
      setNegocio(negData)
      const { data: servData } = await supabase
        .from('servicios')
        .select('*')
        .eq('negocio_id', negData.id)

      if (servData && servData.length > 0) {
        setServicios(servData)
        setServicioSel(servData[0])
      }
    }
  }

  // Compartir Nativo (WhatsApp, Historias, etc.)
  const handleCompartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: negocio?.nombre || 'Perfil Oficial',
          text: `Mirá el perfil de ${negocio?.nombre || 'este negocio'}:`,
          url: window.location.href,
        })
      } catch (err) {
        console.log(err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || !whatsapp || !fecha || !hora || !servicioSel) {
      alert('Por favor completá todos los campos')
      return
    }

    setCargando(true)
    const fechaHora = new Date(`${fecha}T${hora}:00`).toISOString()

    const { error } = await supabase.from('turnos').insert([
      {
        negocio_id: negocio.id,
        servicio_id: servicioSel.id,
        cliente_nombre: nombre,
        cliente_whatsapp: whatsapp,
        fecha_hora: fechaHora,
        estado: 'pendiente'
      }
    ])

    setCargando(false)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setExito(true)
      const msg = `¡Hola ${negocio.nombre}! 👋%0AMi nombre es *${nombre}*.%0A%0AQuiero solicitar un turno:%0A📌 *Servicio:* ${servicioSel.nombre}%0A📅 *Fecha:* ${fecha}%0A⏰ *Hora:* ${hora} hs%0A💰 *Precio:* $${servicioSel.precio}%0A%0A¿Me confirmás?`
      setLinkWa(`https://wa.me/${negocio.whatsapp}?text=${msg}`)
    }
  }

  // Mapeo dinámico de íconos vectoriales HD
  const renderIconoRed = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'instagram': 
        return (
          <svg className="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
          </svg>
        )
      case 'whatsapp': return <MessageCircle className="w-5 h-5 text-emerald-500" />
      case 'tiktok': return <Music2 className="w-5 h-5 text-slate-900" />
      case 'web': return <Globe className="w-5 h-5 text-blue-500" />
      default: return <ExternalLink className="w-5 h-5 text-indigo-500" />
    }
  }

  const colorPrincipal = negocio?.color_principal || '#6366f1'
  const colorFondo = negocio?.color_fondo || '#0f172a'
  const tipoFondo = negocio?.tipo_fondo || 'degradado'
  const fondoDegradado = negocio?.fondo_degradado || 'linear-gradient(to bottom, #1e293b, #0f172a)'
  const fondoImagenUrl = negocio?.fondo_imagen_url || ''
  const bordes = negocio?.bordes_redondeados || 'rounded-3xl'

  // Redes sociales por defecto si la BD aún no tiene cargadas
  const redesList = negocio?.redes_sociales?.length > 0 
    ? negocio.redes_sociales 
    : [
        { tipo: 'whatsapp', titulo: 'WhatsApp Directo', url: `https://wa.me/${negocio?.whatsapp || ''}` },
        { tipo: 'instagram', titulo: 'Instagram Oficial', url: `https://instagram.com/${negocio?.instagram_username || ''}` },
        { tipo: 'tiktok', titulo: 'Canal de TikTok', url: `https://tiktok.com/@${negocio?.tiktok_username || ''}` }
      ]

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center relative transition-all duration-500 selection:bg-rose-500 selection:text-white"
      style={{ 
        background: tipoFondo === 'degradado' 
          ? fondoDegradado 
          : tipoFondo === 'imagen' && fondoImagenUrl 
            ? `url(${fondoImagenUrl}) center/cover no-repeat fixed` 
            : colorFondo,
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Cargar fuente Ultra HD */}
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {tipoFondo === 'imagen' && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px] z-0"></div>
      )}

      {/* Contenedor Principal tipo Tarjeta Linktree Pro */}
      <div className={`max-w-md w-full bg-white/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl border border-white/40 relative z-10 transition-all ${bordes}`}>
        
        {/* Cabecera Superior: Icono Mágico + Botón Compartir Nativo */}
        <div className="flex justify-between items-center mb-6">
          <div className="w-10 h-10 bg-slate-100/80 rounded-2xl flex items-center justify-center text-slate-700 shadow-sm border border-slate-200/50">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>

          <button
            onClick={handleCompartir}
            className="w-10 h-10 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 rounded-2xl flex items-center justify-center transition shadow-sm border border-slate-200/50 active:scale-95 relative"
            title="Compartir Perfil"
          >
            <Share2 className="w-4 h-4" />
            {copiado && (
              <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap shadow-xl">
                ¡Link copiado!
              </span>
            )}
          </button>
        </div>

        {/* Perfil del Negocio */}
        <div className="text-center mb-6 space-y-3">
          <div className="w-24 h-24 bg-slate-900 rounded-full mx-auto flex items-center justify-center text-white font-black text-3xl border-4 border-white shadow-xl overflow-hidden ring-4 ring-slate-100/50">
            {negocio?.logo_url ? (
              <img src={negocio.logo_url} alt={negocio.nombre} className="w-full h-full object-cover" />
            ) : (
              negocio?.nombre?.charAt(0) || 'F'
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {negocio ? negocio.nombre : 'Cargando...'}
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 inline" />
              {negocio?.ubicacion || 'Buenos Aires'}
            </p>
            {negocio?.descripcion_corta && (
              <p className="text-xs text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
                {negocio.descripcion_corta}
              </p>
            )}
          </div>
        </div>

        {/* MÓDULO ABIERTO: LISTA DINÁMICA DE REDES SOCIALES */}
        <div className="space-y-3 mb-6">
          {redesList.map((red: any, idx: number) => (
            <a
              key={idx}
              href={red.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full bg-white hover:bg-slate-50/80 border border-slate-200/80 p-3.5 flex items-center justify-between shadow-sm transition-all active:scale-[0.99] ${bordes}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
                  {renderIconoRed(red.tipo)}
                </div>
                <span className="font-bold text-slate-800 text-sm">{red.titulo}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300" />
            </a>
          ))}

          {/* BOTÓN ABIERTO 1: SOLICITAR TURNO / CATÁLOGO DE PRODUCTOS */}
          <button
            onClick={() => setSeccionAbierta(seccionAbierta === 'turnos' ? null : 'turnos')}
            style={{ backgroundColor: colorPrincipal }}
            className={`w-full text-white p-4 flex items-center justify-between shadow-lg transition-all active:scale-[0.99] mt-4 ${bordes}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-sm block">Reservar Turno / Pedido</span>
                <span className="text-[10px] text-white/80 block">Elegí fecha y horario disponible</span>
              </div>
            </div>
            <Plus className={`w-5 h-5 transition-transform duration-300 ${seccionAbierta === 'turnos' ? 'rotate-45' : ''}`} />
          </button>
        </div>

        {/* SECCIÓN DESPLEGABLE DE RESERVAS / SERVICIOS */}
        {seccionAbierta === 'turnos' && (
          <div className="border-t border-slate-100 pt-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {exito ? (
              <div className="text-center space-y-4 py-2">
                <div className="bg-emerald-50 text-emerald-900 p-5 rounded-2xl border border-emerald-200 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold shadow-md">
                    ✓
                  </div>
                  <p className="font-bold text-base">¡Solicitud Registrada!</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Para confirmar el turno, enviá la notificación automática por WhatsApp:
                  </p>
                </div>
                
                <a
                  href={linkWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 transition text-center shadow-lg shadow-emerald-500/25 text-sm ${bordes}`}
                >
                  📲 Finalizar por WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={handleReservar} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    1. Seleccioná el Servicio / Producto
                  </label>
                  <div className="space-y-2">
                    {servicios.map((s) => {
                      const esSel = servicioSel?.id === s.id
                      return (
                        <div
                          key={s.id}
                          onClick={() => setServicioSel(s)}
                          className={`p-3 rounded-2xl border-2 transition cursor-pointer flex justify-between items-center ${
                            esSel ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100 bg-slate-50/50'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs text-slate-800">{s.nombre}</p>
                            <p className="text-[10px] text-slate-400">{s.duracion_minutos} min de sesión</p>
                          </div>
                          <span className="font-black text-rose-600 text-xs bg-rose-100/80 px-2.5 py-1 rounded-xl">
                            ${s.precio}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    2. Tus Datos
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre y Apellido"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 mb-2 focus:outline-none focus:border-rose-500"
                  />
                  <input
                    type="tel"
                    placeholder="Tu WhatsApp (ej. 1122334455)"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    3. Fecha y Horario
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 mb-2 focus:outline-none"
                  />

                  <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    {HORARIOS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHora(h)}
                        className={`py-2 text-[11px] font-bold rounded-lg transition ${
                          hora === h
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  style={{ backgroundColor: colorPrincipal }}
                  className={`w-full text-white font-bold py-3.5 transition shadow-lg text-xs disabled:opacity-50 ${bordes}`}
                >
                  {cargando ? 'Procesando...' : 'Confirmar Reserva ✨'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* GALERÍA DE FOTOS REALES Y CATÁLOGO VISUAL */}
        <div className="border-t border-slate-100 pt-5 space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              Trabajos & Galería Visual
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {negocio?.fotos_galeria?.length > 0 ? (
              negocio.fotos_galeria.map((imgUrl: string, i: number) => (
                <div key={i} className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm">
                  <img src={imgUrl} alt={`Trabajo ${i}`} className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              [1, 2, 3].map((_, i) => (
                <div key={i} className="aspect-square bg-slate-100/80 rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-300 font-bold text-xs">
                  Foto {i + 1}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}