'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Palette, 
  Calendar,
  SlidersHorizontal,
  Eye,
  Share2,
  MapPin,
  Plus,
  Minus,
  Image as ImageIcon
} from 'lucide-react'
import { FaWhatsapp, FaInstagram } from 'react-icons/fa'

const SERVICIOS_INICIALES = [
  {
    id: 1,
    nombre: 'Servicio Principal',
    duracion: '45 min',
    precio: '$12000',
    imagen: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 2,
    nombre: 'Sesión / Pack Pro',
    duracion: '60 min',
    precio: '$15000',
    imagen: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 3,
    nombre: 'Consulta / Básico',
    duracion: '30 min',
    precio: '$10000',
    imagen: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=300&q=80',
  },
]

const TEMAS = {
  red: {
    label: 'Rojo',
    dot: 'bg-red-600',
    ctaBtn: 'bg-[#b90808] hover:bg-red-700',
    pin: 'text-red-500',
    activeSlot: 'bg-red-600/20 border-red-500 text-red-200',
  },
  violet: {
    label: 'Violeta',
    dot: 'bg-violet-600',
    ctaBtn: 'bg-violet-600 hover:bg-violet-500',
    pin: 'text-violet-400',
    activeSlot: 'bg-violet-600/20 border-violet-400 text-violet-200',
  },
  teal: {
    label: 'Turquesa',
    dot: 'bg-teal-500',
    ctaBtn: 'bg-teal-600 hover:bg-teal-500',
    pin: 'text-teal-400',
    activeSlot: 'bg-teal-500/20 border-teal-400 text-teal-200',
  },
}

const HORARIOS_DEMO = ['10:00', '11:30', '15:00', '16:30', '18:00']

