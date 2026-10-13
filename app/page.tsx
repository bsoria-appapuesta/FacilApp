'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Share2, 
  Globe, 
  Calendar, 
  Plus, 
  MapPin,
  ExternalLink,
  ImageIcon,
  Settings,
  X,
  Copy,
  Check
} from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const HORARIOS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
]

export default function Home() {
  const [negocio, setNegocio] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [servicioSel, setServicioSel] = useState<any>(null)
  
  const [seccionAbierta, setSeccionAbierta] = useState<'turnos' | null>('turnos')
  const [modalCompartir, setModalCompartir] = useState(false)
  const [copiado, setCopiado] = useState(false)
  
  // Formulario
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('10:00')
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)
  const [linkWa, setLinkWa] = useState('')

  useEffect(() => {
    cargarPerfil()
  }, [])

  async function cargarPerfil() {
    const { data: negData } = await supabase
      .from('negocios')
      .select('*')
      .limit(1)
      .single()

    if (negData) {
      setNegocio(negData)
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

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || !whatsapp || !fecha || !hora || !servicioSel) {
      alert('Por favor completá todos los campos')
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
      const msg = `¡Hola ${negocio.nombre}! 👋%0AMi nombre es *${nombre}*.%0A%0AQuiero reservar:%0A📌 *Servicio/Producto:* ${servicioSel.nombre}%0A📅 *Fecha:* ${fecha}%0A⏰ *Hora:* ${hora} hs%0A💰 *Precio:* $${servicioSel.precio}%0A%0A¿Me confirmás el turno?`
      setLinkWa(`https://wa.me/${negocio.whatsapp}?text=${msg}`)
    }
  }

  const colorPrincipal = negocio?.color_principal || '#6366f1'
  const colorFondo = negocio?.color_fondo || '#0f172a'
  const tipoFondo = negocio?.tipo_fondo || 'degradado'
  const fondoDegradado = negocio?.fondo_degradado || 'linear-gradient(to bottom, #1e293b, #0f172a)'
  const fondoImagenUrl = negocio?.fondo_imagen_url || ''
  const bordes = negocio?.bordes_redondeados || 'rounded-3xl'

  const redesList = negocio?.redes_sociales?.length > 0 
    ? negocio.redes_sociales 
    : [
        { tipo: 'whatsapp', titulo: 'WhatsApp Directo', url: `https://wa.me/${negocio?.whatsapp || ''}` },
        { tipo: 'instagram', titulo: 'Instagram Oficial', url: `https://instagram.com/${negocio?.instagram_username || ''}` },
        { tipo: 'tiktok', titulo: 'TikTok', url: `https://tiktok.com/@${negocio?.tiktok_username || ''}` }
      ]

  const galeriaLista = negocio?.galeria_detallada?.length > 0
    ? negocio.galeria_detallada
    : [
        { titulo: 'Kapping Gel + Nail Art', precio: '18000', imagen_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400' },
        { titulo: 'Service Uñas Semipermanente', precio: '12000', imagen_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400' },
        { titulo: 'Corte Barbería & Barba', precio: '10000', imagen_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400' }
      ]

  const urlActual = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center relative transition-all duration-500"
      style={{ 
        background: tipoFondo === 'degradado' 
          ? fondoDegradado 
          : tipoFondo === 'imagen' && fondoImagenUrl 
            ? `url(${fondoImagenUrl}) center/cover no-repeat fixed` 
            : colorFondo,
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {tipoFondo === 'imagen' && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px] z-0"></div>
      )}

      <div className={`max-w-md w-full bg-white/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl border border-white/40 relative z-10 transition-all ${bordes}`}>
        
        {/* Superior: Botón Editar Admin + Botón Compartir */}
        <div className="flex justify-between items-center mb-6">
          <a
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition border border-slate-200/60 shadow-sm"
            title="Panel Administrador"
          >
            <Settings className="w-3.5 h-3.5 text-rose-500" />
            <span>Editar Mi Web</span>
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
          </div>
        </div>

        {/* Módulos de Redes */}
        <div className="space-y-3 mb-6">
          {redesList.map((red: any, idx: number) => (
            <a
              key={idx}
              href={red.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full bg-white hover:bg-slate-50/80 border border-slate-200/80 p-3.5 flex items-center justify-between shadow-sm transition-all active:scale-[0.99] ${bordes}`}
            >
              <span className="font-bold text-slate-800 text-sm">{red.titulo}</span>
              <ExternalLink className="w-4 h-4 text-slate-300" />
            </a>
          ))}

          {/* Botón Principal de Acción */}
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
                <span className="font-extrabold text-sm block">Solicitar Turno / Pedido</span>
                <span className="text-[10px] text-white/80 block">Consultá horarios disponibles</span>
              </div>
            </div>
            <Plus className={`w-5 h-5 transition-transform duration-300 ${seccionAbierta === 'turnos' ? 'rotate-45' : ''}`} />
          </button>
        </div>

        {/* Desplegable de Reservas */}
        {seccionAbierta === 'turnos' && (
          <div className="border-t border-slate-100 pt-5 space-y-4">
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
                  className={`block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 transition text-center shadow-lg shadow-emerald-500/25 text-sm ${bordes}`}
                >
                  📲 Confirmar por WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={handleReservar} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    1. Seleccioná el Servicio / Producto
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {servicios.map((s) => {
                      const esSel = servicioSel?.id === s.id
                      return (
                        <div
                          key={s.id}
                          onClick={() => setServicioSel(s)}
                          className={`p-3 rounded-2xl border-2 transition cursor-pointer flex justify-between items-center ${
                            esSel ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100 bg-slate-50/50'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs text-slate-800">{s.nombre}</p>
                            <p className="text-[10px] text-slate-400">{s.duracion_minutos} min de sesión</p>
                          </div>
                          <span className="font-black text-rose-600 text-xs bg-rose-100/80 px-2.5 py-1 rounded-xl">
                            ${s.precio}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    2. Tus Datos
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre y Apellido"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 mb-2 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Tu WhatsApp (ej. 1122334455)"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    3. Fecha y Horario
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 mb-2 focus:outline-none"
                  />

                  <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    {HORARIOS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHora(h)}
                        className={`py-2 text-[11px] font-bold rounded-lg transition ${
                          hora === h
                            ? 'bg-rose-500 text-white shadow-md'
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
                  className={`w-full text-white font-bold py-3.5 transition shadow-lg text-xs disabled:opacity-50 ${bordes}`}
                >
                  {cargando ? 'Procesando...' : 'Confirmar Reserva ✨'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* CATÁLOGO VISUAL CON FOTO, SERVICIO Y PRECIO */}
        <div className="border-t border-slate-100 pt-5 space-y-3 mt-6">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
            Catálogo de Servicios & Productos
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

      </div>

      {/* MODAL DE COMPARTIR EXCLUSIVO Y LIMPIO */}
      {modalCompartir && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
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

            <p className="text-xs text-slate-500">Seleccioná la plataforma donde querés publicar tu enlace:</p>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`https://api.whatsapp.com/send?text=Mirá%20mi%20perfil%20oficial:%20${encodeURIComponent(urlActual)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-2.5 font-bold text-xs hover:bg-emerald-100 transition"
              >
                <span>💬 WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlActual)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-2xl flex items-center gap-2.5 font-bold text-xs hover:bg-blue-100 transition"
              >
                <span>📘 Facebook</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(urlActual)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl flex items-center gap-2.5 font-bold text-xs hover:bg-slate-200 transition"
              >
                <span>🐦 X / Twitter</span>
              </a>

              <a
                href={`mailto:?subject=Perfil%20Oficial&body=Te%20comparto%20el%20link:%20${encodeURIComponent(urlActual)}`}
                className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl flex items-center gap-2.5 font-bold text-xs hover:bg-rose-100 transition"
              >
                <span>✉️ Gmail / Mail</span>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlActual)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-sky-50 text-sky-800 border border-sky-200 rounded-2xl flex items-center gap-2.5 font-bold text-xs hover:bg-sky-100 transition col-span-2"
              >
                <span>💼 LinkedIn</span>
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