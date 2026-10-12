'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Generador de horarios cada 30 minutos (de 09:00 a 20:00)
const HORARIOS_DISPONIBLES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
]

export default function ManicuraDemoPage() {
  const [negocio, setNegocio] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null)
  
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
        estado: 'pendiente',
        pago_sena_estado: servicioSeleccionado.exige_sena ? 'pendiente' : 'no_requiere'
      }
    ])

    setCargando(false)

    if (error) {
      alert('Error al guardar la reserva: ' + error.message)
    } else {
      setExito(true)
      const textoMensaje = `¡Hola ${negocio.nombre}! 👋%0AMi nombre es *${nombre}*.%0A%0AQuiero confirmar el siguiente turno:%0A💅 *Servicio:* ${servicioSeleccionado.nombre}%0A📅 *Fecha:* ${fecha}%0A⏰ *Hora:* ${hora} hs%0A💰 *Precio:* $${servicioSeleccionado.precio}%0A%0A¿Me confirmás el turno?`
      
      const urlWa = `https://wa.me/${negocio.whatsapp}?text=${textoMensaje}`
      setLinkWhatsapp(urlWa)
    }
  }

  return (
    <div className="min-h-screen bg-rose-50/50 text-slate-800 p-4 sm:p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-rose-100">
        
        {/* Cabecera Tipo Linktree */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-rose-100 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-inner">
            💅
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {negocio ? negocio.nombre : 'Cargando...'}
          </h1>
          <p className="text-rose-500 font-medium text-sm mt-1">Estética & Uñas Studio</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Turnos Disponibles
          </div>
        </div>

        {exito ? (
          <div className="text-center space-y-4 py-4">
            <div className="bg-emerald-50 text-emerald-800 p-5 rounded-2xl border border-emerald-200 shadow-sm">
              <div className="text-4xl mb-2">🎉</div>
              <p className="font-bold text-lg">¡Reserva Registrada!</p>
              <p className="text-xs text-slate-600 mt-1">
                El turno ya fue reservado en nuestro sistema. Para confirmarlo, enviá el mensaje automático por WhatsApp:
              </p>
            </div>
            
            <a
              href={linkWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl transition text-center shadow-lg shadow-emerald-500/25 text-base active:scale-[0.98]"
            >
              📲 Finalizar por WhatsApp
            </a>
          </div>
        ) : (
          <form onSubmit={handleReservar} className="space-y-4">
            
            {/* Tarjeta de Selección de Servicio */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                1. Seleccioná el Servicio
              </label>
              <div className="space-y-2">
                {servicios.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setServicioSeleccionado(s)}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex justify-between items-center ${
                      servicioSeleccionado?.id === s.id
                        ? 'border-rose-500 bg-rose-50/40 text-slate-900 font-medium'
                        : 'border-slate-100 hover:border-rose-200 bg-slate-50/50 text-slate-600'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-800">{s.nombre}</p>
                      <p className="text-xs text-slate-400">{s.duracion_minutos} min de sesión</p>
                    </div>
                    <span className="font-extrabold text-rose-600 text-sm bg-rose-100/60 px-3 py-1 rounded-xl">
                      ${s.precio}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Datos del Cliente */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                2. Tus Datos
              </label>
              <input
                type="text"
                placeholder="Nombre y Apellido"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-rose-500 mb-2"
              />
              <input
                type="tel"
                placeholder="Tu WhatsApp (ej. 1122334455)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Fecha y Slots de Hora en Intervalos */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                3. Elegí Fecha y Horario
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-rose-500 mb-2"
              />

              <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
                {HORARIOS_DISPONIBLES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHora(h)}
                    className={`py-2 text-xs font-bold rounded-lg transition ${
                      hora === h
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-rose-50'
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
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-rose-500/25 mt-3 text-base active:scale-[0.98] disabled:opacity-50"
            >
              {cargando ? 'Procesando...' : 'Confirmar Reserva ✨'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}