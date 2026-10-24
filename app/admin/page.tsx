'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Calendar, 
  Settings, 
  Clock, 
  Plus, 
  Upload, 
  Check, 
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Share2,
  Pencil,
  X,
  ExternalLink,
  Globe
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
  titulo: string
  url: string
}

export default function AdminPage() {
  const [tab, setTab] = useState<'turnos' | 'servicios' | 'marca'>('turnos')
  const [negocio, setNegocio] = useState<any>(null)
  const [turnos, setTurnos] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)

  // Formulario Nuevo / Edición Servicio
  const [servicioEditandoId, setServicioEditandoId] = useState<string | null>(null)
  const [nomServicio, setNomServicio] = useState('')
  const [precioServicio, setPrecioServicio] = useState('')
  const [duracionServicio, setDuracionServicio] = useState('30')

  // Formulario Edición de Página / Estilos
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  // Gestor de Redes Sociales
  const [redes, setRedes] = useState<RedItem[]>([])
  const [redPlataforma, setRedPlataforma] = useState<RedItem['plataforma']>('instagram')
  const [redTitulo, setRedTitulo] = useState('')
  const [redUrl, setRedUrl] = useState('')

  const [colorPrincipal, setColorPrincipal] = useState('#6366f1')
  const [colorFondo, setColorFondo] = useState('#0f172a')
  const [colorCarta, setColorCarta] = useState('#ffffff')
  const [tipoFuente, setTipoFuente] = useState('sans-serif')
  const [tipoFondo, setTipoFondo] = useState('color')
  const [fondoImagenUrl, setFondoImagenUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  // Catálogo Visual / Galería
  const [galeria, setGaleria] = useState<any[]>([])
  const [itemTitulo, setItemTitulo] = useState('')
  const [itemPrecio, setItemPrecio] = useState('')
  const [itemImagenUrl, setItemImagenUrl] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    const { data: negData } = await supabase.from('negocios').select('*').limit(1).single()
    if (negData) {
      setNegocio(negData)
      setNombreNegocio(negData.nombre || '')
      setUbicacion(negData.ubicacion || '')
      setDescripcion(negData.descripcion || '')
      setWhatsapp(negData.whatsapp || '')

      // Cargar redes sociales guardadas
      if (Array.isArray(negData.redes_sociales) && negData.redes_sociales.length > 0) {
        setRedes(negData.redes_sociales)
      } else {
        // Migración automática de campos sueltos viejos si existen
        const iniciales: RedItem[] = []
        if (negData.whatsapp) {
          iniciales.push({
            id: 'wa-1',
            plataforma: 'whatsapp',
            titulo: 'WhatsApp Directo',
            url: `https://wa.me/${negData.whatsapp.replace(/\D/g, '')}`
          })
        }
        if (negData.instagram || negData.instagram_username) {
          const u = (negData.instagram || negData.instagram_username).replace('@', '')
          iniciales.push({
            id: 'ig-1',
            plataforma: 'instagram',
            titulo: `@${u}`,
            url: `https://instagram.com/${u}`
          })
        }
        if (negData.tiktok || negData.tiktok_username) {
          const t = (negData.tiktok || negData.tiktok_username).replace('@', '')
          iniciales.push({
            id: 'tk-1',
            plataforma: 'tiktok',
            titulo: `@${t}`,
            url: `https://tiktok.com/@${t}`
          })
        }
        if (negData.facebook) {
          iniciales.push({
            id: 'fb-1',
            plataforma: 'facebook',
            titulo: 'Facebook',
            url: negData.facebook.startsWith('http') ? negData.facebook : `https://facebook.com/${negData.facebook}`
          })
        }
        if (negData.linkedin) {
          iniciales.push({
            id: 'lk-1',
            plataforma: 'linkedin',
            titulo: 'LinkedIn',
            url: negData.linkedin.startsWith('http') ? negData.linkedin : `https://linkedin.com/in/${negData.linkedin}`
          })
        }
        setRedes(iniciales)
      }

      setColorPrincipal(negData.color_principal || '#6366f1')
      setColorFondo(negData.color_fondo || '#0f172a')
      setColorCarta(negData.color_carta || '#ffffff')
      setTipoFuente(negData.tipo_fuente || 'sans-serif')
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

      if (servData) setServicios(servData)
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

  async function handleConfirmarTurno(turnoId: string) {
    setCargando(true)
    const { error } = await supabase
      .from('turnos')
      .update({ estado: 'confirmado' })
      .eq('id', turnoId)

    setCargando(false)
    if (error) {
      alert('Error al confirmar turno: ' + error.message)
    } else {
      alert('¡Turno confirmado con éxito!')
      cargarDatos()
    }
  }

  // GESTOR DE SERVICIOS
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
        alert('Error al editar servicio: ' + error.message)
      } else {
        cancelarEdicionServicio()
        alert('¡Servicio actualizado!')
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
        alert('Error al guardar servicio: ' + error.message)
      } else {
        setNomServicio('')
        setPrecioServicio('')
        setDuracionServicio('30')
        alert('¡Servicio guardado con éxito!')
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
      alert('Error al eliminar servicio: ' + error.message)
    } else {
      cargarDatos()
    }
  }

  // GESTOR DE REDES SOCIALES
  function handleAgregarRed() {
    if (!redUrl.trim()) {
      alert('Por favor ingresá la URL o enlace directo de la red')
      return
    }

    let urlFinal = redUrl.trim()
    if (redPlataforma === 'whatsapp') {
      const num = urlFinal.replace(/\D/g, '')
      if (!urlFinal.startsWith('http')) {
        urlFinal = `https://wa.me/${num}`
      }
    } else if (!urlFinal.startsWith('http://') && !urlFinal.startsWith('https://')) {
      if (redPlataforma === 'instagram') urlFinal = `https://instagram.com/${urlFinal.replace('@', '')}`
      else if (redPlataforma === 'tiktok') urlFinal = `https://tiktok.com/@${urlFinal.replace('@', '')}`
      else if (redPlataforma === 'facebook') urlFinal = `https://facebook.com/${urlFinal}`
      else if (redPlataforma === 'linkedin') urlFinal = `https://linkedin.com/in/${urlFinal}`
      else if (redPlataforma === 'youtube') urlFinal = `https://youtube.com/@${urlFinal.replace('@', '')}`
      else urlFinal = `https://${urlFinal}`
    }

    const defaultTitulos: Record<RedItem['plataforma'], string> = {
      whatsapp: 'WhatsApp Directo',
      instagram: 'Instagram Oficial',
      facebook: 'Página de Facebook',
      tiktok: 'TikTok',
      linkedin: 'Perfil de LinkedIn',
      youtube: 'Canal de YouTube',
      web: 'Sitio Web'
    }

    const nuevoItem: RedItem = {
      id: `${Date.now()}`,
      plataforma: redPlataforma,
      titulo: redTitulo.trim() || defaultTitulos[redPlataforma],
      url: urlFinal
    }

    setRedes([...redes, nuevoItem])
    setRedTitulo('')
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

  // GALERÍA
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

  // GUARDAR TODO
  async function handleGuardarMarca(e: React.FormEvent) {
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
        redes_sociales: redes,
        color_principal: colorPrincipal,
        color_fondo: colorFondo,
        color_carta: colorCarta,
        tipo_fuente: tipoFuente,
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
      alert('¡Todos los cambios de redes, diseño y fotos fueron guardados!')
      cargarDatos()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center bg-slate-800 p-6 rounded-3xl border border-slate-700">
          <div>
            <h1 className="text-2xl font-black text-white">Panel Administrador</h1>
            <p className="text-xs text-slate-400 mt-1">Configura todo tu sitio web desde aquí</p>
          </div>
          <a href="/" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold">
            Ver Mi Página 🚀
          </a>
        </div>

        {/* Pestañas */}
        <div className="flex gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setTab('turnos')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition ${
              tab === 'turnos' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Turnos Reservados
          </button>
          <button
            onClick={() => setTab('servicios')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition ${
              tab === 'servicios' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Gestor de Servicios
          </button>
          <button
            onClick={() => setTab('marca')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition ${
              tab === 'marca' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Edición de página & Redes
          </button>
        </div>

        {/* PESTAÑA 1: TURNOS */}
        {tab === 'turnos' && (
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
            <h2 className="text-lg font-bold text-white">Listado de Reservas</h2>
            <div className="space-y-3">
              {turnos.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No hay reservas guardadas.</p>
              ) : (
                turnos.map((t) => {
                  const f = new Date(t.fecha_hora)
                  const esConfirmado = t.estado === 'confirmado'
                  return (
                    <div key={t.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 flex justify-between items-center flex-wrap gap-3">
                      <div>
                        <p className="font-bold text-sm text-white">{t.cliente_nombre}</p>
                        <p className="text-xs text-indigo-400">WhatsApp: {t.cliente_whatsapp}</p>
                        <p className="text-xs text-slate-400">Servicio: {t.servicios?.nombre || 'General'}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <span className="bg-slate-800 text-slate-200 text-xs px-3 py-1 rounded-xl font-bold block border border-slate-700">
                            {f.toLocaleDateString()} {f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                          </span>
                          <span className="text-xs font-black text-emerald-400 block mt-1">${t.monto_cobrado}</span>
                        </div>

                        {esConfirmado ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConfirmarTurno(t.id)}
                            disabled={cargando}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition shadow-md"
                          >
                            Confirmar Turno
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: SERVICIOS */}
        {tab === 'servicios' && (
          <div className="space-y-6">
            <form onSubmit={handleGuardarServicio} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">
                  {servicioEditandoId ? '✏️ Editar Servicio' : '➕ Agregar Nuevo Servicio'}
                </h2>
                {servicioEditandoId && (
                  <button
                    type="button"
                    onClick={cancelarEdicionServicio}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700"
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar Edición
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nombre del servicio"
                  value={nomServicio}
                  onChange={(e) => setNomServicio(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Precio ($)"
                  value={precioServicio}
                  onChange={(e) => setPrecioServicio(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Tiempo estimado (min)"
                  value={duracionServicio}
                  onChange={(e) => setDuracionServicio(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md"
              >
                {cargando ? 'Guardando...' : servicioEditandoId ? 'Actualizar Servicio' : 'Guardar Servicio'}
              </button>
            </form>

            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3">
              <h3 className="text-sm font-bold text-slate-400">Listado de Servicios Activos</h3>
              {servicios.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No tenés servicios agregados.</p>
              ) : (
                servicios.map((s) => (
                  <div key={s.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
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
                        title="Editar servicio"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEliminarServicio(s.id)}
                        className="p-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-xl border border-rose-500/30 transition"
                        title="Eliminar servicio"
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

        {/* PESTAÑA 3: EDICIÓN DE PÁGINA & REDES */}
        {tab === 'marca' && (
          <form onSubmit={handleGuardarMarca} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-6">
            <h2 className="text-lg font-bold text-white">Edición de página y Estilos</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nombre del Negocio</label>
                <input
                  type="text"
                  value={nombreNegocio}
                  onChange={(e) => setNombreNegocio(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Ubicación</label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">WhatsApp para Notificaciones de Turnos</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej: 5491122334455"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Tipo de Letra / Tipografía</label>
                <select
                  value={tipoFuente}
                  onChange={(e) => setTipoFuente(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
                >
                  <option value="sans-serif">Sans-Serif Moderno</option>
                  <option value="serif">Serif Elegante</option>
                  <option value="monospace">Monospace Técnico</option>
                  <option value="cursive">Cursive Cursiva</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white h-20"
              />
            </div>

            {/* SECCIÓN REDES SOCIALES: NOMBRE + URL DIRECTA */}
            <div className="border-t border-slate-700 pt-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  Botones y Enlaces de Redes Sociales
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Podés definir el nombre visible del botón (o tu @usuario) y la URL exacta a donde dirigirá al cliente.
                </p>
              </div>

              {/* Formulario para agregar una red */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Plataforma</label>
                    <select
                      value={redPlataforma}
                      onChange={(e) => setRedPlataforma(e.target.value as RedItem['plataforma'])}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="tiktok">TikTok</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="youtube">YouTube</option>
                      <option value="web">Sitio Web / Link Libre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Texto o Nombre / @ (Visible)</label>
                    <input
                      type="text"
                      placeholder="Ej: @tu_marca o Seguinos"
                      value={redTitulo}
                      onChange={(e) => setRedTitulo(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Enlace / URL de Destino (Link)</label>
                    <input
                      type="text"
                      placeholder="https://... o tu usuario"
                      value={redUrl}
                      onChange={(e) => setRedUrl(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAgregarRed}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold py-2.5 rounded-xl text-xs border border-indigo-500/30 flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Agregar Red Social a la Página
                </button>
              </div>

              {/* Lista de redes añadidas */}
              <div className="space-y-2">
                {redes.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3 bg-slate-900/50 rounded-xl">
                    No agregaste ninguna red todavía.
                  </p>
                ) : (
                  redes.map((r) => (
                    <div key={r.id} className="bg-slate-900 p-3.5 rounded-2xl border border-slate-700 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                          {renderIconoRed(r.plataforma)}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{r.titulo}</p>
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{r.url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEliminarRed(r.id)}
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition shrink-0"
                        title="Eliminar red"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECCIÓN DE COLORES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Color Fondo Principal</label>
                <input
                  type="color"
                  value={colorFondo}
                  onChange={(e) => setColorFondo(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Color Carta / Tarjeta</label>
                <input
                  type="color"
                  value={colorCarta}
                  onChange={(e) => setColorCarta(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Color Botón Acción</label>
                <input
                  type="color"
                  value={colorPrincipal}
                  onChange={(e) => setColorPrincipal(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer"
                />
              </div>
            </div>

            {/* FOTO DE FONDO */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-400">Usar Imagen de Fondo en la Web</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTipoFondo('color')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold ${tipoFondo === 'color' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                  Usar Color
                </button>
                <button
                  type="button"
                  onClick={() => setTipoFondo('imagen')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold ${tipoFondo === 'imagen' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                  Usar Imagen
                </button>
              </div>

              {tipoFondo === 'imagen' && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'fondo')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-400 mt-2"
                />
              )}
            </div>

            {/* FOTO DE LOGO */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Subir Logo desde el Dispositivo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'logo')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-400"
              />
            </div>

            {/* CATÁLOGO VISUAL / GALERÍA */}
            <div className="border-t border-slate-700 pt-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                Catálogo Visual de Productos / Fotos con Precio
              </h3>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Título del Producto / Trabajo"
                    value={itemTitulo}
                    onChange={(e) => setItemTitulo(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Precio ($) Opcional"
                    value={itemPrecio}
                    onChange={(e) => setItemPrecio(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Seleccionar foto desde tu dispositivo:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'catalogo')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-400"
                  />
                </div>

                {itemImagenUrl && (
                  <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-xl">
                    <img src={itemImagenUrl} alt="Vista previa" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="text-xs text-emerald-400 font-bold">✓ Imagen lista para agregar</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAgregarItemGaleria}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold py-2.5 rounded-xl text-xs border border-indigo-500/30"
                >
                  + Agregar Foto al Catálogo
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galeria.map((item, index) => (
                  <div key={index} className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden relative">
                    <img src={item.imagen_url} alt={item.titulo} className="w-full h-28 object-cover" />
                    <div className="p-2 space-y-1">
                      <p className="font-bold text-xs text-white truncate">{item.titulo}</p>
                      {item.precio && <p className="text-xs text-emerald-400 font-black">${item.precio}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEliminarItemGaleria(index)}
                      className="absolute top-2 right-2 bg-rose-600/90 text-white p-1.5 rounded-lg text-xs"
                      title="Eliminar foto"
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
              {cargando ? 'Guardando...' : 'Guardar Todos los Cambios'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}