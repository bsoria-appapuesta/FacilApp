'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
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
  DollarSign
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

interface RedItem {
  id: string
  plataforma: 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'youtube' | 'web'
  nombreRed: string
  usuarioODetalle: string
  url: string
}

export default function AdminPage() {
  const [tab, setTab] = useState<'turnos' | 'servicios' | 'horarios_catalogo' | 'marca' | 'historial'>('turnos')
  const [negocio, setNegocio] = useState<any>(null)
  const [turnos, setTurnos] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)

  // Configuración de Horarios
  const [horaApertura, setHoraApertura] = useState('09:00')
  const [horaCierre, setHoraCierre] = useState('18:00')
  const [intervaloMinutos, setIntervaloMinutos] = useState(30)

  // Turno Manual desde Admin
  const [mostrarModalManual, setMostrarModalManual] = useState(false)
  
  const obtenerFechaLocal = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const fechaHoy = obtenerFechaLocal()

  const [manualNombre, setManualNombre] = useState('')
  const [manualWhatsapp, setManualWhatsapp] = useState('')
  const [manualServicioId, setManualServicioId] = useState('')
  const [manualFecha, setManualFecha] = useState(fechaHoy)
  const [manualHora, setManualHora] = useState('')

  // Formulario Servicio
  const [servicioEditandoId, setServicioEditandoId] = useState<string | null>(null)
  const [nomServicio, setNomServicio] = useState('')
  const [precioServicio, setPrecioServicio] = useState('')
  const [duracionServicio, setDuracionServicio] = useState('30')

  // Datos y Redes
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  // Tipografía y Tamaños
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
  const [logoUrl, setLogoUrl] = useState('')

  // Catálogo Visual
  const [galeria, setGaleria] = useState<any[]>([])
  const [itemTitulo, setItemTitulo] = useState('')
  const [itemPrecio, setItemPrecio] = useState('')
  const [itemImagenUrl, setItemImagenUrl] = useState('')

  // Filtros Historial
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

  async function cargarDatos() {
    const { data: negData } = await supabase.from('negocios').select('*').limit(1).single()
    if (negData) {
      setNegocio(negData)
      setNombreNegocio(negData.nombre || '')
      setUbicacion(negData.ubicacion || '')
      setDescripcion(negData.descripcion || '')
      setWhatsapp(negData.whatsapp || '')

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
      setLogoUrl(negData.logo_url || '')
      setGaleria(negData.galeria_detallada || [])

      const { data: turnosData } = await supabase
        .from('turnos')
        .select('*, servicios(nombre)')
        .eq('negocio_id', negData.id)
        .order('fecha_hora', { ascending: false })

      if (turnosData) setTurnos(turnosData)

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
      alert('Error al subir imagen: ' + uploadError.message)
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
    alert('Imagen subida correctamente')
  }

  async function handleCambiarEstadoTurno(turnoId: string, nuevoEstado: 'confirmado' | 'finalizado') {
    setCargando(true)
    const { error } = await supabase
      .from('turnos')
      .update({ estado: nuevoEstado })
      .eq('id', turnoId)

    setCargando(false)
    if (error) {
      alert('Error: ' + error.message)
    } else {
      cargarDatos()
    }
  }

  async function handleGuardarTurnoManual(e: React.FormEvent) {
    e.preventDefault()
    if (!manualNombre || !manualFecha || !manualHora || !manualServicioId) {
      alert('Por favor completá los campos del turno')
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
    if (error) {
      alert('Error al crear turno: ' + error.message)
    } else {
      setManualNombre('')
      setManualWhatsapp('')
      setManualHora('')
      setMostrarModalManual(false)
      cargarDatos()
    }
  }

  async function handleGuardarServicio(e: React.FormEvent) {
    e.preventDefault()
    if (!nomServicio || !precioServicio || !negocio) {
      alert('Completá nombre y precio del servicio')
      return
    }

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
      if (error) {
        alert('Error: ' + error.message)
      } else {
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
      if (error) {
        alert('Error: ' + error.message)
      } else {
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
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return

    setCargando(true)
    const { error } = await supabase.from('servicios')
      .update({ activo: false })
      .eq('id', servicioId)

    setCargando(false)
    if (error) {
      alert('Error: ' + error.message)
    } else {
      cargarDatos()
    }
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
      alert('Completá el usuario/número y el link de la red')
      return
    }

    let urlFinal = redUrl.trim()
    if (!urlFinal) {
      if (redPlataforma === 'whatsapp') {
        urlFinal = `https://wa.me/${redUsuario.replace(/\D/g, '')}`
      } else if (redPlataforma === 'instagram') {
        urlFinal = `https://instagram.com/${redUsuario.replace('@', '')}`
      } else if (redPlataforma === 'tiktok') {
        urlFinal = `https://tiktok.com/@${redUsuario.replace('@', '')}`
      } else if (redPlataforma === 'facebook') {
        urlFinal = `https://facebook.com/${redUsuario}`
      } else if (redPlataforma === 'linkedin') {
        urlFinal = `https://linkedin.com/in/${redUsuario}`
      } else if (redPlataforma === 'youtube') {
        urlFinal = `https://youtube.com/@${redUsuario.replace('@', '')}`
      } else {
        urlFinal = `https://${redUsuario}`
      }
    } else if (!urlFinal.startsWith('http://') && !urlFinal.startsWith('https://')) {
      if (redPlataforma === 'whatsapp') {
        urlFinal = `https://wa.me/${urlFinal.replace(/\D/g, '')}`
      } else {
        urlFinal = `https://${urlFinal}`
      }
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
      case 'tiktok': return <FaTiktok className="w-5 h-5 text-white" />
      case 'facebook': return <FaFacebook className="w-5 h-5 text-blue-400" />
      case 'linkedin': return <FaLinkedin className="w-5 h-5 text-sky-400" />
      case 'youtube': return <FaYoutube className="w-5 h-5 text-rose-500" />
      default: return <Globe className="w-5 h-5 text-indigo-400" />
    }
  }

  function handleAgregarItemGaleria() {
    if (!itemTitulo || !itemImagenUrl) {
      alert('Subí una imagen y escribí un título para el producto')
      return
    }
    const nuevo = {
      titulo: itemTitulo,
      precio: itemPrecio,
      imagen_url: itemImagenUrl
    }
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
    const { error } = await supabase
      .from('negocios')
      .update({
        nombre: nombreNegocio,
        ubicacion,
        descripcion,
        whatsapp,
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
        logo_url: logoUrl,
        galeria_detallada: galeria
      })
      .eq('id', negocio.id)

    setCargando(false)
    if (error) {
      alert('Error al guardar cambios: ' + error.message)
    } else {
      alert('¡Guardado exitosamente!')
      cargarDatos()
    }
  }

  const horariosDisponiblesManual = generarHorarios(horaApertura, horaCierre, intervaloMinutos)

  // Separación de turnos por estado
  const turnosPendientes = turnos.filter(t => t.estado === 'pendiente')
  const turnosConfirmados = turnos.filter(t => t.estado === 'confirmado')
  const turnosHistorial = turnos.filter(t => t.estado === 'finalizado')

  // Filtro de historial para balances
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* MENÚ DE COSTADO */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-600/30">
              {negocio?.nombre?.charAt(0) || 'A'}
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white leading-tight truncate max-w-[150px]">
                {negocio?.nombre || 'Administración'}
              </h1>
              <p className="text-[11px] text-slate-400">Panel de Control</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setTab('turnos')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                tab === 'turnos'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
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
                tab === 'servicios'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Scissors className="w-4 h-4 shrink-0" />
              <span>Gestor de Servicios</span>
            </button>

            <button
              onClick={() => setTab('horarios_catalogo')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                tab === 'horarios_catalogo'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Horarios & Catálogo</span>
            </button>

            <button
              onClick={() => setTab('marca')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                tab === 'marca'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4 shrink-0" />
              <span>Datos & Redes</span>
            </button>

            <button
              onClick={() => setTab('historial')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                tab === 'historial'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Historial & Balances</span>
            </button>
          </nav>

        </div>

        <div className="pt-4 border-t border-slate-800/80 mt-6 md:mt-0">
          <a
            href="/"
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700/60 transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Mi Página Web</span>
          </a>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-5xl">
        
        {/* PESTAÑA 1: TURNOS RESERVADOS */}
        {tab === 'turnos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <div>
                <h2 className="text-lg font-black text-white">Turnos Reservados</h2>
                <p className="text-xs text-slate-400">Confirmá las solicitudes entrantes y gestioná turnos confirmados</p>
              </div>
              <button
                onClick={() => setMostrarModalManual(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-600/20"
              >
                <UserPlus className="w-4 h-4" /> Nuevo Turno Manual
              </button>
            </div>

            {/* Modal Turno Manual */}
            {mostrarModalManual && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-sm text-white">Agendar Turno Manualmente</h3>
                  <button onClick={() => setMostrarModalManual(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleGuardarTurnoManual} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={manualNombre}
                        onChange={(e) => setManualNombre(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">WhatsApp</label>
                      <input
                        type="text"
                        value={manualWhatsapp}
                        onChange={(e) => setManualWhatsapp(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Servicio</label>
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
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Fecha</label>
                      <input
                        type="date"
                        min={fechaHoy}
                        value={manualFecha}
                        onChange={(e) => setManualFecha(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Horario</label>
                      <select
                        value={manualHora}
                        onChange={(e) => setManualHora(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                        required
                      >
                        <option value="">Seleccionar hora</option>
                        {horariosDisponiblesManual.map((h) => (
                          <option key={h} value={h}>{h} hs</option>
                        ))}
                      </select>
                    </div>
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

            {/* SECCIÓN 1: Solicitudes Pendientes */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                ⏳ Solicitudes Pendientes ({turnosPendientes.length})
              </h3>

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
                          <p className="text-xs text-indigo-400">WA: {t.cliente_whatsapp}</p>
                          <p className="text-xs text-slate-400">Servicio: {t.servicios?.nombre || 'General'}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="bg-slate-900 text-slate-200 text-xs px-3 py-1 rounded-xl font-bold block border border-slate-800">
                              {f.toLocaleDateString()} {f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                            </span>
                            <span className="text-xs font-black text-emerald-400 block mt-1">${t.monto_cobrado}</span>
                          </div>

                          <button
                            onClick={() => handleCambiarEstadoTurno(t.id, 'confirmado')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition shadow flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" /> Confirmar
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* SECCIÓN 2: Turnos Confirmados / Próximos */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                ✓ Turnos Confirmados & Próximos ({turnosConfirmados.length})
              </h3>

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
                          <p className="text-xs text-indigo-400">WA: {t.cliente_whatsapp}</p>
                          <p className="text-xs text-slate-400">Servicio: {t.servicios?.nombre || 'General'}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="bg-slate-900 text-slate-200 text-xs px-3 py-1 rounded-xl font-bold block border border-slate-800">
                              {f.toLocaleDateString()} {f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                            </span>
                            <span className="text-xs font-black text-emerald-400 block mt-1">${t.monto_cobrado}</span>
                          </div>

                          <button
                            onClick={() => handleCambiarEstadoTurno(t.id, 'finalizado')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition shadow flex items-center gap-1.5"
                            title="Mover turno al historial finalizado"
                          >
                            <CalendarCheck2 className="w-3.5 h-3.5" /> Finalizar Turno
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

        {/* PESTAÑA 2: GESTOR DE SERVICIOS */}
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
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-xs transition shadow-lg shadow-indigo-600/20"
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
                        className="p-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-xl border border-indigo-500/30 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEliminarServicio(s.id)}
                        className="p-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-xl border border-rose-500/30 transition"
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

        {/* PESTAÑA 3: HORARIOS & CATÁLOGO VISUAL */}
        {tab === 'horarios_catalogo' && (
          <form onSubmit={handleGuardarConfiguracion} className="space-y-6">
            {/* Configuración de Horarios */}
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
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Desde (Apertura)</label>
                  <input
                    type="time"
                    value={horaApertura}
                    onChange={(e) => setHoraApertura(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Hasta (Cierre)</label>
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
                    <option value={60}>Cada 60 min (1 h)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Catálogo Visual / Galería */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-400" />
                  Catálogo Visual / Galería de Trabajos
                </h2>
                <p className="text-xs text-slate-400">Subí fotos con título y precio opcional</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Título del trabajo o producto"
                    value={itemTitulo}
                    onChange={(e) => setItemTitulo(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Precio ($) Opcional"
                    value={itemPrecio}
                    onChange={(e) => setItemPrecio(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Seleccionar foto desde tu computadora o celular:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'catalogo')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-400"
                  />
                </div>

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
                      className="absolute top-2 right-2 bg-rose-600/90 text-white p-1.5 rounded-lg text-xs"
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

        {/* PESTAÑA 4: DATOS & REDES */}
        {tab === 'marca' && (
          <form onSubmit={handleGuardarConfiguracion} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
            <div>
              <h2 className="text-lg font-black text-white">Datos del Negocio, Redes & Diseño</h2>
              <p className="text-xs text-slate-400">Personalizá tu información de contacto, tipografías y enlaces</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nombre del Negocio</label>
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
                <label className="block text-xs font-bold text-slate-400 mb-1">WhatsApp para Notificaciones</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="5491122334455"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Descripción corta</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>

            {/* Selector de Fuentes y Tamaño de Letra */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                Tipografía y Tamaño de Letra
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Estilo de Letra</label>
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
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Tamaño de Texto</label>
                  <select
                    value={tamanoFuente}
                    onChange={(e) => setTamanoFuente(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="chico">Chico (Compacto)</option>
                    <option value="mediano">Mediano (Recomendado)</option>
                    <option value="grande">Grande (Destacado)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN REDES SOCIALES */}
            <div className="border-t border-slate-800 pt-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-400" />
                Enlaces de Redes Sociales
              </h3>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Nombre</label>
                    <input
                      type="text"
                      placeholder="Ej. Instagram"
                      value={redNombre}
                      onChange={(e) => setRedNombre(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Usuario / Número</label>
                    <input
                      type="text"
                      placeholder="@tu_usuario"
                      value={redUsuario}
                      onChange={(e) => setRedUsuario(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Enlace / URL directa</label>
                  <input
                    type="text"
                    placeholder="https://... (opcional)"
                    value={redUrl}
                    onChange={(e) => setRedUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAgregarRed}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-indigo-300 font-bold py-2.5 rounded-xl text-xs border border-indigo-500/30"
                >
                  + Agregar Red Social
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
                        <p className="text-[10px] text-slate-400 truncate">{r.usuarioODetalle}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEliminarRed(r.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-xl"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN DE COLORES & LOGO */}
            <div className="border-t border-slate-800 pt-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Diseño Visual</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Fondo Principal</label>
                  <input
                    type="color"
                    value={colorFondo}
                    onChange={(e) => setColorFondo(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Tarjeta Central</label>
                  <input
                    type="color"
                    value={colorCarta}
                    onChange={(e) => setColorCarta(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Botón Principal</label>
                  <input
                    type="color"
                    value={colorPrincipal}
                    onChange={(e) => setColorPrincipal(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Subir Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-lg"
            >
              Guardar Datos, Redes y Diseño
            </button>
          </form>
        )}

        {/* PESTAÑA 5: HISTORIAL & BALANCES */}
        {tab === 'historial' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    Historial & Balances Financieros
                  </h2>
                  <p className="text-xs text-slate-400">Estadísticas y facturación total de los turnos completados</p>
                </div>

                {/* Filtros de período */}
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setFiltroHistorial('todo')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      filtroHistorial === 'todo' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Todo
                  </button>
                  <button
                    onClick={() => setFiltroHistorial('semana')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      filtroHistorial === 'semana' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Por Semana
                  </button>
                  <button
                    onClick={() => setFiltroHistorial('dia')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      filtroHistorial === 'dia' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Por Día
                  </button>
                </div>
              </div>

              {/* Selector de fecha si filtra por día o semana */}
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

              {/* Tarjetas con Estadísticas de Plata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Facturación Total
                  </span>
                  <p className="text-2xl font-black text-emerald-400 tracking-tight">
                    ${totalRecaudado.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">Según el período seleccionado</p>
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
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Promedio / Ticket
                  </span>
                  <p className="text-2xl font-black text-indigo-400 tracking-tight">
                    ${promedioPorTurno.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">Por cada servicio cobrado</p>
                </div>
              </div>
            </div>

            {/* Listado de turnos finalizados */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
              <h3 className="text-sm font-bold text-slate-300">Detalle de Turnos en este Balance</h3>

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