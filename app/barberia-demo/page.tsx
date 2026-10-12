'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Inicializar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function BarberiaDemoPage() {
  const [negocio, setNegocio] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null)
  
  // Formulario
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)
  const [linkWhatsapp, setLinkWhatsapp] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    // 1. Obtener el negocio de prueba
    const { data: negData } = await supabase
      .from('negocios')
      .select('*')
      .eq('slug', 'barberia-demo')
      .single()

    if (negData) {
      setNegocio(negData)
      // 2. Obtener servicios de este negocio
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

    // Guardar turno en Supabase
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
      alert('Hubo un error al guardar la reserva: ' + error.message)
    } else {
      setExito(true)
      
      // Armar mensaje pre-armado de WhatsApp
      const textoMensaje = `¡Hola ${negocio.nombre}! 👋%0AMi nombre es *${nombre}*.%0A%0AAcabo de solicitar un turno en la web:%0A📌 *Servicio:* ${servicioSeleccionado.nombre}%0A📅 *Fecha:* ${fecha}%0A⏰ *Hora:* ${hora} hs%0A%0A¿Me confirmás el turno? ¡Muchas gracias!`
      
      const urlWa = `https://wa.me/${negocio.whatsapp}?text=${textoMensaje}`
      setLinkWhatsapp(urlWa)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
        <h1 className="text-3xl font-bold text-center mb-2 text-indigo-400">
          {negocio ? negocio.nombre : 'Cargando...'}
        </h1>
        <p className="text-slate-400 text-center mb-6 text-sm">Reserva tu turno en línea en 1 minuto</p>

        {exito ? (
          <div className="text-center space-y-4">
            <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl border border-emerald-500/20">
              <p className="font-semibold text-lg">¡Reserva Registrada!</p>
              <p className="text-sm text-slate-300 mt-1">
                El turno quedó anotado en el sistema. Tocá el botón de abajo para notificar por WhatsApp:
              </p>
            </div>
            
            <a
              href={linkWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition text-center shadow-lg shadow-emerald-600/30"
            >
              📲 Notificar por WhatsApp
            </a>
          </div>
        ) : (
          <form onSubmit={handleReservar} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">SERVICIO</label>
              <select
                value={servicioSeleccionado?.id || ''}
                onChange={(e) => {
                  const s = servicios.find(x => x.id === e.target.value)
                  setServicioSeleccionado(s)
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
              >
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} - ${s.precio} ({s.duracion_minutos} min)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">TU NOMBRE Y APELLIDO</label>
              <input
                type="text"
                placeholder="Ej. Laura Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">TU WHATSAPP</label>
              <input
                type="tel"
                placeholder="Ej. 1122334455"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">FECHA</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">HORA</label>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 mt-2 disabled:opacity-50"
            >
              {cargando ? 'Guardando reserva...' : 'Confirmar Reserva'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}