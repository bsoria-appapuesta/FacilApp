'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const HORARIOS_DISPONIBLES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
]

export default function ClientePerfilPage() {
  const [negocio, setNegocio] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [copiado, setCopiado] = useState(false)

  // Formulario
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('10:00')
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)
  const [linkWhatsapp, setLinkWhatsapp] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    const { data: negData } = await supabase
      .from('negocios')
      .select('*')
      .eq('slug', 'barberia-demo')
      .single()

    if (negData) {
      setNegocio(negData)
      const { data: servData } = await supabase
        .from('servicios')
        .select('*')
        .eq('negocio_id', negData.id)

      if (servData && servData.length > 0) {
        setServicios(servData)
        setServicioSeleccionado(servData[0])
      }
    }
  }

  const compartirLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || !whatsapp || !fecha || !hora || !servicioSeleccionado) {
      alert('Por favor completá todos los campos')
      return
    }

    setCargando(true)
    const fechaHora = new Date(`${fecha}T${hora}:00`).toISOString()

    const { error } = await supabase.from('turnos').insert([
      {
        negocio_id: negocio.id,
        servicio_id: servicioSeleccionado.id,
        cliente_nombre: nombre,
        cliente_whatsapp: whatsapp,
        fecha_hora: fechaHora,
        estado: 'pendiente'
      }
    ])

    setCargando(false)

    if (error) {
      alert('Error al registrar la reserva: ' + error.message)
    } else {
      setExito(true)
      const accionTexto = negocio?.tipo_accion === 'pedido' ? 'Hacer un Pedido' : 'Reservar Turno'
      const textoMensaje = `¡Hola ${negocio.nombre}! 👋%0AMi nombre es *${nombre}*.%0A%0AQuiero solicitar (*${accionTexto}*):%0A📌 *Servicio/Producto:* ${servicioSeleccionado.nombre}%0A📅 *Fecha:* ${fecha}%0A⏰ *Hora:* ${hora} hs%0A💰 *Precio:* $${servicioSeleccionado.precio}%0A%0A¿Me confirmás?`
      
      const urlWa = `https://wa.me/${negocio.whatsapp}?text=${textoMensaje}`
      setLinkWhatsapp(urlWa)
    }
  }

  const colorPrincipal = negocio?.color_principal || '#4f46e5'
  const colorFondo = negocio?.color_fondo || '#1e293b'
  const tipoFondo = negocio?.tipo_fondo || 'degradado'
  const fondoDegradado = negocio?.fondo_degradado || 'linear-gradient(to bottom, #1e3a8a, #0f172a)'
  const fondoImagenUrl = negocio?.fondo_imagen_url || ''
  const fuente = negocio?.tipo_fuente || 'Inter'
  const tamanoLogo = negocio?.tamano_logo || 'w-24 h-24'
  const bordesRedondeados = negocio?.bordes_redondeados || 'rounded-2xl'

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center relative transition-all duration-300"
      style={{ 
        background: tipoFondo === 'degradado' 
          ? fondoDegradado 
          : tipoFondo === 'imagen' && fondoImagenUrl 
            ? `url(${fondoImagenUrl}) center/cover no-repeat fixed` 
            : colorFondo,
        fontFamily: fuente 
      }}
    >
      <link 
        rel="stylesheet" 
        href={`https://fonts.googleapis.com/css2?family=${fuente.replace(' ', '+')}:wght@400;500;600;700;800;900&display=swap`} 
      />

      <div className={`max-w-md w-full bg-white/95 backdrop-blur-md p-6 shadow-2xl border border-white/20 relative z-10 ${bordesRedondeados}`}>
        
        {/* Acciones Superiores: Modos y Botón Compartir */}
        <div className="flex justify-between items-center mb-6">
          <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 shadow-sm text-sm font-bold">
            ✨
          </div>

          <button
            onClick={compartirLink}
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition shadow-sm active:scale-95 relative"
            title="Compartir perfil"
          >
            {copiado ? '✓' : '↗'}
            {copiado && (
              <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap shadow-md">
                ¡Link copiado!
              </span>
            )}
          </button>
        </div>

        {/* Cabecera del Negocio */}
        <div className="text-center mb-6 space-y-2">
          <div className={`${tamanoLogo} bg-slate-900 rounded-full mx-auto flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-xl overflow-hidden`}>
            {negocio?.logo_url ? (
              <img src={negocio.logo_url} alt={negocio.nombre} className="w-full h-full object-cover" />
            ) : (
              negocio?.nombre?.charAt(0) || 'V'
            )}
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {negocio ? negocio.nombre : 'Cargando...'}
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {negocio?.ubicacion || 'Llavallol'}
            </p>
          </div>
        </div>

        {/* Botones de Redes y Enlaces Directos */}
        <div className="space-y-3 mb-6">
          
          {/* WhatsApp */}
          {negocio?.whatsapp && (
            <a
              href={`https://wa.me/${negocio.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-sm transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg shadow-sm font-bold">
                  💬
                </div>
                <span className="font-bold text-slate-800 text-sm">WhatsApp</span>
              </div>
              <span className="text-slate-300 font-bold text-xs">⋮</span>
            </a>
          )}

          {/* TikTok */}
          {negocio?.tiktok_username && (
            <a
              href={`https://tiktok.com/@${negocio.tiktok_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-sm transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg shadow-sm font-bold">
                  🎵
                </div>
                <span className="font-bold text-slate-800 text-sm">TikTok</span>
              </div>
              <span className="text-slate-300 font-bold text-xs">⋮</span>
            </a>
          )}

          {/* Instagram */}
          {negocio?.instagram_username && (
            <a
              href={`https://instagram.com/${negocio.instagram_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-sm transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-lg shadow-sm font-bold">
                  📸
                </div>
                <span className="font-bold text-slate-800 text-sm">Instagram</span>
              </div>
              <span className="text-slate-300 font-bold text-xs">⋮</span>
            </a>
          )}

          {/* Botón Principal Configurable ("Hacé tu pedido" o "Reservá tu turno") */}
          <button
            onClick={() => setMostrarModal(true)}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-md transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-xl text-white flex items-center justify-center text-lg shadow-sm font-bold"
                style={{ backgroundColor: colorPrincipal }}
              >
                {negocio?.tipo_accion === 'pedido' ? '🛍️' : '📅'}
              </div>
              <span className="font-extrabold text-slate-900 text-sm">
                {negocio?.tipo_accion === 'pedido' ? 'Hacé tu pedido' : 'Reservá tu turno'}
              </span>
            </div>
            <span className="text-slate-300 font-bold text-xs">⋮</span>
          </button>
        </div>

        {/* Galería de Trabajos Hechos / Productos a la Venta */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center">
            📸 Trabajos & Catálogo
          </p>

          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm flex items-center justify-center text-2xl">
              💅
            </div>
            <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm flex items-center justify-center text-2xl">
              ✨
            </div>
            <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm flex items-center justify-center text-2xl">
              💈
            </div>
          </div>
        </div>

      </div>

      {/* Modal Interactivo de Reserva / Pedido */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-100 relative space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">
                {negocio?.tipo_accion === 'pedido' ? 'Hacé tu Pedido' : 'Reservar Turno'}
              </h2>
              <button
                onClick={() => setMostrarModal(false)}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {exito ? (
              <div className="text-center space-y-4 py-4">
                <div className="bg-emerald-50 text-emerald-800 p-5 rounded-2xl border border-emerald-200">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="font-bold text-base">¡Solicitud Registrada!</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Para confirmar, enviá la orden automáticamente a WhatsApp:
                  </p>
                </div>
                
                <a
                  href={linkWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-2xl transition text-center shadow-lg shadow-emerald-500/25 text-sm"
                >
                  📲 Enviar a WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={handleReservar} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    1. Elegí Opción
                  </label>
                  <div className="space-y-2">
                    {servicios.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setServicioSeleccionado(s)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer flex justify-between items-center ${
                          servicioSeleccionado?.id === s.id
                            ? 'border-indigo-600 bg-indigo-50/30'
                            : 'border-slate-100 hover:border-indigo-200'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-800">{s.nombre}</p>
                          <p className="text-xs text-slate-400">{s.duracion_minutos} min</p>
                        </div>
                        <span className="font-black text-indigo-600 text-sm bg-indigo-100/60 px-2.5 py-1 rounded-xl">
                          ${s.precio}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    2. Tus Datos
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre y Apellido"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 mb-2 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="tel"
                    placeholder="Tu WhatsApp (ej. 1122334455)"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    3. Fecha y Horario
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 mb-2 focus:outline-none"
                  />

                  <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    {HORARIOS_DISPONIBLES.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHora(h)}
                        className={`py-2 text-xs font-bold rounded-lg transition ${
                          hora === h
                            ? 'bg-indigo-600 text-white'
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
                  className="w-full text-white font-bold py-3.5 rounded-2xl transition shadow-lg text-sm mt-2 disabled:opacity-50"
                >
                  {cargando ? 'Procesando...' : 'Confirmar Solicitud ✨'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  )
}