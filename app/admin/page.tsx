'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  BarChart3, 
  Palette, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Edit3,
  Briefcase,
  Sparkles,
  Check,
  Type,
  Layout,
  Share2,
  X,
  Image as ImageIcon,
  Save
} from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const TEMAS_PREDISEÑADOS = [
  { nombre: 'Estética Rose Gold', principal: '#e11d48', fondo: '#fff1f2', tipoFondo: 'color', fuente: 'Playfair Display' },
  { nombre: 'Barbería Dark Mística', principal: '#f59e0b', fondo: '#0f172a', tipoFondo: 'degradado', degradado: 'linear-gradient(to bottom, #1e293b, #0f172a)', fuente: 'Montserrat' },
  { nombre: 'Minimalista Neón', principal: '#6366f1', fondo: '#090d16', tipoFondo: 'degradado', degradado: 'linear-gradient(to bottom, #111827, #030712)', fuente: 'Plus Jakarta Sans' },
  { nombre: 'Menta Refresh', principal: '#10b981', fondo: '#f0fdf4', tipoFondo: 'degradado', degradado: 'linear-gradient(to bottom, #f0fdf4, #dcfce7)', fuente: 'Plus Jakarta Sans' },
  { nombre: 'Calidez Dorada', principal: '#d97706', fondo: '#fefce8', tipoFondo: 'degradado', degradado: 'linear-gradient(to bottom, #fefce8, #fef9c3)', fuente: 'Playfair Display' }
]

