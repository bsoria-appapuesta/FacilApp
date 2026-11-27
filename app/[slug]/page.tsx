'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Share2, 
  Calendar as CalendarIcon, 
  Plus, 
  MapPin, 
  ExternalLink, 
  ImageIcon, 
  X, 
  Copy, 
  Check, 
  Globe, 
  ChevronLeft, 
  ChevronRight, 
  Pencil 
} from 'lucide-react'

import { 
  FaWhatsapp, 
  FaInstagram, 
  FaTiktok, 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaYoutube 
} from 'react-icons/fa'

function formatearNumeroWhatsApp(telefono: string): string {
  let limpio = (telefono || '').replace(/\D/g, '')
  if (!limpio) return ''

  if (limpio.startsWith('0')) {
    limpio = limpio.substring(1)
  }

  if (limpio.length === 10) {
    return `549${limpio}`
  }

  if (limpio.length === 12 && limpio.startsWith('54') && !limpio.startsWith('549')) {
    return `549${limpio.substring(2)}`
  }

  return limpio
}

export default function PaginaNegocioDinamica() {
  const params = useParams()
  const slugParam = params?.slug as string

  const [negocio, setNegocio] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [servicioSel, setServicioSel] = useState<any>(null)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [suspendido, setSuspendido] = useState(false)
  const [esDuenio, setEsDuenio] = useState(false)
  
  const [seccionAbierta, setSeccionAbierta] = useState<'turnos' | null>(null)
  const [modalCompartir, setModalCompartir] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [fotoAmpliada, setFotoAmpliada] = useState<any | null>(null)
  
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
  const [campoTrampa, setCampoTrampa] = useState('')
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
      .select(`
        id, user_id, nombre, slug, ubicacion, descripcion, whatsapp, logo_url,
        hora_apertura, hora_cierre, intervalo_minutos,
        tipo_fuente, tamano_fuente, redes_sociales, estilo_redes, color_redes,
        color_principal, color_fondo, color_carta, color_texto,
        tipo_fondo, fondo_degradado, fondo_imagen_url, fondo_carta_url,
        bordes_redondeados, galeria_detallada, estado, fecha_vencimiento
      `)
      .eq('slug', slugParam)
      .maybeSingle()

    if (!negData || error) {
      setNoEncontrado(true)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.id === negData.user_id) {
      setEsDuenio(true)
    }

    const hoy = new Date()
    const fechaVenc = negData.fecha_vencimiento ? new Date(negData.fecha_vencimiento) : null
    const estadoLimpio = (negData.estado || '').toLowerCase()
    const estaBloqueadoManual = ['vencido', 'bloqueado', 'suspendido', 'inactivo'].includes(estadoLimpio)
    const estaVencidoPorFecha = estadoLimpio !== 'activo' && fechaVenc && hoy > fechaVenc

    if (estaBloqueadoManual || estaVencidoPorFecha) {
      setSuspendido(true)
    } else {
      setSuspendido(false)
    }

    setNegocio(negData)

    const apertura = negData.hora_apertura || '09:00'
    const cierre = negData.hora_cierre || '18:00'
    const intervalo = negData.intervalo_minutos || 30
    setHorariosDisponibles(generarHorarios(apertura, cierre, intervalo))

    const { data: servData } = await supabase
      .from('servicios')
      .select('id, nombre, precio, duracion_minutos')
      .eq('negocio_id', negData.id)
      .eq('activo', true)

    if (servData && servData.length > 0) {
      setServicios(servData)
      setServicioSel(servData[0])
    }
  }

  async function cargarTurnosOcupados(fechaSeleccionada: string) {
    setCargandoHorarios(true)
    const { data, error } = await supabase.rpc('obtener_horas_ocupadas', {
      p_negocio_id: negocio.id,
      p_fecha: fechaSeleccionada
    })

    if (!error && Array.isArray(data)) {
      setHorasOcupadas(data.map((item: any) => item.hora_ocupada))
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

  const handleCompartirNativo = async () => {
    const shareData = {
      title: negocio?.nombre || 'FacilApp',
      text: `Mirá el perfil de ${negocio?.nombre || 'este negocio'} y reservá tu turno online 👇`,
      url: window.location.href,
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // Usuario canceló
      }
    } else {
      setModalCompartir(true)
    }
  }

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const handleCompartirInstagram = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
    window.open('https://www.instagram.com/', '_blank')
  }

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault()

    // Si está suspendido, bloqueamos la reserva
    if (suspendido) return

    // 1. Trampa Honeypot: si el campo oculto tiene texto, es un bot
    if (campoTrampa) return

    // 2. Cooldown local breve (3 seg) para evitar doble clic accidental sin trabar turnos seguidos
    if (typeof window !== 'undefined' && negocio?.id) {
      const claveCooldown = `facilapp_ultima_reserva_${negocio.id}`
      const ultimaReserva = Number(localStorage.getItem(claveCooldown) || 0)
      const segundosTranscurridos = Math.floor((Date.now() - ultimaReserva) / 1000)
      if (ultimaReserva && segundosTranscurridos < 3) {
        alert(`Por favor aguardá ${3 - segundosTranscurridos} segundos antes de realizar otra reserva.`)
        return
      }
    }

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
    const fechaHora = `${fecha}T${hora}:00-03:00`

    const { error } = await supabase.from('turnos').insert([
      {
        negocio_id: negocio.id,
        servicio_id: servicioSel.id,
        cliente_nombre: nombre.trim(),
        cliente_whatsapp: whatsapp.trim(),
        fecha_hora: fechaHora,
        monto_cobrado: servicioSel.precio || 0,
        estado: 'pendiente'
      }
    ])

    setCargando(false)

    if (error) {
      if (error.code === '23505') {
        alert('¡Ups! Alguien acaba de reservar ese mismo horario hace un instante. Por favor elegí otro.')
        cargarTurnosOcupados(fecha)
      } else {
        alert('Error al guardar la reserva: ' + error.message)
      }
    } else {
      if (typeof window !== 'undefined' && negocio?.id) {
        localStorage.setItem(`facilapp_ultima_reserva_${negocio.id}`, String(Date.now()))
      }
      setExito(true)
      const celDestino = formatearNumeroWhatsApp(negocio.whatsapp || '')
      const msg = `¡Hola ${negocio.nombre}! 👋%0AMi nombre es *${nombre}*.%0A%0AQuiero reservar:%0A📌 *Servicio:* ${servicioSel.nombre}%0A📅 *Fecha:* ${fecha}%0A⏰ *Hora:* ${hora} hs%0A💰 *Precio:* $${servicioSel.precio}%0A%0A¿Me confirmás el turno?`
      setLinkWa(`https://wa.me/${celDestino}?text=${msg}`)
    }
  }

  const handleNuevoTurno = () => {
    setExito(false)
    setHora('')
    setLinkWa('')
    if (fecha && negocio) {
      cargarTurnosOcupados(fecha)
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
  const colorCarta = negocio?.color_carta || '#ffffff'
  const colorTexto = negocio?.color_texto || '#0f172a'
  const tipoFondo = negocio?.tipo_fondo || 'color'
  const fondoDegradado = negocio?.fondo_degradado || 'linear-gradient(to bottom, #1e293b, #0f172a)'
  const fondoImagenUrl = negocio?.fondo_imagen_url || ''
  const fondoCartaUrl = negocio?.fondo_carta_url || ''
  const bordes = negocio?.bordes_redondeados || 'rounded-3xl'

  const estiloRedes = negocio?.estilo_redes || 'tarjetas'
  const colorRedes = negocio?.color_redes || '#ffffff'

  const clasesTamanoFuente = {
    chico: 'text-xs',
    mediano: 'text-sm',
    grande: 'text-base'
  }[negocio?.tamano_fuente as 'chico' | 'mediano' | 'grande'] || 'text-sm'

  const tamanosInline = {
    chico: {
      titulo: '20px',
      subtitulo: '11px',
      botonTitulo: '12px',
      botonSubtitulo: '9px',
      catalogoHeader: '10px',
      catalogoItem: '10px',
    },
    mediano: {
      titulo: '26px',
      subtitulo: '13px',
      botonTitulo: '14px',
      botonSubtitulo: '11px',
      catalogoHeader: '11px',
      catalogoItem: '12px',
    },
    grande: {
      titulo: '34px',
      subtitulo: '16px',
      botonTitulo: '17px',
      botonSubtitulo: '13px',
      catalogoHeader: '13px',
      catalogoItem: '14px',
    },
  }[negocio?.tamano_fuente as 'chico' | 'mediano' | 'grande'] || {
    titulo: '26px',
    subtitulo: '13px',
    botonTitulo: '14px',
    botonSubtitulo: '11px',
    catalogoHeader: '11px',
    catalogoItem: '12px',
  }

  const getRedSocialIcon = (tipo: string, soloIcono = false) => {
    const claseIcono = soloIcono ? 'w-5 h-5' : 'w-5 h-5'
    switch (tipo.toLowerCase()) {
      case 'whatsapp': return <FaWhatsapp className={`${claseIcono} text-emerald-500`} />
      case 'instagram': return <FaInstagram className={`${claseIcono} text-pink-500`} />
      case 'tiktok': return <FaTiktok className={`${claseIcono} text-slate-900`} />
      case 'facebook': return <FaFacebook className={`${claseIcono} text-blue-600`} />
      case 'linkedin': return <FaLinkedin className={`${claseIcono} text-sky-600`} />
      case 'youtube': return <FaYoutube className={`${claseIcono} text-rose-600`} />
      default: return <Globe className={`${claseIcono} text-indigo-500`} />
    }
  }

  const redesList: any[] = Array.isArray(negocio?.redes_sociales) ? negocio.redes_sociales : []
  const galeriaLista = negocio?.galeria_detallada?.length > 0 ? negocio.galeria_detallada : []
  const urlActual = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div 
      className={`min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center relative transition-all duration-500 ${clasesTamanoFuente}`}
      style={{ 
        background: tipoFondo === 'degradado' 
          ? fondoDegradado 
          : tipoFondo === 'imagen' && fondoImagenUrl 
            ? `url(${fondoImagenUrl}) center/cover no-repeat fixed` 
            : colorFondo,
        fontFamily: `'${negocio?.tipo_fuente || 'Plus Jakarta Sans'}', sans-serif`
      }}
    >
      <link 
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Cinzel:wght@500;700;800&family=Dancing+Script:wght@600;700&family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&family=Oswald:wght@500;600;700&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" 
        rel="stylesheet" 
      />

      {tipoFondo === 'imagen' && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px] z-0"></div>
      )}

      {/* TARJETA PRINCIPAL */}
      <div 
        className={`max-w-md w-full backdrop-blur-xl p-6 sm:p-8 shadow-2xl border border-white/20 relative z-10 transition-all overflow-hidden ${bordes}`}
        style={{ 
          backgroundColor: colorCarta,
          backgroundImage: fondoCartaUrl ? `url(${fondoCartaUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: colorTexto
        }}
      >
        {fondoCartaUrl && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-0 pointer-events-none"></div>
        )}

        <div className="relative z-10">
          
          {/* BARRA SUPERIOR */}
          <div className="flex justify-between items-center mb-6">
            <div>
              {esDuenio && (
                <Link
                  href="/admin"
                  className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow border border-white/20 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Editar</span>
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={handleCompartirNativo}
              className="w-9 h-9 bg-black/10 hover:bg-black/20 rounded-2xl flex items-center justify-center transition shadow-sm border border-white/20 active:scale-95 shrink-0"
              style={{ color: colorTexto }}
              title="Compartir"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* PERFIL */}
          <div className="text-center mb-6 space-y-3">
            <div className="w-24 h-24 bg-slate-900 rounded-full mx-auto flex items-center justify-center text-white font-black text-3xl border-4 border-white shadow-xl overflow-hidden ring-4 ring-black/10">
              {negocio?.logo_url ? (
                <img src={negocio.logo_url} alt={negocio.nombre} className="w-full h-full object-cover" />
              ) : (
                negocio?.nombre?.charAt(0) || 'F'
              )}
            </div>

            <div>
              <h1
                className="font-extrabold tracking-tight leading-tight"
                style={{ color: colorTexto, fontSize: tamanosInline.titulo }}
              >
                {negocio ? negocio.nombre : 'Cargando...'}
              </h1>
              
              <p
                className="font-semibold mt-1 flex items-center justify-center gap-1 opacity-80"
                style={{ color: colorTexto, fontSize: tamanosInline.subtitulo }}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500 inline" />
                {negocio?.ubicacion || 'Buenos Aires, Argentina'}
              </p>

              {negocio?.descripcion && (
                <p
                  className="mt-2 px-4 leading-relaxed font-medium opacity-80"
                  style={{ color: colorTexto, fontSize: tamanosInline.subtitulo }}
                >
                  {negocio.descripcion}
                </p>
              )}
            </div>
          </div>

          {/* REDES SOCIALES */}
          <div className="mb-6">
            {estiloRedes === 'solo_iconos' ? (
              <div className="flex flex-wrap items-center justify-center gap-2.5 py-1">
                {redesList.map((red) => (
                  <a
                    key={red.id}
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundColor: colorRedes }}
                    className="w-12 h-12 rounded-2xl border border-black/10 flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all"
                    title={red.nombreRed || 'Red Social'}
                  >
                    {getRedSocialIcon(red.plataforma || 'web', true)}
                  </a>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {redesList.map((red) => (
                  <a
                    key={red.id}
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundColor: colorRedes }}
                    className={`w-full text-slate-900 border border-black/10 p-3.5 flex items-center justify-between shadow-sm transition-all active:scale-[0.99] hover:opacity-95 ${bordes}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        {getRedSocialIcon(red.plataforma || 'web')}
                      </div>
                      <div className="text-left overflow-hidden">
                        <span className="font-extrabold block leading-tight truncate">
                          {red.nombreRed || 'Red Social'}
                        </span>
                        <span className="text-xs text-slate-500 block truncate font-medium">
                          {red.usuarioODetalle}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                  </a>
                ))}
              </div>
            )}

            {suspendido ? (
              <div
                className={`w-full p-4 flex items-center justify-between bg-slate-900/80 border border-slate-700/60 text-slate-400 cursor-not-allowed mt-4 ${bordes}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span
                      className="font-extrabold block text-slate-300"
                      style={{ fontSize: tamanosInline.botonTitulo }}
                    >
                      Reservas online pausadas
                    </span>
                    <span
                      className="opacity-80 block text-slate-400"
                      style={{ fontSize: tamanosInline.botonSubtitulo }}
                    >
                      Contactate por nuestras redes sociales
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (seccionAbierta === 'turnos') {
                    setSeccionAbierta(null)
                  } else {
                    if (exito) handleNuevoTurno()
                    setSeccionAbierta('turnos')
                  }
                }}
                style={{ backgroundColor: colorPrincipal, color: '#ffffff' }}
                className={`w-full p-4 flex items-center justify-between shadow-lg transition-all active:scale-[0.99] mt-4 ${bordes}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span
                      className="font-extrabold block"
                      style={{ fontSize: tamanosInline.botonTitulo }}
                    >
                      Solicitar Turno / Pedido
                    </span>
                    <span
                      className="opacity-80 block"
                      style={{ fontSize: tamanosInline.botonSubtitulo }}
                    >
                      Consultá servicios y horarios disponibles
                    </span>
                  </div>
                </div>
                <Plus className={`w-5 h-5 transition-transform duration-300 ${seccionAbierta === 'turnos' ? 'rotate-45' : ''}`} />
              </button>
            )}
          </div>

          {/* FORMULARIO DE TURNOS */}
          {!suspendido && seccionAbierta === 'turnos' && (
            <div className="border-t border-black/10 pt-5 space-y-4 mb-6">
              {exito ? (
                <div className="text-center space-y-3 py-2">
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

                  <button
                    type="button"
                    onClick={handleNuevoTurno}
                    className={`w-full bg-slate-900/10 hover:bg-slate-900/20 font-bold py-3 px-4 transition text-xs ${bordes}`}
                    style={{ color: colorTexto }}
                  >
                    + Sacar otro turno
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReservar} className="space-y-4 text-slate-900">
                  
                  {/* CAMPO TRAMPA INVISIBLE PARA BOTS (HONEYPOT) */}
                  <input
                    type="text"
                    name="website_url"
                    value={campoTrampa}
                    onChange={(e) => setCampoTrampa(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                  />

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1 opacity-80" style={{ color: colorTexto }}>
1. Seleccioná el Servicio
                    </label>
                    <select
                      value={servicioSel?.id || ''}
                      onChange={(e) => {
                        const sel = servicios.find(s => s.id === e.target.value)
                        if (sel) setServicioSel(sel)
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 font-bold text-xs focus:outline-none"
                      required
                    >
                      {servicios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} - ${s.precio} ({s.duracion_minutos || 30} min)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1 opacity-80" style={{ color: colorTexto }}>
2. Tus Datos
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre y Apellido"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 mb-2 focus:outline-none text-xs"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Tu WhatsApp (ej. 1122334455)"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1 opacity-80" style={{ color: colorTexto }}>
3. Elegí Fecha en el Calendario
                    </label>

                    <div className="bg-white border border-slate-200 rounded-2xl p-3 mb-2 shadow-sm">
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
                                    : 'hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              {dia}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1 opacity-80" style={{ color: colorTexto }}>
                      Horarios Disponibles para {fecha}
                    </label>

                    {cargandoHorarios ? (
                      <p className="text-xs text-center py-3 opacity-80" style={{ color: colorTexto }}>Consultando horarios...</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-white border border-slate-200 rounded-xl">
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
                    style={{ backgroundColor: colorPrincipal, color: '#ffffff' }}
                    className={`w-full font-bold py-3.5 transition shadow-lg disabled:opacity-50 text-xs ${bordes}`}
                  >
                    {cargando ? 'Procesando...' : 'Confirmar Reserva ✨'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* CATÁLOGO VISUAL (CON AMPLIACIÓN AL TOCAR) */}
          {galeriaLista.length > 0 && (
            <div className="border-t border-black/10 pt-5 space-y-3">
              <p
                className="font-extrabold uppercase tracking-wider flex items-center gap-1.5 opacity-80"
                style={{ color: colorTexto, fontSize: tamanosInline.catalogoHeader }}
              >
                <ImageIcon className="w-3.5 h-3.5 opacity-70" />
                Catálogo de Servicios & Productos
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galeriaLista.map((item: any, i: number) => (
                  <div
                    key={i}
                    onClick={() => setFotoAmpliada(item)}
                    className="bg-white/90 rounded-2xl overflow-hidden border border-black/10 shadow-sm flex flex-col justify-between cursor-pointer group active:scale-95 transition-transform"
                  >
                    <div className="aspect-square bg-slate-200 overflow-hidden relative">
                      <img
                        src={item.imagen_url}
                        alt={item.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.precio && item.mostrar_precio !== false && (
                        <span className="absolute bottom-2 right-2 bg-slate-900/90 text-white font-black text-[10px] px-2 py-0.5 rounded-lg border border-white/20">
                          ${item.precio}
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <p
                        className="font-bold text-slate-800 line-clamp-1"
                        style={{ fontSize: tamanosInline.catalogoItem }}
                      >
                        {item.titulo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BANNER COMERCIAL / FOOTER */}
          <div className="mt-8 pt-5 border-t border-black/10 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow transition"
            >
              <span>Creá tu página con FacilApp</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

        </div>
      </div>

      {/* MODAL DE FOTO AMPLIADA DEL CATÁLOGO */}
      {fotoAmpliada && (
        <div
          onClick={() => setFotoAmpliada(null)}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-white/15 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setFotoAmpliada(null)}
              aria-label="Cerrar vista previa"
              className="absolute top-3 right-3 z-10 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm border border-white/15 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={fotoAmpliada.imagen_url}
                alt={fotoAmpliada.titulo}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>

            <div className="p-4 flex items-center justify-between gap-3 bg-slate-900">
              <p className="font-extrabold text-sm text-white">
                {fotoAmpliada.titulo}
              </p>
              {fotoAmpliada.precio && fotoAmpliada.mostrar_precio !== false && (
                <span className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-sm shrink-0">
                  ${fotoAmpliada.precio}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL COMPARTIR (Respaldo para PC) */}
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

              <button
                type="button"
                onClick={handleCompartirInstagram}
                className="p-3 bg-pink-50 text-pink-800 border border-pink-200 rounded-2xl flex items-center gap-2 font-bold text-xs hover:bg-pink-100 transition text-left"
              >
                <FaInstagram className="w-4 h-4 text-pink-600" />
                <span>Instagram</span>
              </button>

              <a
                href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlActual)}`}
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