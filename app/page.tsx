'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Share2, 
  Calendar, 
  Plus,
  MapPin, 
  ExternalLink, 
  ImageIcon, 
  Settings, 
  X, 
  Copy, 
  Check, 
  Globe
} from 'lucide-react'

import { 
  FaWhatsapp, 
  FaInstagram, 
  FaTiktok, 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaYoutube, 
  FaEnvelope 
} from 'react-icons/fa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Home() {
  const [negocio, setNegocio] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [servicioSel, setServicioSel] = useState<any>(null)
  
  const [seccionAbierta, setSeccionAbierta] = useState<'turnos' | null>(null)
  const [modalCompartir, setModalCompartir] = useState(false)
  const [copiado, setCopiado] = useState(false)
  
  // Cálculo de fecha local precisa para evitar el desfasaje de UTC
  const obtenerFechaLocal = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const fechaHoy = obtenerFechaLocal()

  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [fecha, setFecha] = useState(fechaHoy)
  const [hora, setHora] = useState('')
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([])
  const [cargandoHorarios, setCargandoHorarios] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)
  const [linkWa, setLinkWa] = useState('')

  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([])

  useEffect(() => {
    cargarPerfil()
  }, [])

  useEffect(() => {
    if (fecha && negocio) {
      cargarTurnosOcupados(fecha)
    }
  }, [fecha, negocio])

  function generarHorarios(desde: string, hasta: string, paso: number): string[] {
    const lista: string[] = []
    const [hInicio, mInicio] = desde.split(':').map(Number)
    const [hFin, mFin] = hasta.split(':').map(Number)

    let actualMin = hInicio * 60 + mInicio
    const limiteMin = hFin * 60 + mFin

    while (actualMin <= limiteMin) {
      const h = Math.floor(actualMin / 60)
      const m = actualMin % 60
      lista.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      actualMin += paso
    }
    return lista
  }

  async function cargarPerfil() {
    const { data: negData } = await supabase
      .from('negocios')
      .select('*')
      .limit(1)
      .single()

    if (negData) {
      setNegocio(negData)

      const apertura = negData.hora_apertura || '09:00'
      const cierre = negData.hora_cierre || '18:00'
      const intervalo = negData.intervalo_minutos || 30
      setHorariosDisponibles(generarHorarios(apertura, cierre, intervalo))

      const { data: servData } = await supabase
        .from('servicios')
        .select('*')
        .eq('negocio_id', negData.id)
        .eq('activo', true)

      if (servData && servData.length > 0) {
        setServicios(servData)
        setServicioSel(servData[0])
      }
    }
  }

  async function cargarTurnosOcupados(fechaSeleccionada: string) {
    setCargandoHorarios(true)
    const inicioDia = `${fechaSeleccionada}T00:00:00`
    const finDia = `${fechaSeleccionada}T23:59:59`

    const { data: turnosData } = await supabase
      .from('turnos')
      .select('fecha_hora')
      .eq('negocio_id', negocio.id)
      .gte('fecha_hora', inicioDia)
      .lte('fecha_hora', finDia)
      .in('estado', ['pendiente', 'confirmado'])

    if (turnosData) {
      const horasReservadas = turnosData.map((t: any) => {
        const date = new Date(t.fecha_hora)
        const hh = String(date.getHours()).padStart(2, '0')
        const mm = String(date.getMinutes()).padStart(2, '0')
        return `${hh}:${mm}`
      })
      setHorasOcupadas(horasReservadas)
    } else {
      setHorasOcupadas([])
    }
    setCargandoHorarios(false)
  }

  // Comprueba si el horario ya pasó con respecto a la hora local
  const esHoraPasada = (horario: string) => {
    if (fecha !== fechaHoy) return false
    const ahora = new Date()
    const [h, m] = horario.split(':').map(Number)
    const horaTurno = new Date()
    horaTurno.setHours(h, m, 0, 0)
    return ahora.getTime() > horaTurno.getTime()
  }

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || !whatsapp || !fecha || !hora || !servicioSel) {
      alert('Por favor completá todos los campos, incluyendo el horario.')
      return
    }

    if (fecha < fechaHoy) {
      alert('No podés seleccionar una fecha anterior a la de hoy.')
      return
    }

    if (esHoraPasada(hora)) {
      alert('El horario seleccionado ya transcurrió. Por favor elegí otro.')
      return
    }

    if (horasOcupadas.includes(hora)) {
      alert('Ese horario ya fue reservado. Por favor elegí otro.')
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
        monto_cobrado: servicioSel.precio || 0,
        estado: 'pendiente'
      }
    ])

    setCargando(false)

    if (error) {
      alert('Error al guardar la reserva: ' + error.message)
    } else {
      setExito(true)
      const textoSena = servicioSel.requiere_seña 
        ? `%0A⚠️ *Reserva / Seña requerida:* $${servicioSel.monto_seña}` 
        : ''

      const msg = `¡Hola ${negocio.nombre}! 👋%0AMi nombre es *${nombre}*.%0A%0AQuiero reservar:%0A📌 *Servicio:* ${servicioSel.nombre}%0A📅 *Fecha:* ${fecha}%0A⏰ *Hora:* ${hora} hs%0A💰 *Precio:* $${servicioSel.precio}${textoSena}%0A%0A¿Me confirmás el turno?`
      setLinkWa(`https://wa.me/${negocio.whatsapp}?text=${msg}`)
    }
  }

  const colorPrincipal = negocio?.color_principal || '#6366f1'
  const colorFondo = negocio?.color_fondo || '#0f172a'
  const tipoFondo = negocio?.tipo_fondo || 'color'
  const fondoDegradado = negocio?.fondo_degradado || 'linear-gradient(to bottom, #1e293b, #0f172a)'
  const fondoImagenUrl = negocio?.fondo_imagen_url || ''
  const bordes = negocio?.bordes_redondeados || 'rounded-3xl'

  const getRedSocialIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'whatsapp': return <FaWhatsapp className="w-5 h-5 text-emerald-500" />
      case 'instagram': return <FaInstagram className="w-5 h-5 text-pink-500" />
      case 'tiktok': return <FaTiktok className="w-5 h-5 text-slate-900" />
      case 'facebook': return <FaFacebook className="w-5 h-5 text-blue-600" />
      case 'linkedin': return <FaLinkedin className="w-5 h-5 text-sky-600" />
      case 'youtube': return <FaYoutube className="w-5 h-5 text-rose-600" />
      default: return <Globe className="w-5 h-5 text-indigo-500" />
    }
  }

  const redesList: any[] = Array.isArray(negocio?.redes_sociales) ? negocio.redes_sociales : []
  const galeriaLista = negocio?.galeria_detallada?.length > 0 ? negocio.galeria_detallada : []
  const urlActual = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center relative transition-all duration-500 text-sm"
      style={{ 
        background: tipoFondo === 'degradado' 
          ? fondoDegradado 
          : tipoFondo === 'imagen' && fondoImagenUrl 
            ? `url(${fondoImagenUrl}) center/cover no-repeat fixed` 
            : colorFondo,
        fontFamily: negocio?.tipo_fuente || "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {tipoFondo === 'imagen' && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px] z-0"></div>
      )}

      <div 
        className={`max-w-md w-full backdrop-blur-xl p-6 sm:p-8 shadow-2xl border border-white/40 relative z-10 transition-all ${bordes}`}
        style={{ backgroundColor: negocio?.color_carta || 'rgba(255, 255, 255, 0.95)' }}
      >
        
        {/* Barra Superior */}
        <div className="flex justify-between items-center mb-6">
          <a
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition border border-slate-200/60 shadow-sm text-xs"
            title="Edición de página"
          >
            <Settings className="w-3.5 h-3.5 text-rose-500" />
            <span>Edición de página</span>
          </a>

          <button
            onClick={() => setModalCompartir(true)}
            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl flex items-center justify-center transition shadow-sm border border-slate-200/50 active:scale-95"
            title="Compartir"
          >
            <Share2 className="w-4 h-4" />
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
              {negocio?.ubicacion || 'Buenos Aires, Argentina'}
            </p>

            {negocio?.descripcion && (
              <p className="text-xs text-slate-600 mt-2 px-4 leading-relaxed font-medium">
                {negocio.descripcion}
              </p>
            )}
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="space-y-3 mb-6">
          {redesList.map((red) => (
            <a
              key={red.id}
              href={red.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full bg-white hover:bg-slate-50/80 border border-slate-200/80 p-3.5 flex items-center justify-between shadow-sm transition-all active:scale-[0.99] ${bordes}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {getRedSocialIcon(red.plataforma || 'web')}
                </div>
                <div className="text-left overflow-hidden">
                  <span className="font-extrabold text-slate-900 block leading-tight truncate">
                    {red.nombreRed || 'Red Social'}
                  </span>
                  <span className="text-xs text-slate-500 block truncate font-medium">
                    {red.usuarioODetalle}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 shrink-0" />
            </a>
          ))}

          {/* Botón Colapsable para Turnos */}
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
                <span className="font-extrabold block">Solicitar Turno / Pedido</span>
                <span className="text-[10px] text-white/80 block">Consultá servicios y horarios disponibles</span>
              </div>
            </div>
            <Plus className={`w-5 h-5 transition-transform duration-300 ${seccionAbierta === 'turnos' ? 'rotate-45' : ''}`} />
          </button>
        </div>

        {/* Formulario de Reserva */}
        {seccionAbierta === 'turnos' && (
          <div className="border-t border-slate-100 pt-5 space-y-4 mb-6">
            {exito ? (
              <div className="text-center space-y-4 py-2">
                <div className="bg-emerald-50 text-emerald-900 p-5 rounded-2xl border border-emerald-200 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold shadow-md">
                    ✓
                  </div>
                  <p className="font-bold text-base">¡Reserva Enviada!</p>
                  <p className="text-xs text-slate-600 mt-1">
                    El turno se guardó en el sistema. Confirmalo por WhatsApp:
                  </p>
                </div>
                
                <a
                  href={linkWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 transition text-center shadow-lg shadow-emerald-500/25 ${bordes}`}
                >
                  📲 Confirmar por WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={handleReservar} className="space-y-4">
                
                {/* 1. SELECTOR DE SERVICIOS */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    1. Seleccioná el Servicio
                  </label>
                  <select
                    value={servicioSel?.id || ''}
                    onChange={(e) => {
                      const sel = servicios.find(s => s.id === e.target.value)
                      if (sel) setServicioSel(sel)
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-bold text-xs focus:outline-none"
                    required
                  >
                    {servicios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} - ${s.precio} ({s.duracion_minutos || 30} min)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. DATOS */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    2. Tus Datos
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre y Apellido"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 mb-2 focus:outline-none text-xs"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Tu WhatsApp (ej. 1122334455)"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none text-xs"
                    required
                  />
                </div>

                {/* 3. FECHA Y HORARIOS CALCULADOS DINÁMICAMENTE */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    3. Fecha y Horario
                  </label>
                  <input
                    type="date"
                    min={fechaHoy}
                    value={fecha}
                    onChange={(e) => {
                      setFecha(e.target.value)
                      setHora('')
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 mb-2 focus:outline-none text-xs"
                    required
                  />

                  {cargandoHorarios ? (
                    <p className="text-xs text-slate-400 text-center py-3">Consultando disponibilidad...</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
                      {horariosDisponibles.map((h) => {
                        const estaOcupado = horasOcupadas.includes(h)
                        const paso = esHoraPasada(h)
                        const deshabilitado = estaOcupado || paso
                        const esSeleccionado = hora === h

                        return (
                          <button
                            key={h}
                            type="button"
                            disabled={deshabilitado}
                            onClick={() => setHora(h)}
                            className={`py-2 text-[11px] font-bold rounded-lg transition ${
                              deshabilitado
                                ? 'bg-slate-200 text-slate-400 line-through cursor-not-allowed border border-slate-300'
                                : esSeleccionado
                                ? 'bg-rose-500 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {h}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  style={{ backgroundColor: colorPrincipal }}
                  className={`w-full text-white font-bold py-3.5 transition shadow-lg disabled:opacity-50 text-xs ${bordes}`}
                >
                  {cargando ? 'Procesando...' : 'Confirmar Reserva ✨'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Catálogo Visual de Galería */}
        {galeriaLista.length > 0 && (
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              Catálogo de Servicios & Productos
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galeriaLista.map((item: any, i: number) => (
                <div key={i} className="bg-slate-50/80 rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm flex flex-col justify-between">
                  <div className="aspect-square bg-slate-200 overflow-hidden relative">
                    <img src={item.imagen_url} alt={item.titulo} className="w-full h-full object-cover" />
                    {item.precio && (
                      <span className="absolute bottom-2 right-2 bg-slate-900/90 text-white font-black text-[10px] px-2 py-0.5 rounded-lg border border-white/20">
                        ${item.precio}
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="font-bold text-slate-800 text-[11px] line-clamp-1">{item.titulo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal Compartir */}
      {modalCompartir && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-slate-100 relative space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Compartir Perfil</h3>
              <button
                onClick={() => setModalCompartir(false)}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">Seleccioná la plataforma para compartir tu enlace:</p>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`https://api.whatsapp.com/send?text=Mirá%20mi%20perfil%20oficial:%20${encodeURIComponent(urlActual)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-2 font-bold text-xs hover:bg-emerald-100 transition"
              >
                <FaWhatsapp className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlActual)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-2xl flex items-center gap-2 font-bold text-xs hover:bg-blue-100 transition"
              >
                <FaFacebook className="w-4 h-4 text-blue-600" />
                <span>Facebook</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(urlActual)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl flex items-center gap-2 font-bold text-xs hover:bg-slate-200 transition"
              >
                <FaTwitter className="w-4 h-4 text-sky-500" />
                <span>X / Twitter</span>
              </a>

              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=&su=Perfil%20Oficial&body=Te%20comparto%20mi%20perfil%20oficial:%20${encodeURIComponent(urlActual)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl flex items-center gap-2 font-bold text-xs hover:bg-rose-100 transition"
              >
                <FaEnvelope className="w-4 h-4 text-rose-600" />
                <span>Gmail</span>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlActual)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-sky-50 text-sky-800 border border-sky-200 rounded-2xl flex items-center gap-2 font-bold text-xs hover:bg-sky-100 transition col-span-2"
              >
                <FaLinkedin className="w-4 h-4 text-sky-700" />
                <span>LinkedIn</span>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleCopiarLink}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 active:scale-95 transition"
              >
                {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiado ? '¡Copiado al Portapapeles!' : 'Copiar Enlace Directo'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}