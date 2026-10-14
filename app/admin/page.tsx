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
  CheckCircle2
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

  // Formulario Edición de Página / Estilos
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [colorPrincipal, setColorPrincipal] = useState('#6366f1')
  const [colorFondo, setColorFondo] = useState('#0f172a')
  const [colorCarta, setColorCarta] = useState('#ffffff')
  const [tipoFuente, setTipoFuente] = useState('sans-serif')
  const [tipoFondo, setTipoFondo] = useState('color')
  const [fondoImagenUrl, setFondoImagenUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  // Catálogo Visual / Galería con fotos y precio
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

      if (servData) setServicios(servData)
    }
  }

  // Subir Foto (Logo, Fondo o Producto de Catálogo) desde dispositivo
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

  // CONFIRMAR TURNO DESDE ADMIN
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

  // GUARDAR NUEVO SERVICIO (CORREGIDO)
  async function handleAgregarServicio(e: React.FormEvent) {
    e.preventDefault()
    if (!nomServicio || !precioServicio || !negocio) {
      alert('Completá nombre y precio del servicio')
      return
    }

    setCargando(true)
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

  // AGREGAR ITEM A GALERÍA / CATÁLOGO DE FOTOS
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
    const actualizada = galeria.filter((_, i) => i !== index)
    setGaleria(actualizada)
  }

  // GUARDAR EDICIÓN DE PÁGINA Y COLORES (CORREGIDO)
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
      alert('¡Todos los cambios de diseño, texto y fotos fueron guardados!')
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
            Edición de página
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

                        {/* BOTÓN DE CONFIRMAR TURNO */}
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
            <form onSubmit={handleAgregarServicio} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
              <h2 className="text-lg font-bold text-white">Agregar Nuevo Servicio</h2>

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
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-xs"
              >
                {cargando ? 'Guardando...' : 'Guardar Servicio'}
              </button>
            </form>

            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3">
              <h3 className="text-sm font-bold text-slate-400">Servicios Activos</h3>
              {servicios.map((s) => (
                <div key={s.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-white">{s.nombre}</p>
                    <p className="text-xs text-slate-400">⏱️ {s.duracion_minutos || 30} minutos</p>
                  </div>
                  <span className="font-black text-emerald-400">${s.precio}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: EDICIÓN DE PÁGINA, COLORES Y CATÁLOGO DE FOTOS */}
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
                <label className="block text-xs font-bold text-slate-400 mb-1">WhatsApp del Negocio</label>
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

            {/* SECCIÓN DE COLORES MODIFICABLES */}
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

            {/* FOTO DE FONDO DESDE DISPOSITIVO */}
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

            {/* CATÁLOGO VISUAL / GALERÍA CON FOTOS, PRECIOS Y DETALLES */}
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

              {/* LISTA DE FOTOS AGREGADAS */}
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