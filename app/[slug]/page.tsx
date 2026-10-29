'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'
import { 
  Share2, 
  Calendar as CalendarIcon, 
  Plus,
  MapPin, 
  ExternalLink, 
  ImageIcon, 
  Settings, 
  X, 
  Copy, 
  Check, 
  Globe,
  ChevronLeft,
  ChevronRight,
  Sparkles
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

export default function PaginaNegocioDinamica() {
  const params = useParams()
  const slugParam = params?.slug as string

  const [negocio, setNegocio] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [servicioSel, setServicioSel] = useState<any>(null)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [suspendido, setSuspendido] = useState(false)
  
  const [seccionAbierta, setSeccionAbierta] = useState<'turnos' | null>(null)
  const [modalCompartir, setModalCompartir] = useState(false)
  const [copiado, setCopiado] = useState(false)
  
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

  const [mesActual, setMesActual] = useState(new Date().getMonth())
  const [anioActual, setAnioActual] = useState(new Date().getFullYear())

  useEffect(() => {
    if (slugParam) {
      cargarPerfil()
    }
  }, [slugParam])

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
    const { data: negData, error } = await supabase
      .from('negocios')
      .select('*')
      .eq('slug', slugParam)
      .maybeSingle()

    if (!negData || error) {
      setNoEncontrado(true)
      return
    }

    // Chequeo de vencimiento (10 días)
    const hoy = new Date()
    const fechaVenc = negData.fecha_vencimiento ? new Date(negData.fecha_vencimiento) : null
    if (negData.estado !== 'activo' && fechaVenc && hoy > fechaVenc) {
      setSuspendido(true)
      return
    }

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
      const celDestino = (negocio.whatsapp || '').replace(/\D/g, '')
      const msg = `¡Hola ${negocio.nombre}! 👋%0AMi nombre es *${nombre}*.%0A%0AQuiero reservar:%0A📌 *Servicio:* ${servicioSel.nombre}%0A📅 *Fecha:* ${fecha}%0A⏰ *Hora:* ${hora} hs%0A💰 *Precio:* $${servicioSel.precio}%0A%0A¿Me confirmás el turno?`
      setLinkWa(`https://wa.me/${celDestino}?text=${msg}`)
    }
  }

  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const primerDiaMes = new Date(anioActual, mesActual, 1).getDay()
  const totalDiasMes = new Date(anioActual, mesActual + 1, 0).getDate()

  const cambiarMes = (direccion: number) => {
    let nuevoMes = mesActual + direccion
    let nuevoAnio = anioActual
    if (nuevoMes > 11) {
      nuevoMes = 0
      nuevoAnio++
    } else if (nuevoMes < 0) {
      nuevoMes = 11
      nuevoAnio--
    }
    setMesActual(nuevoMes)
    setAnioActual(nuevoAnio)
  }

  if (suspendido) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h1 className="text-2xl font-black text-white">Página temporalmente suspendida</h1>
        <p className="text-slate-400 text-xs max-w-sm">
          Este perfil no se encuentra disponible momentáneamente. Si sos el dueño, ingresá al panel de administración.
        </p>
        <a href="/login" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs">
          Acceso Administrador
        </a>
      </div>
    )
  }

  if (noEncontrado) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h1 className="text-3xl font-black text-white">Negocio no encontrado</h1>
        <p className="text-slate-400 text-xs">El enlace que ingresaste no corresponde a ninguna página activa.</p>
        <a href="/" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs">
          Ir a FacilApp
        </a>
      </div>
    )
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
        <div className="flex justify-end items-center mb-6">
          <button
            onClick={() => setModalCompartir(true)}
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl flex items-center justify-center transition shadow-sm border border-slate-200/50 active:scale-95 shrink-0"
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
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-extrabold block">Solicitar Turno / Pedido</span>
                <span className="text-[10px] text-white/80 block">Consultá servicios y horarios disponibles</span>
              </div>
            </div>
            <Plus className={`w-5 h-5 transition-transform duration-300 ${seccionAbierta === 'turnos' ? 'rotate-45' : ''}`} />
          </button>
        </div>

        {/* Formulario de Reserva con Calendario Mensual */}
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
                    El turno se guardó en el sistema. Tocá abajo para confirmar directamente por WhatsApp:
                  </p>
                </div>
                
                <a
                  href={linkWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 transition text-center shadow-lg shadow-emerald-500/25 ${bordes} flex items-center justify-center gap-2`}
                >
                  <FaWhatsapp className="w-5 h-5" /> Confirmar por WhatsApp
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

                {/* 3. CALENDARIO VISUAL INTERACTIVO */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    3. Elegí Fecha en el Calendario
                  </label>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-2 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-extrabold text-xs text-slate-800">
                        {nombresMeses[mesActual]} {anioActual}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => cambiarMes(-1)}
                          className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => cambiarMes(1)}
                          className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
                      <span>D</span><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {Array.from({ length: primerDiaMes }).map((_, i) => (
                        <div key={`empty-${i}`} className="p-1.5"></div>
                      ))}

                      {Array.from({ length: totalDiasMes }).map((_, i) => {
                        const dia = i + 1
                        const fechaStr = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
                        const esPasado = fechaStr < fechaHoy
                        const esSeleccionado = fecha === fechaStr

                        return (
                          <button
                            key={dia}
                            type="button"
                            disabled={esPasado}
                            onClick={() => {
                              setFecha(fechaStr)
                              setHora('')
                            }}
                            className={`p-1.5 text-xs font-bold rounded-xl transition ${
                              esPasado 
                                ? 'text-slate-300 line-through cursor-not-allowed'
                                : esSeleccionado 
                                  ? 'bg-rose-500 text-white shadow' 
                                  : 'hover:bg-white text-slate-700'
                            }`}
                          >
                            {dia}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 4. SELECTOR DE HORARIOS */}
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Horarios Disponibles para {fecha}
                  </label>

                  {cargandoHorarios ? (
                    <p className="text-xs text-slate-400 text-center py-3">Consultando horarios...</p>
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

        {/* Banner Comercial / Footer */}
        <div className="mt-8 pt-5 border-t border-slate-200/70 text-center space-y-2">
          <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            ¿Querés tu propio sistema de turnos?
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow transition"
          >
            <span>Creá tu página con FacilApp</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>

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