export default function AdminDashboardPage() {
  const [seccion, setSeccion] = useState<'metricas' | 'editor' | 'servicios' | 'galeria'>('metricas')
  const [periodoMétricas, setPeriodoMétricas] = useState<'hoy' | 'semana' | 'mes'>('semana')
  
  const [negocio, setNegocio] = useState<any>(null)
  const [turnos, setTurnos] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  // Estado Formulario Servicio (Crear/Editar)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nombreServicio, setNombreServicio] = useState('')
  const [precioServicio, setPrecioServicio] = useState('')
  const [duracionServicio, setDuracionServicio] = useState('30')

  // Estado Galería Detallada
  const [galeria, setGaleria] = useState<any[]>([])
  const [nuevaFotoUrl, setNuevaFotoUrl] = useState('')
  const [nuevaFotoTitulo, setNuevaFotoTitulo] = useState('')
  const [nuevaFotoPrecio, setNuevaFotoPrecio] = useState('')

  // Estado Súper Editor Visual
  const [colorPrincipal, setColorPrincipal] = useState('#e11d48')
  const [colorFondo, setColorFondo] = useState('#fff1f2')
  const [tipoFondo, setTipoFondo] = useState('color')
  const [fondoDegradado, setFondoDegradado] = useState('linear-gradient(to bottom, #fff1f2, #ffe4e6)')
  const [tipoFuente, setTipoFuente] = useState('Plus Jakarta Sans')
  const [tamanoTitulo, setTamanoTitulo] = useState('text-2xl')
  const [bordesRedondeados, setBordesRedondeados] = useState('rounded-3xl')
  const [redesSociales, setRedesSociales] = useState<any[]>([])
  const [nuevaRedTipo, setNuevaRedTipo] = useState('instagram')
  const [nuevaRedTitulo, setNuevaRedTitulo] = useState('')
  const [nuevaRedUrl, setNuevaRedUrl] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    const { data: negData } = await supabase.from('negocios').select('*').limit(1).single()

    if (negData) {
      setNegocio(negData)
      setColorPrincipal(negData.color_principal || '#e11d48')
      setColorFondo(negData.color_fondo || '#fff1f2')
      setTipoFondo(negData.tipo_fondo || 'color')
      setFondoDegradado(negData.fondo_degradado || 'linear-gradient(to bottom, #fff1f2, #ffe4e6)')
      setTipoFuente(negData.tipo_fuente || 'Plus Jakarta Sans')
      setTamanoTitulo(negData.tamano_titulo || 'text-2xl')
      setBordesRedondeados(negData.bordes_redondeados || 'rounded-3xl')
      setRedesSociales(negData.redes_sociales || [])
      setGaleria(negData.galeria_detallada || [])

      const { data: servData } = await supabase.from('servicios').select('*').eq('negocio_id', negData.id)
      if (servData) setServicios(servData)

      const { data: turnosData } = await supabase.from('turnos').select('*, servicios(nombre, precio)').eq('negocio_id', negData.id).order('created_at', { ascending: false })
      if (turnosData) setTurnos(turnosData)
    }
    setCargando(false)
  }

  // --- GESTIÓN DE SERVICIOS (CREAR Y EDITAR) ---
  const handleGuardarServicio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreServicio || !precioServicio) return

    if (editandoId) {
      // Editar
      await supabase.from('servicios').update({
        nombre: nombreServicio,
        precio: parseFloat(precioServicio),
        duracion_minutos: parseInt(duracionServicio)
      }).eq('id', editandoId)
    } else {
      // Crear
      await supabase.from('servicios').insert([{
        negocio_id: negocio.id,
        nombre: nombreServicio,
        precio: parseFloat(precioServicio),
        duracion_minutos: parseInt(duracionServicio),
        activo: true
      }])
    }

    setEditandoId(null)
    setNombreServicio('')
    setPrecioServicio('')
    setDuracionServicio('30')
    cargarDatos()
  }

  const handleEditarServicioClick = (s: any) => {
    setEditandoId(s.id)
    setNombreServicio(s.nombre)
    setPrecioServicio(s.precio.toString())
    setDuracionServicio(s.duracion_minutos.toString())
  }

  const handleEliminarServicio = async (id: string) => {
    if (confirm('¿Seguro que querés eliminar este servicio?')) {
      await supabase.from('servicios').delete().eq('id', id)
      cargarDatos()
    }
  }

  // --- GESTIÓN DE GALERÍA DE FOTOS DETALLADA ---
  const handleAgregarFotoGaleria = async () => {
    if (!nuevaFotoUrl || !nuevaFotoTitulo) return
    const nuevaLista = [...galeria, {
      titulo: nuevaFotoTitulo,
      precio: nuevaFotoPrecio,
      imagen_url: nuevaFotoUrl
    }]
    setGaleria(nuevaLista)
    await supabase.from('negocios').update({ galeria_detallada: nuevaLista }).eq('id', negocio.id)
    setNuevaFotoUrl('')
    setNuevaFotoTitulo('')
    setNuevaFotoPrecio('')
  }

  const handleEliminarFotoGaleria = async (index: number) => {
    const nuevaLista = galeria.filter((_, i) => i !== index)
    setGaleria(nuevaLista)
    await supabase.from('negocios').update({ galeria_detallada: nuevaLista }).eq('id', negocio.id)
  }

  // --- GESTIÓN DE REDES SOCIALES ---
  const handleAgregarRed = () => {
    if (!nuevaRedTitulo || !nuevaRedUrl) return
    const lista = [...redesSociales, { tipo: nuevaRedTipo, titulo: nuevaRedTitulo, url: nuevaRedUrl }]
    setRedesSociales(lista)
    setNuevaRedTitulo('')
    setNuevaRedUrl('')
  }

  const handleEliminarRed = (index: number) => {
    setRedesSociales(redesSociales.filter((_, i) => i !== index))
  }

  // --- APLICAR TEMA PRE-DISEÑADO ---
  const handleAplicarTema = (tema: any) => {
    setColorPrincipal(tema.principal)
    setColorFondo(tema.fondo)
    setTipoFondo(tema.tipoFondo)
    if (tema.degradado) setFondoDegradado(tema.degradado)
    setTipoFuente(tema.fuente)
  }

  // --- GUARDAR EDITOR DE MARCA ---
  const handlePublicarEstilos = async () => {
    setGuardando(true)
    await supabase.from('negocios').update({
      color_principal: colorPrincipal,
      color_fondo: colorFondo,
      tipo_fondo: tipoFondo,
      fondo_degradado: fondoDegradado,
      tipo_fuente: tipoFuente,
      tamano_titulo: tamanoTitulo,
      bordes_redondeados: bordesRedondeados,
      redes_sociales: redesSociales
    }).eq('id', negocio.id)
    setGuardando(false)
    alert('¡Diseño actualizado y publicado en vivo!')
  }

  const turnosFiltrados = turnos.filter(t => {
    const fecha = new Date(t.created_at)
    const ahora = new Date()
    if (periodoMétricas === 'hoy') return fecha.toDateString() === ahora.toDateString()
    if (periodoMétricas === 'semana') {
      const hace7 = new Date(ahora.setDate(ahora.getDate() - 7))
      return fecha >= hace7
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR LATERAL NATIVO */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800/80 p-5 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-rose-500/20">
              F
            </div>
            <div>
              <p className="font-extrabold text-sm text-white">{negocio?.nombre || 'Mi Comercio'}</p>
              <p className="text-[10px] text-slate-400">Panel Administrador Pro</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setSeccion('metricas')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                seccion === 'metricas' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Rendimiento & Turnos</span>
            </button>

            <button
              onClick={() => setSeccion('servicios')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                seccion === 'servicios' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Gestor de Servicios</span>
            </button>

            <button
              onClick={() => setSeccion('galeria')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                seccion === 'galeria' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Fotos & Catálogo</span>
            </button>

            <button
              onClick={() => setSeccion('editor')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                seccion === 'editor' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Constructor de Marca</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80">
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
        
        {/* SECCIÓN 1: MÉTRICAS Y RESERVAS */}
        {seccion === 'metricas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
              <div>
                <h2 className="text-xl font-extrabold text-white">Reportes de Facturación</h2>
                <p className="text-xs text-slate-400">Control de ingresos y turnos</p>
              </div>

              <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                {(['hoy', 'semana', 'mes'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodoMétricas(p)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                      periodoMétricas === p ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facturación ({periodoMétricas})</p>
                <p className="text-3xl font-black text-emerald-400 mt-2">${facturacionTotal.toLocaleString('es-AR')}</p>
              </div>
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Turnos</p>
                <p className="text-3xl font-black text-rose-400 mt-2">{turnosFiltrados.length}</p>
              </div>
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Servicios Activos</p>
                <p className="text-3xl font-black text-indigo-400 mt-2">{servicios.length}</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Listado de Reservas</h3>
              {turnosFiltrados.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">No hay reservas registradas.</p>
              ) : (
                <div className="space-y-2">
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

        {/* SECCIÓN 2: GESTOR DE SERVICIOS (CREAR Y EDITAR FUNCIONANDO) */}
        {seccion === 'servicios' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white">
                {editandoId ? 'Editar Servicio' : 'Cargar Nuevo Servicio / Producto'}
              </h2>
              
              <form onSubmit={handleGuardarServicio} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Nombre (ej. Kapping Gel)"
                  value={nombreServicio}
                  onChange={(e) => setNombreServicio(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none col-span-2"
                />
                <input
                  type="number"
                  placeholder="Precio ($)"
                  value={precioServicio}
                  onChange={(e) => setPrecioServicio(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  {editandoId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editandoId ? 'Guardar Cambios' : 'Agregar'}</span>
                </button>
              </form>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-300">Servicios Activos</h3>
              <div className="space-y-2">
                {servicios.map((s) => (
                  <div key={s.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white text-sm">{s.nombre}</p>
                      <p className="text-slate-400">{s.duracion_minutos} min de sesión</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-emerald-400 text-sm">${s.precio}</span>
                      <button
                        onClick={() => handleEditarServicioClick(s)}
                        className="text-slate-400 hover:text-white p-1"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminarServicio(s.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Eliminar"
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

        {/* SECCIÓN 3: GALERÍA Y CATÁLOGO DETALLADO */}
        {seccion === 'galeria' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white">Agregar Foto al Catálogo con Descripción y Precio</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="url"
                  placeholder="URL de la Imagen (ej. https://...)"
                  value={nuevaFotoUrl}
                  onChange={(e) => setNuevaFotoUrl(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Nombre / Descripción Trabajo"
                  value={nuevaFotoTitulo}
                  onChange={(e) => setNuevaFotoTitulo(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Precio ($) Opcional"
                  value={nuevaFotoPrecio}
                  onChange={(e) => setNuevaFotoPrecio(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                onClick={handleAgregarFotoGaleria}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar al Catálogo Visual</span>
              </button>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-300">Catálogo Publicado</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {galeria.map((item: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative group">
                    <img src={item.imagen_url} alt={item.titulo} className="w-full h-36 object-cover" />
                    <button
                      onClick={() => handleEliminarFotoGaleria(idx)}
                      className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg opacity-80 hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-3">
                      <p className="font-bold text-white text-xs">{item.titulo}</p>
                      {item.precio && <p className="text-emerald-400 font-extrabold text-xs mt-1">${item.precio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN 4: SÚPER CONSTRUCTOR DE MARCA PRO */}
        {seccion === 'editor' && (
          <div className="space-y-6 max-w-4xl">
            
            {/* Plantillas Pre-diseñadas */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Plantillas & Temas Rápidos
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {TEMAS_PREDISEÑADOS.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAplicarTema(t)}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left hover:border-rose-500 transition text-xs font-bold text-slate-300 space-y-1"
                  >
                    <div className="w-full h-3 rounded-md" style={{ backgroundColor: t.principal }}></div>
                    <p className="truncate text-[11px]">{t.nombre}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Opciones Avanzadas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-900 rounded-3xl p-6 border border-slate-800">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider">Tipografía & Estilo</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Fuente Principal</label>
                  <select
                    value={tipoFuente}
                    onChange={(e) => setTipoFuente(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  >
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Ultra Limpia)</option>
                    <option value="Playfair Display">Playfair Display (Elegante / Lujo)</option>
                    <option value="Montserrat">Montserrat (Urbana / Barbería)</option>
                    <option value="Space Grotesk">Space Grotesk (Moderna / Tech)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Forma de Botones</label>
                  <select
                    value={bordesRedondeados}
                    onChange={(e) => setBordesRedondeados(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  >
                    <option value="rounded-none">Rectos (Cuadrados)</option>
                    <option value="rounded-2xl">Redondeado Clásico</option>
                    <option value="rounded-3xl">Curva Suave</option>
                    <option value="rounded-full">Cápsula / Píldora</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider">Colores Personalizados</h3>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorPrincipal}
                    onChange={(e) => setColorPrincipal(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer p-1"
                  />
                  <span className="text-xs text-slate-300 font-mono">Color Principal ({colorPrincipal})</span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorFondo}
                    onChange={(e) => setColorFondo(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer p-1"
                  />
                  <span className="text-xs text-slate-300 font-mono">Color de Fondo ({colorFondo})</span>
                </div>
              </div>
            </div>

            {/* Gestor de Redes Sociales */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Redes Sociales & Links Ilimitados</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={nuevaRedTipo}
                  onChange={(e) => setNuevaRedTipo(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                >
                  <option value="instagram">Instagram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="tiktok">TikTok</option>
                  <option value="web">Sitio Web / CBU</option>
                </select>

                <input
                  type="text"
                  placeholder="Título (ej. Instagram Oficial)"
                  value={nuevaRedTitulo}
                  onChange={(e) => setNuevaRedTitulo(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />

                <input
                  type="url"
                  placeholder="URL Completa (ej. https://...)"
                  value={nuevaRedUrl}
                  onChange={(e) => setNuevaRedUrl(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                onClick={handleAgregarRed}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition"
              >
                + Agregar Red Social
              </button>

              <div className="space-y-2 pt-2">
                {redesSociales.map((r, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{r.titulo}</p>
                      <p className="text-slate-500 text-[10px]">{r.url}</p>
                    </div>
                    <button onClick={() => handleEliminarRed(i)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handlePublicarEstilos}
              disabled={guardando}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl text-sm transition shadow-lg shadow-rose-500/20 disabled:opacity-50"
            >
              {guardando ? 'Publicando...' : 'Publicar Todo en Vivo 🚀'}
            </button>

          </div>
        )}

      </main>

    </div>
  )
}