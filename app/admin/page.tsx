'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Calendar, 
  Settings, 
  Clock, 
  DollarSign, 
  Plus, 
  Trash2, 
  Upload, 
  MapPin, 
  AlignLeft, 
  Check, 
  Layout, 
  Type,
  ShieldCheck
} from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AdminPage() {
  const [tab, setTab] = useState<'turnos' | 'servicios' | 'marca'>('turnos')
  const [negocio, setNegocio] = useState<any>(null)
  const [turnos, setTurnos] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)

  // Formulario Nuevo Servicio
  const [nomServicio, setNomServicio] = useState('')
  const [precioServicio, setPrecioServicio] = useState('')
  const [duracionServicio, setDuracionServicio] = useState('30')
  const [reqSena, setReqSena] = useState(false)
  const [montoSena, setMontoSena] = useState('0')

  // Formulario Edición de Página
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [colorPrincipal, setColorPrincipal] = useState('#6366f1')
  const [tamanoFuente, setTamanoFuente] = useState('mediano')
  const [logoUrl, setLogoUrl] = useState('')

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
      setColorPrincipal(negData.color_principal || '#6366f1')
      setTamanoFuente(negData.tamano_fuente || 'mediano')
      setLogoUrl(negData.logo_url || '')

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

      if (servData) setServicios(servData)
    }
  }

  // Subir Fotos desde el Dispositivo
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, tipo: 'logo' | 'servicio') {
    const file = e.target.files?.[0]
    if (!file) return

    setCargando(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('facilapp-uploads')
      .upload(filePath, file)

    if (uploadError) {
      alert('Error al subir la imagen: ' + uploadError.message)
      setCargando(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('facilapp-uploads')
      .getPublicUrl(filePath)

    setCargando(false)
    if (tipo === 'logo') {
      setLogoUrl(publicUrlData.publicUrl)
    }
    alert('Imagen cargada con éxito')
  }

  // Guardar Servicio
  async function handleAgregarServicio(e: React.FormEvent) {
    e.preventDefault()
    if (!nomServicio || !precioServicio || !negocio) return

    setCargando(true)
    const { error } = await supabase.from('servicios').insert([
      {
        negocio_id: negocio.id,
        nombre: nomServicio,
        precio: parseFloat(precioServicio),
        duracion_minutos: parseInt(duracionServicio),
        requiere_seña: reqSena,
        monto_seña: parseFloat(montoSena) || 0,
        activo: true
      }
    ])

    setCargando(false)
    if (error) {
      alert('Error al agregar servicio: ' + error.message)
    } else {
      setNomServicio('')
      setPrecioServicio('')
      setDuracionServicio('30')
      setReqSena(false)
      setMontoSena('0')
      cargarDatos()
    }
  }

  // Guardar Edición de Página
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
        color_principal: colorPrincipal,
        tamano_fuente: tamanoFuente,
        logo_url: logoUrl
      })
      .eq('id', negocio.id)

    setCargando(false)
    if (error) {
      alert('Error al guardar cambios: ' + error.message)
    } else {
      alert('¡Configuración guardada correctamente!')
      cargarDatos()
    }
  }

  // Aplicar Plantilla Pro
  async function aplicarPlantilla(plantilla: string) {
    let config = {}
    if (plantilla === 'glass') {
      config = {
        tipo_fondo: 'degradado',
        fondo_degradado: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        color_principal: '#818cf8',
        bordes_redondeados: 'rounded-3xl'
      }
    } else if (plantilla === 'neon') {
      config = {
        tipo_fondo: 'color',
        color_fondo: '#09090b',
        color_principal: '#f43f5e',
        bordes_redondeados: 'rounded-xl'
      }
    } else if (plantilla === 'minimal') {
      config = {
        tipo_fondo: 'degradado',
        fondo_degradado: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
        color_principal: '#0f172a',
        bordes_redondeados: 'rounded-2xl'
      }
    }

    const { error } = await supabase.from('negocios').update(config).eq('id', negocio.id)
    if (!error) {
      alert('Plantilla ' + plantilla + ' aplicada')
      cargarDatos()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-white">Panel de Control</h1>
            <p className="text-xs text-slate-400 mt-1">Administra tus turnos, servicios y aspecto visual</p>
          </div>
          <a
            href="/"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-indigo-600/30"
          >
            Ver Mi Página 🚀
          </a>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setTab('turnos')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              tab === 'turnos' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Turnos Reservados
          </button>

          <button
            onClick={() => setTab('servicios')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              tab === 'servicios' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Gestor de Servicios
          </button>

          <button
            onClick={() => setTab('marca')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              tab === 'marca' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            Edición de página
          </button>
        </div>

        {/* CONTENIDO 1: TURNOS RESERVADOS */}
        {tab === 'turnos' && (
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Listado de Reservas
            </h2>

            <div className="space-y-3">
              {turnos.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No hay reservas registradas aún.</p>
              ) : (
                turnos.map((t) => {
                  const fechaObj = new Date(t.fecha_hora)
                  const dia = fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  const hora = fechaObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

                  return (
                    <div key={t.id} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-white">{t.cliente_nombre}</p>
                        <p className="text-xs text-indigo-400 font-semibold">📞 WhatsApp: {t.cliente_whatsapp}</p>
                        <p className="text-xs text-slate-400">
                          Servicio: <span className="text-slate-200">{t.servicios?.nombre || 'General'}</span>
                        </p>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="bg-slate-800 text-slate-200 text-xs px-3 py-1 rounded-xl font-bold border border-slate-700 block">
                          📅 {dia} - ⏰ {hora} hs
                        </span>
                        <span className="text-xs font-black text-emerald-400 block">${t.monto_cobrado}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* CONTENIDO 2: GESTOR DE SERVICIOS */}
        {tab === 'servicios' && (
          <div className="space-y-6">
            {/* Formulario Agregar Servicio */}
            <form onSubmit={handleAgregarServicio} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Agregar Nuevo Servicio
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nombre del servicio"
                  value={nomServicio}
                  onChange={(e) => setNomServicio(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none"
                  required
                />

                <input
                  type="number"
                  placeholder="Precio ($)"
                  value={precioServicio}
                  onChange={(e) => setPrecioServicio(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none"
                  required
                />

                <input
                  type="number"
                  placeholder="Tiempo estimado (minutos)"
                  value={duracionServicio}
                  onChange={(e) => setDuracionServicio(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              {/* Opción de Seña / Reserva */}
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqSena}
                    onChange={(e) => setReqSena(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  ¿Requiere reserva / seña previo al turno?
                </label>

                {reqSena && (
                  <input
                    type="number"
                    placeholder="Monto de la seña ($)"
                    value={montoSena}
                    onChange={(e) => setMontoSena(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white w-40 focus:outline-none"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-xs transition"
              >
                {cargando ? 'Guardando...' : 'Guardar Servicio'}
              </button>
            </form>

            {/* Lista de Servicios */}
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Servicios Activos</h3>

              {servicios.map((s) => (
                <div key={s.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-white">{s.nombre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">⏱️ {s.duracion_minutos || 30} min</p>
                    {s.requiere_seña && (
                      <p className="text-[11px] text-amber-400 mt-0.5 font-semibold">
                        ⚠️ Seña requerida: ${s.monto_seña}
                      </p>
                    )}
                  </div>
                  <span className="font-black text-emerald-400 text-sm">${s.precio}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENIDO 3: EDICIÓN DE PÁGINA */}
        {tab === 'marca' && (
          <div className="space-y-6">
            <form onSubmit={handleGuardarMarca} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                Edición de página
              </h2>

              <div className="space-y-3">
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
                    placeholder="Ej. Av. Siempreviva 742, Buenos Aires"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Descripción corta</label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Breve reseña o información de tu negocio..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white h-20"
                  />
                </div>

                {/* Subir Logo / Foto desde el dispositivo */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Cargar Foto de Logo desde el Dispositivo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-400"
                  />
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo Previsto" className="w-12 h-12 rounded-full mt-2 object-cover border border-slate-600" />
                  )}
                </div>

                {/* Tamaño de letra */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Tamaño de Letra</label>
                  <div className="flex gap-2">
                    {['chica', 'mediano', 'grande'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTamanoFuente(t)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition border ${
                          tamanoFuente === t
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Principal */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Color Principal de Botones</label>
                  <input
                    type="color"
                    value={colorPrincipal}
                    onChange={(e) => setColorPrincipal(e.target.value)}
                    className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-xs transition"
              >
                {cargando ? 'Guardando...' : 'Guardar Cambios de Edición'}
              </button>
            </form>

            {/* Plantillas de Diseño Pro */}
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Layout className="w-4 h-4 text-indigo-400" /> Plantillas de Diseño Pro
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => aplicarPlantilla('glass')}
                  className="p-4 bg-slate-900 border border-slate-700 rounded-2xl text-left hover:border-indigo-500 transition space-y-1"
                >
                  <p className="font-bold text-xs text-white">💎 Glassmorphism Pro</p>
                  <p className="text-[10px] text-slate-400">Degradado violeta oscuro con efecto cristal</p>
                </button>

                <button
                  type="button"
                  onClick={() => aplicarPlantilla('neon')}
                  className="p-4 bg-slate-900 border border-slate-700 rounded-2xl text-left hover:border-indigo-500 transition space-y-1"
                >
                  <p className="font-bold text-xs text-rose-400">⚡ Cyber Dark</p>
                  <p className="text-[10px] text-slate-400">Fondo negro absoluto con acentos neón</p>
                </button>

                <button
                  type="button"
                  onClick={() => aplicarPlantilla('minimal')}
                  className="p-4 bg-slate-900 border border-slate-700 rounded-2xl text-left hover:border-indigo-500 transition space-y-1"
                >
                  <p className="font-bold text-xs text-slate-200">✨ Minimal Soft</p>
                  <p className="text-[10px] text-slate-400">Fondo claro con tipografía elegante</p>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}