export default function LandingPage() {
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false)
  const [selectedService, setSelectedService] = useState<number>(1)
  const [selectedTime, setSelectedTime] = useState<string>('15:00')
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false)

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [bizName, setBizName] = useState<string>('Tu Negocio / Marca')
  const [bizAddress, setBizAddress] = useState<string>('Av. Principal 401, Centro')
  const [themeKey, setThemeKey] = useState<keyof typeof TEMAS>('red')
  const [servicios, setServicios] = useState(SERVICIOS_INICIALES)

  const theme = TEMAS[themeKey]

  const handleSelectCatalogItem = (id: number) => {
    setSelectedService(id)
    setIsBookingOpen(true)
    setBookingSuccess(false)
  }

  const handlePriceChange = (id: number, newPrice: string) => {
    setServicios((prev) =>
      prev.map((item) => (item.id === id ? { ...item, precio: newPrice } : item))
    )
  }

  const handleConfirmDemo = () => {
    setBookingSuccess(true)
    setTimeout(() => {
      setBookingSuccess(false)
      setIsBookingOpen(false)
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-violet-600 selection:text-white">
      
      {/* 1. NAVEGACIÓN SUPERIOR */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-lg shadow-violet-600/20 ring-2 ring-teal-300/60 group-hover:scale-105 transition-transform">
              <img 
                src="/logo.jpeg" 
                alt="FacilApp Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Facil<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-teal-300">App</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl transition shadow-md shadow-violet-600/30 flex items-center gap-1.5"
            >
              <span>Probar Gratis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION + DEMO INTERACTIVA REAL */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-32 left-1/3 w-[240px] h-[240px] bg-teal-400/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Columna Izquierda: Propuesta de Valor */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-teal-400/30 text-teal-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>10 días gratis • Sin tarjeta de crédito para probar</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Dejá de perder clientes respondiendo mensajes. Automatizá tus turnos por{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">
                WhatsApp
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Armá tu página con catálogo de servicios, precios y horarios disponibles en 2 minutos. Tus clientes reservan solos y vos recibís el turno listo en tu WhatsApp. Probá editar el ejemplo de al lado 👇
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-violet-600/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Empezar prueba gratis de 10 días</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" /> Luego solo $16.400/mes
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" /> Sin comisiones por turno
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" /> Cancelás cuando quieras
              </span>
            </div>
          </div>

          {/* Columna Derecha: SIMULADOR IDÉNTICO AL PERFIL REAL */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            {/* Barra superior de control para probar la personalización */}
            <div className="w-full max-w-[390px] mb-3 flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400">
                Vista previa interactiva
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ${
                  isEditing
                    ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-400/20'
                    : 'bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30'
                }`}
              >
                {isEditing ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver como cliente</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Probar editar</span>
                  </>
                )}
              </button>
            </div>

            {/* Panel rápido de personalización cuando isEditing === true */}
            {isEditing && (
              <div className="w-full max-w-[390px] mb-3 bg-slate-900 border border-teal-400/40 rounded-2xl p-3.5 space-y-3 text-left shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-teal-300 uppercase tracking-wider">
                    Personalizá tu página
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(Object.keys(TEMAS) as Array<keyof typeof TEMAS>).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setThemeKey(key)}
                        title={TEMAS[key].label}
                        className={`w-5 h-5 rounded-full ${TEMAS[key].dot} transition-transform ${
                          themeKey === key ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">
                      Nombre del negocio
                    </label>
                    <input
                      type="text"
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">
                      Dirección / Ubicación
                    </label>
                    <input
                      type="text"
                      value={bizAddress}
                      onChange={(e) => setBizAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TARJETA MOBILE UI (ESTILO NEGRO PURO COMO LA CAPTURA) */}
            <div className="w-full max-w-[390px] bg-black border border-neutral-800 rounded-[36px] p-5 shadow-2xl shadow-violet-950/40 relative overflow-hidden">
              
              {/* Botón Compartir arriba a la derecha */}
              <div className="flex justify-end">
                <button
                  type="button"
                  aria-label="Compartir perfil"
                  className="w-9 h-9 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* A. IDENTIDAD CENTRADA */}
              <div className="-mt-2 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-black border-2 border-white p-1.5 shadow-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.jpeg"
                    alt={bizName}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <h2 className="mt-4 text-2xl font-black text-white tracking-tight">
                  {bizName || 'Tu Negocio'}
                </h2>

                <div className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-neutral-300 font-medium">
                  <MapPin className={`w-3.5 h-3.5 shrink-0 ${theme.pin}`} />
                  <span>{bizAddress || 'Tu Dirección 123'}</span>
                </div>

                <p className="mt-2 text-xs text-neutral-300">
                  ¡Bienvenidos a nuestra página de reservas!
                </p>

                {/* B. ICONOS SOCIALES MINIMALISTAS */}
                <div className="mt-5 flex items-center justify-center gap-6">
                  <a
                    href="#ig"
                    onClick={(e) => e.preventDefault()}
                    aria-label="Instagram"
                    className="text-pink-500 hover:scale-110 transition-transform"
                  >
                    <FaInstagram className="w-5 h-5" />
                  </a>
                  <a
                    href="#wa"
                    onClick={(e) => e.preventDefault()}
                    aria-label="WhatsApp"
                    className="text-emerald-400 hover:scale-110 transition-transform"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* C. BOTÓN PRINCIPAL DE ACCIÓN (DESPLEGABLE) */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(!isBookingOpen)}
                  className={`w-full ${theme.ctaBtn} rounded-2xl p-4 flex items-center justify-between transition-all shadow-lg active:scale-[0.99]`}
                >
                  <div className="flex items-center gap-3.5 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-white leading-tight">
                        Solicitar Turno / Pedido
                      </p>
                      <p className="text-[11px] text-white/80 mt-0.5">
                        Consultá servicios y horarios disponibles
                      </p>
                    </div>
                  </div>
                  {isBookingOpen ? (
                    <Minus className="w-5 h-5 text-white shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-white shrink-0" />
                  )}
                </button>

                {/* Panel desplegable de reserva al hacer clic */}
                {isBookingOpen && (
                  <div className="mt-2.5 bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 space-y-3 text-left animate-fadeIn">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        1. Elegí el servicio
                      </span>
                      <div className="grid grid-cols-1 gap-1.5 mt-1.5">
                        {servicios.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedService(s.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-between transition ${
                              selectedService === s.id
                                ? theme.activeSlot
                                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                            }`}
                          >
                            <span>{s.nombre}</span>
                            <span>{s.precio}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        2. Horarios disponibles hoy
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                        {HORARIOS_DEMO.map((hora) => (
                          <button
                            key={hora}
                            type="button"
                            onClick={() => setSelectedTime(hora)}
                            className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                              selectedTime === hora
                                ? theme.activeSlot
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            {hora}
                          </button>
                        ))}
                      </div>
                    </div>

                    {bookingSuccess ? (
                      <div className="py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                        ✓ ¡Listo! Se abriría WhatsApp con el turno de las {selectedTime}hs
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConfirmDemo}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <FaWhatsapp className="w-4 h-4" />
                        <span>Confirmar {selectedTime}hs por WhatsApp</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* D. CATÁLOGO DE SERVICIOS & PRODUCTOS (GRILLA DE 3 COLUMNAS CON PRECIO FLOTANTE) */}
              <div className="mt-7">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                  <h3 className="text-[11px] font-extrabold text-neutral-300 uppercase tracking-wider">
                    Catálogo de Servicios & Productos
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {servicios.map((servicio) => (
                    <div
                      key={servicio.id}
                      onClick={() => !isEditing && handleSelectCatalogItem(servicio.id)}
                      className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 cursor-pointer"
                    >
                      <img
                        src={servicio.imagen}
                        alt={servicio.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                      {/* Etiqueta de precio flotante abajo */}
                      <div className="absolute bottom-2 inset-x-1.5 flex justify-center">
                        {isEditing ? (
                          <input
                            type="text"
                            value={servicio.precio}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handlePriceChange(servicio.id, e.target.value)}
                            className="w-full bg-slate-950/95 border border-teal-400 rounded-lg px-1 py-0.5 text-[11px] font-extrabold text-teal-300 text-center focus:outline-none"
                          />
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-[#161b26]/95 border border-white/10 text-[11px] font-extrabold text-white shadow-md">
                            {servicio.precio}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-900 flex items-center justify-center gap-1.5 text-[10px] text-neutral-500">
                <span>Creado con</span>
                <span className="font-bold text-neutral-300">FacilApp</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CARACTERÍSTICAS PRINCIPALES */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Todo lo que tu negocio necesita en un solo enlace
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Diseñado para estudios, salones de estética, consultorios, talleres y profesionales independientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-violet-500/40 transition p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Disponibilidad Dinámica</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configurá tus días de atención, rango de horas y duración de turnos. El sistema bloquea automáticamente los horarios ya tomados para evitar superposiciones.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-teal-400/40 transition p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-400/15 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <FaWhatsapp className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Confirmación por WhatsApp</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Al pedir el turno, el cliente envía un mensaje autogenerado a tu WhatsApp con los datos completos. Vos confirmás o reprogramás con un solo clic.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-violet-500/40 transition p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Catálogo y Marca Propia</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Personalizá los colores, logo oficial, links a tus redes sociales y mostrá fotos de tus trabajos o productos con precios visibles.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CÓMO FUNCIONA */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-900">
        <h2 className="text-2xl sm:text-3xl font-black text-center text-white mb-10">
          En 3 simples pasos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="space-y-2">
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-teal-300">01</span>
            <h4 className="font-bold text-sm text-white">Creá tu cuenta</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingresá tu correo, agregá los servicios o productos que ofrecés y definí tus horarios disponibles.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-teal-300">02</span>
            <h4 className="font-bold text-sm text-white">Compartí tu enlace</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pegá tu link en tu biografía de Instagram, Facebook o ponelo como respuesta automática de WhatsApp.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-teal-300">03</span>
            <h4 className="font-bold text-sm text-white">Recibí las reservas</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tus clientes eligen su horario y te llega la notificación lista para agendar y atender.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PLAN ÚNICO Y LLAMADO A LA ACCIÓN (FOOTER CTA) */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-violet-950/90 via-slate-900 to-slate-950 border border-violet-500/30 p-8 sm:p-12 rounded-[36px] shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Columna Izquierda: Beneficios incluidos */}
            <div className="md:col-span-7 text-center md:text-left space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-teal-400/15 border border-teal-400/30 text-teal-300 text-xs font-bold">
                Un solo plan, todo incluido
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Empezá a organizar tus turnos hoy mismo
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Probá FacilApp sin compromiso. Configurá tu perfil, compartilo en tu Instagram y comprobá cuánto tiempo te ahorrás en la primera semana.
              </p>

              <ul className="space-y-2 pt-2 text-xs text-slate-300 text-left inline-block md:block">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Turnos ilimitados y sin comisiones por reserva</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Catálogo de servicios con fotos, precios y redes sociales</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Confirmación directa a tu WhatsApp con un clic</span>
                </li>
              </ul>
            </div>

            {/* Columna Derecha: Tarjeta de Precio */}
            <div className="md:col-span-5 bg-slate-950/90 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
              <div>
                <p className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  10 días de prueba gratis
                </p>
                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-white">$16.400</span>
                  <span className="text-xs text-slate-400 font-bold">ARS / mes</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Sin contratos ni permanencia. Cancelás con un clic.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full py-3.5 px-6 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-violet-600/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Probar 10 días gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-[11px] text-slate-400">
                No necesitas tarjeta para empezar.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. PIE DE PÁGINA */}
      <footer className="border-t border-slate-900 py-8 px-4 text-center text-xs text-slate-500">
        <p>© 2026 FacilApp. Todos los derechos reservados.</p>
      </footer>

    </div>
  )
}