'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Settings, 
  Clock, 
  Plus, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  Share2, 
  Pencil, 
  X, 
  ExternalLink, 
  Globe, 
  UserPlus, 
  Scissors, 
  Palette, 
  BarChart3, 
  CalendarCheck2, 
  Check, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Camera,
  LogOut,
  Link as LinkIcon,
  AlertTriangle,
  Lock
} from 'lucide-react'

import { 
  FaWhatsapp, 
  FaInstagram, 
  FaTiktok, 
  FaFacebook, 
  FaLinkedin, 
  FaYoutube 
} from 'react-icons/fa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Poné acá tu número de WhatsApp para recibir los pagos
const NUMERO_WHATSAPP_SOPORTE = '5491150189781'

interface RedItem {
  id: string
  plataforma: 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'youtube' | 'web'
  nombreRed: string
  usuarioODetalle: string
  url: string
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'turnos' | 'servicios' | 'horarios_catalogo' | 'marca' | 'historial'>('turnos')
  const [negocio, setNegocio] = useState<any>(null)
  const [turnos, setTurnos] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)
  const [bloqueadoPorVencimiento, setBloqueadoPorVencimiento] = useState(false)
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null)

  // Configuración de Horarios
  const [horaApertura, setHoraApertura] = useState('09:00')
  const [horaCierre, setHoraCierre] = useState('18:00')
  const [intervaloMinutos, setIntervaloMinutos] = useState(30)

  const obtenerFechaLocal = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const fechaHoy = obtenerFechaLocal()

  // Calendario Semanal / Diario de Turnos
  const [fechaTurnosFiltro, setFechaTurnosFiltro] = useState(fechaHoy)
  const [offsetDiasSemana, setOffsetDiasSemana] = useState(0)

  const seleccionarFechaEspecifica = (fechaStr: string) => {
    if (!fechaStr) return
    setFechaTurnosFiltro(fechaStr)
    const [y, m, d] = fechaStr.split('-').map(Number)
    const fechaElegida = new Date(y, m - 1, d)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    fechaElegida.setHours(0, 0, 0, 0)

    const diffTiempo = fechaElegida.getTime() - hoy.getTime()
    const diffDias = Math.round(diffTiempo / (1000 * 60 * 60 * 24))
    setOffsetDiasSemana(diffDias)
  }

  // Modales
  const [mostrarModalManual, setMostrarModalManual] = useState(false)
  const [manualNombre, setManualNombre] = useState('')
  const [manualWhatsapp, setManualWhatsapp] = useState('')
  const [manualServicioId, setManualServicioId] = useState('')
  const [manualFecha, setManualFecha] = useState(fechaHoy)
  const [manualHora, setManualHora] = useState('')

  const [turnoAEditar, setTurnoAEditar] = useState<any | null>(null)
  const [editFecha, setEditFecha] = useState(fechaHoy)
  const [editHora, setEditHora] = useState('')
  const [editServicioId, setEditServicioId] = useState('')

  // Formulario Servicio
  const [servicioEditandoId, setServicioEditandoId] = useState<string | null>(null)
  const [nomServicio, setNomServicio] = useState('')
  const [precioServicio, setPrecioServicio] = useState('')
  const [duracionServicio, setDuracionServicio] = useState('30')

  // Datos, Slug y Redes
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [slug, setSlug] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  const [tipoFuente, setTipoFuente] = useState('Plus Jakarta Sans')
  const [tamanoFuente, setTamanoFuente] = useState('mediano')

  const [redes, setRedes] = useState<RedItem[]>([])
  const [redPlataforma, setRedPlataforma] = useState<RedItem['plataforma']>('instagram')
  const [redNombre, setRedNombre] = useState('Instagram')
  const [redUsuario, setRedUsuario] = useState('')
  const [redUrl, setRedUrl] = useState('')

  const [colorPrincipal, setColorPrincipal] = useState('#6366f1')
  const [colorFondo, setColorFondo] = useState('#0f172a')
  const [colorCarta, setColorCarta] = useState('#ffffff')
  const [tipoFondo, setTipoFondo] = useState('color')
  const [fondoImagenUrl, setFondoImagenUrl] = useState('')

  // Catálogo Visual
  const [galeria, setGaleria] = useState<any[]>([])
  const [itemTitulo, setItemTitulo] = useState('')
  const [itemPrecio, setItemPrecio] = useState('')
  const [itemImagenUrl, setItemImagenUrl] = useState('')

  // Balances
  const [filtroHistorial, setFiltroHistorial] = useState<'todo' | 'dia' | 'semana'>('todo')
  const [fechaFiltroHistorial, setFechaFiltroHistorial] = useState(fechaHoy)

  useEffect(() => {
    cargarDatos()
  }, [])

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

  const obtenerDiasSemanaAdmin = () => {
    const base = new Date()
    base.setDate(base.getDate() + offsetDiasSemana)
    const diaSem = base.getDay()
    const diffALunes = diaSem === 0 ? -6 : 1 - diaSem
    const lunes = new Date(base)
    lunes.setDate(base.getDate() + diffALunes)

    const dias = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes)
      d.setDate(lunes.getDate() + i)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const iso = `${year}-${month}-${day}`
      dias.push({
        iso,
        numero: d.getDate(),
        nombreDia: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()],
        mesCorto: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][d.getMonth()]
      })
    }
    return dias
  }

  const diasSemanaVisible = obtenerDiasSemanaAdmin()

  const turnosDelDia = turnos
    .filter(t => t.fecha_hora?.startsWith(fechaTurnosFiltro) && t.estado !== 'finalizado')
    .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())

  async function cargarDatos() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Buscar negocio del usuario
    let { data: negData } = await supabase
      .from('negocios')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    // Si es un usuario nuevo, inicializar su negocio con 10 días de prueba
    if (!negData) {
      const slugSugerido = `local-${user.id.slice(0, 6)}`
      const fechaExpiracion = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()

      const { data: nuevoNegocio, error: errCrear } = await supabase
        .from('negocios')
        .insert([
          {
            user_id: user.id,
            nombre: 'Mi Negocio',
            slug: slugSugerido,
            ubicacion: 'Buenos Aires, Argentina',
            descripcion: '¡Bienvenidos a nuestra página de reservas!',
            whatsapp: '',
            hora_apertura: '09:00',
            hora_cierre: '18:00',
            intervalo_minutos: 30,
            tipo_fuente: 'Plus Jakarta Sans',
            tamano_fuente: 'mediano',
            redes_sociales: [],
            color_principal: '#6366f1',
            color_fondo: '#0f172a',
            color_carta: '#ffffff',
            tipo_fondo: 'color',
            galeria_detallada: [],
            estado: 'prueba',
            fecha_vencimiento: fechaExpiracion
          }
        ])
        .select()
        .single()

      if (errCrear) {
        alert('Error al inicializar el negocio: ' + errCrear.message)
        return
      }
      negData = nuevoNegocio
    }

    // Control de vencimiento (Punto 6)
    const hoy = new Date()
    const fechaVenc = negData.fecha_vencimiento ? new Date(negData.fecha_vencimiento) : null
    const diasDiff = fechaVenc ? Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)) : 0
    setDiasRestantes(diasDiff)

    if (negData.estado !== 'activo' && fechaVenc && hoy > fechaVenc) {
      setBloqueadoPorVencimiento(true)
    } else {
      setBloqueadoPorVencimiento(false)
    }

    setNegocio(negData)
    setNombreNegocio(negData.nombre || '')
    setSlug(negData.slug || '')
    setUbicacion(negData.ubicacion || '')
    setDescripcion(negData.descripcion || '')
    setWhatsapp(negData.whatsapp || '')
    setLogoUrl(negData.logo_url || '')

    setHoraApertura(negData.hora_apertura || '09:00')
    setHoraCierre(negData.hora_cierre || '18:00')
    setIntervaloMinutos(negData.intervalo_minutos || 30)

    setTipoFuente(negData.tipo_fuente || 'Plus Jakarta Sans')
    setTamanoFuente(negData.tamano_fuente || 'mediano')

    if (Array.isArray(negData.redes_sociales)) {
      setRedes(negData.redes_sociales)
    }

    setColorPrincipal(negData.color_principal || '#6366f1')
    setColorFondo(negData.color_fondo || '#0f172a')
    setColorCarta(negData.color_carta || '#ffffff')
    setTipoFondo(negData.tipo_fondo || 'color')
    setFondoImagenUrl(negData.fondo_imagen_url || '')
    setGaleria(negData.galeria_detallada || [])

    // Carga de turnos
    const { data: turnosData } = await supabase
      .from('turnos')
      .select('*, servicios(nombre)')
      .eq('negocio_id', negData.id)
      .order('fecha_hora', { ascending: false })

    if (turnosData) setTurnos(turnosData)

    // Carga de servicios
    const { data: servData } = await supabase
      .from('servicios')
      .select('*')
      .eq('negocio_id', negData.id)
      .eq('activo', true)

    if (servData) {
      setServicios(servData)
      if (servData.length > 0) setManualServicioId(servData[0].id)
    }
  }

  async function handleCerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, campo: 'logo' | 'fondo' | 'catalogo') {
    const file = e.target.files?.[0]
    if (!file) return

    setCargando(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('facilapp-uploads')
      .upload(fileName, file)

    if (uploadError) {
      alert('Error al subir: ' + uploadError.message)
      setCargando(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('facilapp-uploads')
      .getPublicUrl(fileName)

    setCargando(false)
    if (campo === 'logo') setLogoUrl(publicUrlData.publicUrl)
    if (campo === 'fondo') setFondoImagenUrl(publicUrlData.publicUrl)
    if (campo === 'catalogo') setItemImagenUrl(publicUrlData.publicUrl)
    alert('Imagen cargada con éxito')
  }

  async function handleConfirmarTurno(turno: any) {
    setCargando(true)
    const { error } = await supabase
      .from('turnos')
      .update({ estado: 'confirmado' })
      .eq('id', turno.id)

    setCargando(false)
    if (error) {
      alert('Error: ' + error.message)
    } else {
      cargarDatos()
      avisarWhatsApp(turno, 'confirmar')
    }
  }

  async function handleCambiarEstadoTurno(turnoId: string, nuevoEstado: 'confirmado' | 'finalizado') {
    setCargando(true)
    const { error } = await supabase
      .from('turnos')
      .update({ estado: nuevoEstado })
      .eq('id', turnoId)

    setCargando(false)
    if (!error) cargarDatos()
  }

  function avisarWhatsApp(turno: any, accion: 'confirmar' | 'reprogramar' | 'cancelar', nuevaFecha = '', nuevaHora = '') {
    const celular = turno.cliente_whatsapp?.replace(/\D/g, '') || ''
    if (!celular) {
      alert('El cliente no tiene un teléfono de WhatsApp registrado.')
      return
    }

    const fechaTurno = new Date(turno.fecha_hora)
    const fechaTxt = fechaTurno.toLocaleDateString()
    const horaTxt = fechaTurno.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const nombreServicio = turno.servicios?.nombre || 'tu servicio'

    let mensaje = ''
    if (accion === 'confirmar') {
      mensaje = `¡Hola ${turno.cliente_nombre}! Te confirmo tu turno para *${nombreServicio}* el día *${fechaTxt}* a las *${horaTxt} hs* en *${negocio?.nombre || 'nuestro local'}*. ¡Te esperamos!`
    } else if (accion === 'reprogramar') {
      mensaje = `¡Hola ${turno.cliente_nombre}! Tu turno para *${nombreServicio}* ha sido reprogramado para el día *${nuevaFecha}* a las *${nuevaHora} hs*.`
    } else if (accion === 'cancelar') {
      mensaje = `Hola ${turno.cliente_nombre}. Te informamos que tu reserva para *${nombreServicio}* del día *${fechaTxt}* a las *${horaTxt} hs* ha sido cancelada.`
    }

    window.open(`https://wa.me/${celular}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  async function handleEliminarTurno(turno: any) {
    if (!confirm(`¿Estás seguro de cancelar el turno de ${turno.cliente_nombre}?`)) return

    if (confirm('¿Deseas enviar el aviso de cancelación por WhatsApp al cliente?')) {
      avisarWhatsApp(turno, 'cancelar')
    }

    setCargando(true)
    const { error } = await supabase.from('turnos').delete().eq('id', turno.id)
    setCargando(false)

    if (!error) cargarDatos()
  }

  async function handleGuardarReprogramacion(e: React.FormEvent) {
    e.preventDefault()
    if (!turnoAEditar || !editFecha || !editHora) return

    setCargando(true)
    const nuevaFechaHora = new Date(`${editFecha}T${editHora}:00`).toISOString()
    const servElegido = servicios.find(s => s.id === editServicioId)

    const { error } = await supabase
      .from('turnos')
      .update({
        fecha_hora: nuevaFechaHora,
        servicio_id: editServicioId,
        monto_cobrado: servElegido?.precio || turnoAEditar.monto_cobrado
      })
      .eq('id', turnoAEditar.id)

    setCargando(false)

    if (!error) {
      if (confirm('¿Notificar la nueva fecha y hora por WhatsApp al cliente?')) {
        avisarWhatsApp(turnoAEditar, 'reprogramar', editFecha, editHora)
      }
      setTurnoAEditar(null)
      cargarDatos()
    }
  }

  async function handleGuardarTurnoManual(e: React.FormEvent) {
    e.preventDefault()
    if (!manualNombre || !manualFecha || !manualHora || !manualServicioId) {
      alert('Completá todos los campos')
      return
    }

    setCargando(true)
    const servElegido = servicios.find(s => s.id === manualServicioId)
    const fechaHora = new Date(`${manualFecha}T${manualHora}:00`).toISOString()

    const { error } = await supabase.from('turnos').insert([
      {
        negocio_id: negocio.id,
        servicio_id: manualServicioId,
        cliente_nombre: manualNombre,
        cliente_whatsapp: manualWhatsapp || 'Manual Admin',
        fecha_hora: fechaHora,
        monto_cobrado: servElegido?.precio || 0,
        estado: 'confirmado'
      }
    ])

    setCargando(false)
    if (!error) {
      setManualNombre('')
      setManualWhatsapp('')
      setManualHora('')
      setMostrarModalManual(false)
      cargarDatos()
    }
  }

  async function handleGuardarServicio(e: React.FormEvent) {
    e.preventDefault()
    if (!nomServicio || !precioServicio || !negocio) return

    setCargando(true)
    if (servicioEditandoId) {
      const { error } = await supabase.from('servicios')
        .update({
          nombre: nomServicio,
          precio: parseFloat(precioServicio),
          duracion_minutos: parseInt(duracionServicio || '30')
        })
        .eq('id', servicioEditandoId)

      setCargando(false)
      if (!error) {
        cancelarEdicionServicio()
        cargarDatos()
      }
    } else {
      const { error } = await supabase.from('servicios').insert([
        {
          negocio_id: negocio.id,
          nombre: nomServicio,
          precio: parseFloat(precioServicio),
          duracion_minutos: parseInt(duracionServicio || '30'),
          activo: true
        }
      ])

      setCargando(false)
      if (!error) {
        setNomServicio('')
        setPrecioServicio('')
        setDuracionServicio('30')
        cargarDatos()
      }
    }
  }

  function iniciarEdicionServicio(serv: any) {
    setServicioEditandoId(serv.id)
    setNomServicio(serv.nombre || '')
    setPrecioServicio(serv.precio ? String(serv.precio) : '')
    setDuracionServicio(serv.duracion_minutos ? String(serv.duracion_minutos) : '30')
  }

  function cancelarEdicionServicio() {
    setServicioEditandoId(null)
    setNomServicio('')
    setPrecioServicio('')
    setDuracionServicio('30')
  }

  async function handleEliminarServicio(servicioId: string) {
    if (!confirm('¿Eliminar servicio?')) return
    setCargando(true)
    await supabase.from('servicios').update({ activo: false }).eq('id', servicioId)
    setCargando(false)
    cargarDatos()
  }

  function cambiarPlataformaRed(plat: RedItem['plataforma']) {
    setRedPlataforma(plat)
    const nombres: Record<RedItem['plataforma'], string> = {
      whatsapp: 'WhatsApp',
      instagram: 'Instagram',
      facebook: 'Facebook',
      tiktok: 'TikTok',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      web: 'Sitio Web'
    }
    setRedNombre(nombres[plat])
  }

  function handleAgregarRed() {
    if (!redUsuario.trim() && !redUrl.trim()) {
      alert('Ingresá el usuario o la URL de la red.')
      return
    }

    let urlFinal = redUrl.trim()
    if (!urlFinal) {
      if (redPlataforma === 'whatsapp') urlFinal = `https://wa.me/${redUsuario.replace(/\D/g, '')}`
      else if (redPlataforma === 'instagram') urlFinal = `https://instagram.com/${redUsuario.replace('@', '')}`
      else if (redPlataforma === 'tiktok') urlFinal = `https://tiktok.com/@${redUsuario.replace('@', '')}`
      else if (redPlataforma === 'facebook') urlFinal = `https://facebook.com/${redUsuario}`
      else if (redPlataforma === 'linkedin') urlFinal = `https://linkedin.com/in/${redUsuario}`
      else if (redPlataforma === 'youtube') urlFinal = `https://youtube.com/@${redUsuario.replace('@', '')}`
      else urlFinal = `https://${redUsuario}`
    } else if (!urlFinal.startsWith('http://') && !urlFinal.startsWith('https://')) {
      urlFinal = `https://${urlFinal}`
    }

    const nuevoItem: RedItem = {
      id: `${Date.now()}`,
      plataforma: redPlataforma,
      nombreRed: redNombre.trim() || 'Red Social',
      usuarioODetalle: redUsuario.trim() || urlFinal,
      url: urlFinal
    }

    setRedes([...redes, nuevoItem])
    setRedUsuario('')
    setRedUrl('')
  }

  function handleEliminarRed(id: string) {
    setRedes(redes.filter((r) => r.id !== id))
  }

  function renderIconoRed(plat: RedItem['plataforma']) {
    switch (plat) {
      case 'whatsapp': return <FaWhatsapp className="w-5 h-5 text-emerald-400" />
      case 'instagram': return <FaInstagram className="w-5 h-5 text-pink-400" />
      case 'tiktok': return <FaTiktok className="w-5 h-5 text-slate-100" />
      case 'facebook': return <FaFacebook className="w-5 h-5 text-blue-400" />
      case 'linkedin': return <FaLinkedin className="w-5 h-5 text-sky-400" />
      case 'youtube': return <FaYoutube className="w-5 h-5 text-rose-500" />
      default: return <Globe className="w-5 h-5 text-indigo-400" />
    }
  }

  function handleAgregarItemGaleria() {
    if (!itemTitulo || !itemImagenUrl) return
    const nuevo = { titulo: itemTitulo, precio: itemPrecio, imagen_url: itemImagenUrl }
    setGaleria([...galeria, nuevo])
    setItemTitulo('')
    setItemPrecio('')
    setItemImagenUrl('')
  }

  function handleEliminarItemGaleria(index: number) {
    setGaleria(galeria.filter((_, i) => i !== index))
  }

  async function handleGuardarConfiguracion(e: React.FormEvent) {
    e.preventDefault()
    if (!negocio) return

    setCargando(true)
    const slugLimpio = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')

    const { error } = await supabase
      .from('negocios')
      .update({
        nombre: nombreNegocio,
        slug: slugLimpio,
        ubicacion,
        descripcion,
        whatsapp,
        logo_url: logoUrl,
        hora_apertura: horaApertura,
        hora_cierre: horaCierre,
        intervalo_minutos: parseInt(String(intervaloMinutos)),
        tipo_fuente: tipoFuente,
        tamano_fuente: tamanoFuente,
        redes_sociales: redes,
        color_principal: colorPrincipal,
        color_fondo: colorFondo,
        color_carta: colorCarta,
        tipo_fondo: tipoFondo,
        fondo_imagen_url: fondoImagenUrl,
        galeria_detallada: galeria
      })
      .eq('id', negocio.id)

    setCargando(false)
    if (!error) {
      alert('¡Configuración guardada exitosamente!')
      cargarDatos()
    } else {
      if (error.code === '23505') {
        alert('El enlace/slug ya está en uso por otro negocio. Elegí otro por favor.')
      } else {
        alert('Error: ' + error.message)
      }
    }
  }

  // PANTALLA DE BLOQUEO POR PERIODO DE PRUEBA EXPIRADO (Punto 6)
  if (bloqueadoPorVencimiento) {
    const mensajeWp = `Hola! Quiero renovar mi suscripción en FacilApp para mi local "${negocio?.nombre || 'Mi Negocio'}" (ID: ${negocio?.id}). ¿Me pasas los datos para transferir?`

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Período de prueba finalizado</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tu prueba gratuita de 10 días para <strong className="text-white">{negocio?.nombre}</strong> ha concluido. Para continuar gestionando tus turnos y mantener tu página online, renová tu plan.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Estado:</span>
              <span className="font-bold text-rose-400 uppercase">Suspendido</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Plan mensual:</span>
              <span className="font-bold text-white">Acceso Completo</span>
            </div>
          </div>

          <a
            href={`https://wa.me/${NUMERO_WHATSAPP_SOPORTE}?text=${encodeURIComponent(mensajeWp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950"
          >
            <FaWhatsapp className="w-4 h-4" /> Activar por WhatsApp (Transferencia / MP)
          </a>

          <button
            onClick={handleCerrarSesion}
            className="text-xs text-slate-500 hover:text-slate-300 font-bold transition block mx-auto"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  const horariosDisponibles = generarHorarios(horaApertura, horaCierre, intervaloMinutos)

  const turnosPendientes = turnos.filter(t => t.estado === 'pendiente')
  const turnosConfirmados = turnos.filter(t => t.estado === 'confirmado')
  const turnosHistorial = turnos.filter(t => t.estado === 'finalizado')

  const turnosFiltradosHistorial = turnosHistorial.filter(t => {
    if (filtroHistorial === 'todo') return true
    const fechaTurno = t.fecha_hora.split('T')[0]
    if (filtroHistorial === 'dia') return fechaTurno === fechaFiltroHistorial
    if (filtroHistorial === 'semana') {
      const dTurno = new Date(fechaTurno)
      const dRef = new Date(fechaFiltroHistorial)
      const diffDias = Math.abs((dRef.getTime() - dTurno.getTime()) / (1000 * 3600 * 24))
      return diffDias <= 7
    }
    return true
  })

  const totalRecaudado = turnosFiltradosHistorial.reduce((acc, t) => acc + (Number(t.monto_cobrado) || 0), 0)
  const promedioPorTurno = turnosFiltradosHistorial.length > 0 
    ? Math.round(totalRecaudado / turnosFiltradosHistorial.length) 
    : 0

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const facturacionPorDiaSemana = [0, 0, 0, 0, 0, 0, 0]
  const ventasPorServicio: Record<string, { cantidad: number, total: number }> = {}

  turnosFiltradosHistorial.forEach(t => {
    const d = new Date(t.fecha_hora)
    facturacionPorDiaSemana[d.getDay()] += Number(t.monto_cobrado) || 0

    const nom = t.servicios?.nombre || 'General'
    if (!ventasPorServicio[nom]) ventasPorServicio[nom] = { cantidad: 0, total: 0 }
    ventasPorServicio[nom].cantidad += 1
    ventasPorServicio[nom].total += Number(t.monto_cobrado) || 0
  })

  const maxVentaDia = Math.max(...facturacionPorDiaSemana, 1)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* MENÚ LATERAL */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
              {negocio?.nombre?.charAt(0) || 'A'}
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white leading-tight truncate max-w-[150px]">
                {negocio?.nombre || 'Administración'}
              </h1>
              <p className="text-[11px] text-slate-400">Panel de Control</p>
            </div>
          </div>

          {/* Banner de Estado / Periodo de prueba */}
          {negocio?.estado === 'prueba' && diasRestantes !== null && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Prueba gratuita activa</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Te quedan <strong className="text-amber-300">{diasRestantes > 0 ? diasRestantes : 0} días</strong> de prueba.
              </p>
            </div>
          )}

          <nav className="space-y-1.5">
            <button
              onClick={() => setTab('turnos')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                tab === 'turnos' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Turnos Reservados</span>
              {turnosPendientes.length > 0 && (
                <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                  {turnosPendientes.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab('servicios')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                tab === 'servicios' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Scissors className="w-4 h-4 shrink-0" />
              <span>Gestor de Servicios</span>
            </button>

            <button
              onClick={() => setTab('horarios_catalogo')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                tab === 'horarios_catalogo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Horarios & Catálogo</span>
            </button>

            <button
              onClick={() => setTab('marca')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                tab === 'marca' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Palette className="w-4 h-4 shrink-0" />
              <span>Datos & Redes</span>
            </button>

            <button
              onClick={() => setTab('historial')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                tab === 'historial' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Historial & Balances</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 mt-6 md:mt-0 space-y-2">
          <a
            href={`/${slug || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Mi Página Pública</span>
          </a>

          <button
            onClick={handleCerrarSesion}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-800/80 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO CENTRAL */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-6xl">
        
        {/* PESTAÑA 1: TURNOS */}
        {tab === 'turnos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <div>
                <h2 className="text-lg font-black text-white">Turnos Reservados</h2>
                <p className="text-xs text-slate-400">Confirmá y abrí el chat de WhatsApp al instante</p>
              </div>
              <button
                onClick={() => setMostrarModalManual(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
              >
                <UserPlus className="w-4 h-4" /> Nuevo Turno Manual
              </button>
            </div>

            {/* MINI CALENDARIO SEMANAL */}
            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Vista Semanal de Turnos
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Seleccioná un día para ver su cronograma detallado
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const nuevoOffset = offsetDiasSemana - 7
                      setOffsetDiasSemana(nuevoOffset)
                      const d = new Date()
                      d.setDate(d.getDate() + nuevoOffset)
                      const y = d.getFullYear()
                      const m = String(d.getMonth() + 1).padStart(2, '0')
                      const dia = String(d.getDate()).padStart(2, '0')
                      setFechaTurnosFiltro(`${y}-${m}-${dia}`)
                    }}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-bold transition"
                  >
                    ‹ Ant
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOffsetDiasSemana(0)
                      setFechaTurnosFiltro(fechaHoy)
                    }}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] text-indigo-300 font-bold transition"
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nuevoOffset = offsetDiasSemana + 7
                      setOffsetDiasSemana(nuevoOffset)
                      const d = new Date()
                      d.setDate(d.getDate() + nuevoOffset)
                      const y = d.getFullYear()
                      const m = String(d.getMonth() + 1).padStart(2, '0')
                      const dia = String(d.getDate()).padStart(2, '0')
                      setFechaTurnosFiltro(`${y}-${m}-${dia}`)
                    }}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-bold transition"
                  >
                    Sig ›
                  </button>
                  <input
                    type="date"
                    value={fechaTurnosFiltro}
                    onChange={(e) => seleccionarFechaEspecifica(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs text-white"
                    title="Ir a una fecha específica"
                  />
                </div>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1.5">
                {diasSemanaVisible.map(d => {
                  const esSeleccionado = fechaTurnosFiltro === d.iso
                  const esHoy = d.iso === fechaHoy
                  const cantTurnos = turnos.filter(t => t.fecha_hora?.startsWith(d.iso) && t.estado !== 'finalizado').length

                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setFechaTurnosFiltro(d.iso)}
                      className={`p-2 rounded-2xl flex flex-col items-center justify-center transition border ${
                        esSeleccionado
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                          : esHoy
                          ? 'bg-slate-950 border-indigo-500/50 text-indigo-300'
                          : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-medium opacity-80">{d.nombreDia}</span>
                      <span className="text-sm font-black leading-tight my-0.5">{d.numero}</span>
                      <span className="text-[9px] opacity-70">{d.mesCorto}</span>

                      {cantTurnos > 0 && (
                        <span className={`mt-1 text-[9px] px-1.5 rounded-full font-black ${
                          esSeleccionado ? 'bg-white text-indigo-700' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {cantTurnos}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Detalle del día */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-xs font-bold text-slate-300">
                    Cronograma del {fechaTurnosFiltro.split('-').reverse().join('/')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {turnosDelDia.length} turno{turnosDelDia.length === 1 ? '' : 's'}
                  </span>
                </div>

                {turnosDelDia.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3">
                    No hay turnos registrados para este día.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {turnosDelDia.map(t => {
                      const d = new Date(t.fecha_hora)
                      const horaMin = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      const esPendiente = t.estado === 'pendiente'

                      return (
                        <div key={t.id} className="py-2.5 flex items-center justify-between gap-3 first:pt-1 last:pb-1">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 font-black text-xs">
                              {horaMin} hs
                            </span>
                            <div>
                              <p className="font-bold text-xs text-white leading-tight">
                                {t.cliente_nombre}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {t.servicios?.nombre || 'General'} • WA: {t.cliente_whatsapp}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              esPendiente 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {t.estado}
                            </span>
                            <span className="font-bold text-xs text-emerald-400">
                              ${t.monto_cobrado}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Reprogramación */}
            {turnoAEditar && (
              <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-sm text-white">Reprogramar Turno de {turnoAEditar.cliente_nombre}</h3>
                  <button onClick={() => setTurnoAEditar(null)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleGuardarReprogramacion} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Servicio</label>
                      <select
                        value={editServicioId}
                        onChange={(e) => setEditServicioId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                        required
                      >
                        {servicios.map((s) => (
                          <option key={s.id} value={s.id}>{s.nombre} (${s.precio})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Nueva Fecha</label>
                      <input
                        type="date"
                        min={fechaHoy}
                        value={editFecha}
                        onChange={(e) => setEditFecha(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Nuevo Horario</label>
                      <select
                        value={editHora}
                        onChange={(e) => setEditHora(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                        required
                      >
                        <option value="">Elegir horario</option>
                        {horariosDisponibles.map((h) => (
                          <option key={h} value={h}>{h} hs</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={cargando}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition"
                    >
                      Guardar y Notificar
                    </button>
                    <button
                      type="button"
                      onClick={() => setTurnoAEditar(null)}
                      className="px-4 bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Modal Turno Manual */}
            {mostrarModalManual && (
              <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-sm text-white">Agendar Turno Manualmente</h3>
                  <button onClick={() => setMostrarModalManual(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleGuardarTurnoManual} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nombre del cliente"
                      value={manualNombre}
                      onChange={(e) => setManualNombre(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp (ej. 1122334455)"
                      value={manualWhatsapp}
                      onChange={(e) => setManualWhatsapp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={manualServicioId}
                      onChange={(e) => setManualServicioId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      required
                    >
                      {servicios.map((s) => (
                        <option key={s.id} value={s.id}>{s.nombre} (${s.precio})</option>
                      ))}
                    </select>

                    <input
                      type="date"
                      min={fechaHoy}
                      value={manualFecha}
                      onChange={(e) => setManualFecha(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      required
                    />

                    <select
                      value={manualHora}
                      onChange={(e) => setManualHora(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      required
                    >
                      <option value="">Seleccionar hora</option>
                      {horariosDisponibles.map((h) => (
                        <option key={h} value={h}>{h} hs</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={cargando}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Confirmar Turno
                  </button>
                </form>
              </div>
            )}

            {/* Solicitudes Pendientes */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-amber-400">⏳ Solicitudes Pendientes ({turnosPendientes.length})</h3>
              <div className="space-y-3">
                {turnosPendientes.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No tenés solicitudes pendientes.</p>
                ) : (
                  turnosPendientes.map((t) => {
                    const f = new Date(t.fecha_hora)
                    return (
                      <div key={t.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center flex-wrap gap-3">
                        <div>
                          <p className="font-bold text-sm text-white">{t.cliente_nombre}</p>
                          <p className="text-xs text-slate-400">WA: {t.cliente_whatsapp} • {t.servicios?.nombre || 'General'}</p>
                          <p className="text-xs font-semibold text-amber-400 mt-1">
                            📅 {f.toLocaleDateString()} a las {f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleConfirmarTurno(t)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow"
                          >
                            <FaWhatsapp className="w-4 h-4" /> Confirmar & Abrir WA
                          </button>

                          <button
                            onClick={() => handleEliminarTurno(t)}
                            className="p-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-xl border border-rose-500/30 transition"
                            title="Cancelar Turno"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Turnos Confirmados */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-emerald-400">✓ Turnos Confirmados & Próximos ({turnosConfirmados.length})</h3>
              <div className="space-y-3">
                {turnosConfirmados.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No hay turnos confirmados activos.</p>
                ) : (
                  turnosConfirmados.map((t) => {
                    const f = new Date(t.fecha_hora)
                    return (
                      <div key={t.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center flex-wrap gap-3">
                        <div>
                          <p className="font-bold text-sm text-white">{t.cliente_nombre}</p>
                          <p className="text-xs text-slate-400">WA: {t.cliente_whatsapp} • {t.servicios?.nombre || 'General'}</p>
                          <p className="text-xs font-semibold text-emerald-400 mt-1">
                            📅 {f.toLocaleDateString()} a las {f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => avisarWhatsApp(t, 'confirmar')}
                            className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl border border-emerald-500/30 transition text-xs font-bold flex items-center gap-1"
                            title="Abrir chat de WhatsApp"
                          >
                            <FaWhatsapp className="w-3.5 h-3.5" /> Chat
                          </button>

                          <button
                            onClick={() => {
                              setTurnoAEditar(t)
                              setEditFecha(t.fecha_hora.split('T')[0])
                              const horaMin = new Date(t.fecha_hora)
                              setEditHora(`${String(horaMin.getHours()).padStart(2, '0')}:${String(horaMin.getMinutes()).padStart(2, '0')}`)
                              setEditServicioId(t.servicio_id)
                            }}
                            className="p-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/30 transition text-xs font-bold flex items-center gap-1"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Reprogramar
                          </button>

                          <button
                            onClick={() => handleCambiarEstadoTurno(t.id, 'finalizado')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1"
                          >
                            <CalendarCheck2 className="w-3.5 h-3.5" /> Finalizar
                          </button>

                          <button
                            onClick={() => handleEliminarTurno(t)}
                            className="p-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-xl border border-rose-500/30 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: SERVICIOS */}
        {tab === 'servicios' && (
          <div className="space-y-6">
            <form onSubmit={handleGuardarServicio} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-white">
                  {servicioEditandoId ? '✏️ Editar Servicio' : '➕ Agregar Nuevo Servicio'}
                </h2>
                {servicioEditandoId && (
                  <button
                    type="button"
                    onClick={cancelarEdicionServicio}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800"
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nombre del servicio"
                  value={nomServicio}
                  onChange={(e) => setNomServicio(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Precio ($)"
                  value={precioServicio}
                  onChange={(e) => setPrecioServicio(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Duración (minutos)"
                  value={duracionServicio}
                  onChange={(e) => setDuracionServicio(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-xs transition shadow-lg"
              >
                {cargando ? 'Guardando...' : servicioEditandoId ? 'Actualizar Servicio' : 'Guardar Servicio'}
              </button>
            </form>

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
              <h3 className="text-sm font-bold text-slate-400">Listado de Servicios Activos</h3>
              {servicios.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No tenés servicios agregados.</p>
              ) : (
                servicios.map((s) => (
                  <div key={s.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-white">{s.nombre}</p>
                      <p className="text-xs text-slate-400">⏱️ {s.duracion_minutos || 30} minutos</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-emerald-400 text-sm">${s.precio}</span>
                      <button
                        type="button"
                        onClick={() => iniciarEdicionServicio(s)}
                        className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminarServicio(s.id)}
                        className="p-2 bg-rose-600/20 text-rose-400 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: HORARIOS & CATÁLOGO */}
        {tab === 'horarios_catalogo' && (
          <form onSubmit={handleGuardarConfiguracion} className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  Horarios de Atención
                </h2>
                <p className="text-xs text-slate-400">Definí las horas de apertura y el intervalo entre turnos</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Desde</label>
                  <input
                    type="time"
                    value={horaApertura}
                    onChange={(e) => setHoraApertura(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Hasta</label>
                  <input
                    type="time"
                    value={horaCierre}
                    onChange={(e) => setHoraCierre(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Turnos cada</label>
                  <select
                    value={intervaloMinutos}
                    onChange={(e) => setIntervaloMinutos(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value={15}>Cada 15 min</option>
                    <option value={20}>Cada 20 min</option>
                    <option value={30}>Cada 30 min</option>
                    <option value={45}>Cada 45 min</option>
                    <option value={60}>Cada 60 min</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-400" />
                  Catálogo Visual / Fotos con Precio
                </h2>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Título del producto"
                    value={itemTitulo}
                    onChange={(e) => setItemTitulo(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Precio ($)"
                    value={itemPrecio}
                    onChange={(e) => setItemPrecio(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'catalogo')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-400"
                />

                {itemImagenUrl && (
                  <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl">
                    <img src={itemImagenUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="text-xs text-emerald-400 font-bold">✓ Imagen lista</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAgregarItemGaleria}
                  className="w-full bg-slate-800 hover:bg-slate-750 text-indigo-300 font-bold py-2.5 rounded-xl text-xs border border-indigo-500/30"
                >
                  + Agregar Foto al Catálogo
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galeria.map((item, index) => (
                  <div key={index} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative">
                    <img src={item.imagen_url} alt={item.titulo} className="w-full h-28 object-cover" />
                    <div className="p-2 space-y-0.5">
                      <p className="font-bold text-xs text-white truncate">{item.titulo}</p>
                      {item.precio && <p className="text-xs text-emerald-400 font-black">${item.precio}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEliminarItemGaleria(index)}
                      className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-lg text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-lg"
            >
              Guardar Horarios y Catálogo
            </button>
          </form>
        )}

        {/* PESTAÑA 4: DATOS & REDES + SLUG */}
        {tab === 'marca' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <form onSubmit={handleGuardarConfiguracion} className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
              <div>
                <h2 className="text-lg font-black text-white">Datos del Negocio, Redes & Diseño</h2>
                <p className="text-xs text-slate-400">Configurá la foto de perfil, tu enlace personalizado y estilo</p>
              </div>

              {/* FOTO DE PERFIL / LOGO */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  Foto de Perfil / Logo Oficial
                </label>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-indigo-500 overflow-hidden flex items-center justify-center shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-black text-xl">{nombreNegocio?.charAt(0) || 'F'}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-400"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Formato cuadrado recomendado (PNG o JPG)</p>
                  </div>
                </div>
              </div>

              {/* SLUG */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                  Tu Enlace Público (Link-in-bio)
                </label>
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs">
                  <span className="text-slate-500 shrink-0">facilapp.com/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="mi-local"
                    className="bg-transparent text-white font-bold w-full focus:outline-none pl-1"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500">Este es el link que compartirás con tus clientes.</p>
              </div>

              {/* Datos Principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={nombreNegocio}
                    onChange={(e) => setNombreNegocio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">WhatsApp de Notificaciones</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="5491122334455"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              </div>

              {/* Tipografía y Tamaños */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Tipografía & Estilo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Fuente</label>
                    <select
                      value={tipoFuente}
                      onChange={(e) => setTipoFuente(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option value="Plus Jakarta Sans">Moderna (Plus Jakarta Sans)</option>
                      <option value="Playfair Display">Elegante (Playfair Display)</option>
                      <option value="Inter">Minimalista (Inter)</option>
                      <option value="Space Grotesk">Digital / Urbana (Space Grotesk)</option>
                      <option value="Dancing Script">Manuscrita (Dancing Script)</option>
                      <option value="Cinzel">Clásica / Premium (Cinzel)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Tamaño de Letra</label>
                    <select
                      value={tamanoFuente}
                      onChange={(e) => setTamanoFuente(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option value="chico">Chico</option>
                      <option value="mediano">Mediano</option>
                      <option value="grande">Grande</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Colores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Fondo</label>
                  <input
                    type="color"
                    value={colorFondo}
                    onChange={(e) => setColorFondo(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Tarjeta</label>
                  <input
                    type="color"
                    value={colorCarta}
                    onChange={(e) => setColorCarta(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Botón</label>
                  <input
                    type="color"
                    value={colorPrincipal}
                    onChange={(e) => setColorPrincipal(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              {/* Redes Sociales */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Enlaces de Redes Sociales</h3>
                
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Plataforma</label>
                      <select
                        value={redPlataforma}
                        onChange={(e) => cambiarPlataformaRed(e.target.value as RedItem['plataforma'])}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="tiktok">TikTok</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="youtube">YouTube</option>
                        <option value="web">Sitio Web</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Texto del Botón</label>
                      <input
                        type="text"
                        placeholder="Ej. Instagram"
                        value={redNombre}
                        onChange={(e) => setRedNombre(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Detalle (@ o número)</label>
                      <input
                        type="text"
                        placeholder="@usuario"
                        value={redUsuario}
                        onChange={(e) => setRedUsuario(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">URL / Link Directo</label>
                    <input
                      type="text"
                      placeholder="https://... (si lo dejas vacío se genera solo con tu usuario)"
                      value={redUrl}
                      onChange={(e) => setRedUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAgregarRed}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-indigo-300 font-bold py-2.5 rounded-xl text-xs border border-indigo-500/30 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Agregar Red Social
                  </button>
                </div>

                <div className="space-y-2">
                  {redes.map((r) => (
                    <div key={r.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                          {renderIconoRed(r.plataforma)}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{r.nombreRed}</p>
                          <p className="text-[10px] text-slate-400 truncate">{r.usuarioODetalle} • {r.url}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button type="button" onClick={() => handleEliminarRed(r.id)} className="text-rose-400 p-1.5">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-lg"
              >
                Guardar Todos los Cambios
              </button>
            </form>

            {/* PREVIEW EN TIEMPO REAL */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="sticky top-6 w-full max-w-[320px] bg-slate-900 border-4 border-slate-700 rounded-[40px] p-3 shadow-2xl overflow-hidden">
                <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-3"></div>

                <div 
                  className="rounded-[30px] p-4 text-center transition-all duration-300 overflow-y-auto max-h-[550px] shadow-inner"
                  style={{ 
                    backgroundColor: colorFondo,
                    fontFamily: `'${tipoFuente}', sans-serif`
                  }}
                >
                  <div 
                    className="p-5 rounded-2xl shadow-lg border border-white/20 transition-all duration-300"
                    style={{ backgroundColor: colorCarta }}
                  >
                    <div className="w-16 h-16 rounded-full mx-auto mb-2 bg-slate-900 border-2 border-white overflow-hidden flex items-center justify-center text-white font-black text-xl shadow">
                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : nombreNegocio?.charAt(0) || 'L'}
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900">{nombreNegocio || 'Tu Negocio'}</h3>
                    <p className="text-[10px] text-slate-500">{ubicacion || 'Tu Ubicación'}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{descripcion || 'Descripción del negocio'}</p>

                    <div className="mt-4 space-y-2">
                      {redes.map(r => (
                        <div key={r.id} className="bg-slate-50 border border-slate-200 p-2 rounded-xl flex items-center justify-between text-[11px] font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            {renderIconoRed(r.plataforma)}
                            <span>{r.nombreRed}</span>
                          </div>
                          <span className="text-slate-400">›</span>
                        </div>
                      ))}

                      <div 
                        style={{ backgroundColor: colorPrincipal }}
                        className="text-white p-2.5 rounded-xl text-[11px] font-bold shadow"
                      >
                        📅 Solicitar Turno / Pedido
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-center text-[10px] text-slate-500 mt-3 font-semibold flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3" /> Vista previa en tiempo real
                </p>
              </div>
            </div>

          </div>
        )}

        {/* PESTAÑA 5: HISTORIAL */}
        {tab === 'historial' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    Estadísticas & Balances Financieros
                  </h2>
                  <p className="text-xs text-slate-400">Control de ingresos por turnos finalizados</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setFiltroHistorial('todo')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${filtroHistorial === 'todo' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    Todo
                  </button>
                  <button
                    onClick={() => setFiltroHistorial('semana')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${filtroHistorial === 'semana' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    Por Semana
                  </button>
                  <button
                    onClick={() => setFiltroHistorial('dia')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${filtroHistorial === 'dia' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    Por Día
                  </button>
                </div>
              </div>

              {filtroHistorial !== 'todo' && (
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 max-w-sm">
                  <span className="text-xs text-slate-400">Fecha de referencia:</span>
                  <input
                    type="date"
                    value={fechaFiltroHistorial}
                    onChange={(e) => setFechaFiltroHistorial(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  />
                </div>
              )}

              {/* Tarjetas de Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Facturación Total
                  </span>
                  <p className="text-2xl font-black text-emerald-400 tracking-tight">
                    ${totalRecaudado.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">Período seleccionado</p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarCheck2 className="w-3.5 h-3.5 text-sky-400" /> Turnos Finalizados
                  </span>
                  <p className="text-2xl font-black text-sky-400 tracking-tight">
                    {turnosFiltradosHistorial.length}
                  </p>
                  <p className="text-[10px] text-slate-500">Clientes atendidos</p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Promedio / Turno
                  </span>
                  <p className="text-2xl font-black text-indigo-400 tracking-tight">
                    ${promedioPorTurno.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">Ticket promedio</p>
                </div>
              </div>
            </div>

            {/* GRÁFICOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Facturación por Día de la Semana ($)
                </h3>

                <div className="flex items-end justify-between h-44 pt-6 pb-2 px-2 bg-slate-950 rounded-2xl border border-slate-800">
                  {facturacionPorDiaSemana.map((monto, idx) => {
                    const porcentaje = Math.max((monto / maxVentaDia) * 100, 4)
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          ${monto}
                        </span>
                        <div className="w-full max-w-[24px] bg-slate-800 rounded-lg overflow-hidden flex items-end h-28">
                          <div 
                            style={{ height: `${porcentaje}%` }} 
                            className="w-full bg-indigo-500 group-hover:bg-indigo-400 transition-all rounded-t-md"
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{diasSemana[idx]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Servicios Más Vendidos
                </h3>

                <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-48 overflow-y-auto">
                  {Object.keys(ventasPorServicio).length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">Sin registros suficientes para graficar.</p>
                  ) : (
                    Object.entries(ventasPorServicio).map(([nombre, datos]) => {
                      const porcentaje = Math.min((datos.total / (totalRecaudado || 1)) * 100, 100)
                      return (
                        <div key={nombre} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-white">{nombre} ({datos.cantidad})</span>
                            <span className="font-black text-emerald-400">${datos.total}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${porcentaje}%` }} 
                              className="h-full bg-emerald-500 rounded-full"
                            ></div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
              <h3 className="text-sm font-bold text-slate-300">Detalle de Turnos Facturados</h3>
              <div className="space-y-2">
                {turnosFiltradosHistorial.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No hay turnos finalizados en este período.</p>
                ) : (
                  turnosFiltradosHistorial.map((t) => {
                    const f = new Date(t.fecha_hora)
                    return (
                      <div key={t.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs text-white">{t.cliente_nombre}</p>
                          <p className="text-[11px] text-slate-400">
                            {t.servicios?.nombre || 'Servicio'} • {f.toLocaleDateString()} a las {f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                          </p>
                        </div>
                        <span className="font-black text-emerald-400 text-sm bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-1 rounded-xl">
                          +${t.monto_cobrado}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}