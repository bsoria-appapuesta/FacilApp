'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Palette, 
  Globe,
  Calendar,
  ChevronRight,
  Star,
  Check,
  SlidersHorizontal,
  Eye
} from 'lucide-react'
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa'

const SERVICIOS_INICIALES = [
  {
    id: 1,
    nombre: 'Corte + Perfilado de Barba',
    duracion: '45 min',
    precio: '$12.500',
    descripcion: 'Degradé a navaja, lavado refrescante y toalla caliente con aceites esenciales.',
    imagen: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=300&q=80',
    destacado: true,
  },
  {
    id: 2,
    nombre: 'Corte Clásico / Fade',
    duracion: '30 min',
    precio: '$9.000',
    descripcion: 'Asesoramiento de imagen, tijera o máquina y styling final.',
    imagen: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80',
    destacado: false,
  },
  {
    id: 3,
    nombre: 'Colorimetría & Claritos',
    duracion: '90 min',
    precio: '$28.000',
    descripcion: 'Decoloración cuidada + matizador + baño de crema nutritivo.',
    imagen: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=300&q=80',
    destacado: false,
  },
]

const TEMAS = {
  violet: {
    label: 'Violeta',
    dot: 'bg-violet-500',
    banner: 'from-violet-600/40 via-purple-600/30 to-teal-400/30',
    badge: 'bg-violet-500/15 border-violet-500/30 text-violet-300',
    tab: 'bg-violet-600 shadow-violet-600/25',
    btn: 'bg-violet-600/15 hover:bg-violet-600 text-violet-300 hover:text-white border-violet-500/30',
    price: 'text-teal-300',
  },
  teal: {
    label: 'Turquesa',
    dot: 'bg-teal-400',
    banner: 'from-teal-500/40 via-cyan-600/30 to-violet-500/30',
    badge: 'bg-teal-500/15 border-teal-500/30 text-teal-300',
    tab: 'bg-teal-500 text-slate-950 shadow-teal-500/25',
    btn: 'bg-teal-500/15 hover:bg-teal-500 text-teal-300 hover:text-slate-950 border-teal-500/30',
    price: 'text-teal-300',
  },
  rose: {
    label: 'Estética',
    dot: 'bg-pink-500',
    banner: 'from-pink-600/40 via-rose-500/30 to-violet-500/30',
    badge: 'bg-pink-500/15 border-pink-500/30 text-pink-300',
    tab: 'bg-pink-600 shadow-pink-600/25',
    btn: 'bg-pink-600/15 hover:bg-pink-600 text-pink-300 hover:text-white border-pink-500/30',
    price: 'text-pink-300',
  },
}

const HORARIOS_DEMO = ['10:00', '11:30', '15:00', '16:30', '18:00']

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'servicios' | 'turnos'>('servicios')
  const [selectedService, setSelectedService] = useState<number>(1)
  const [selectedTime, setSelectedTime] = useState<string>('15:00')

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [bizName, setBizName] = useState<string>('Studio Facil Barber')
  const [bizCategory, setBizCategory] = useState<string>('Barbería & Estilismo')
  const [themeKey, setThemeKey] = useState<keyof typeof TEMAS>('violet')
  const [servicios, setServicios] = useState(SERVICIOS_INICIALES)

  const theme = TEMAS[themeKey]

  const handleReservarServicio = (id: number) => {
    setSelectedService(id)
    setActiveTab('turnos')
  }

  const handlePriceChange = (id: number, newPrice: string) => {
    setServicios((prev) =>
      prev.map((item) => (item.id === id ? { ...item, precio: newPrice } : item))
    )
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
              <span>Empezar Gratis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION + DEMO INTERACTIVA EDITABLE */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-32 left-1/3 w-[240px] h-[240px] bg-teal-400/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Columna Izquierda: Propuesta de Valor */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-teal-400/30 text-teal-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>100% personalizable a la identidad de tu negocio</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Tus links, catálogo y turnos en un solo lugar por{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">
                WhatsApp
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Personalizá tus colores, foto, redes sociales, servicios y precios en minutos. Probá editar el ejemplo de al lado para ver cómo queda tu página en celulares.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-violet-600/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Crear mi perfil gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" /> Editás precios y horarios cuando quieras
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" /> Sin comisiones por turno
              </span>
            </div>
          </div>

          {/* Columna Derecha: COMPONENTE DE PERFIL CON MODO EDICIÓN EN VIVO */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            {/* Barra superior de control para probar la personalización */}
            <div className="w-full max-w-[390px] mb-3 flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400">
                Ejemplo interactivo
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
                    Personalizá el ejemplo
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
                      Rubro / Categoría
                    </label>
                    <input
                      type="text"
                      value={bizCategory}
                      onChange={(e) => setBizCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tarjeta Mobile Card UI */}
            <div className="w-full max-w-[390px] bg-slate-900/95 border border-slate-800 rounded-[36px] p-5 shadow-2xl shadow-violet-950/50 relative overflow-hidden transition-all">
              
              {/* Banner superior dinámico */}
              <div className={`h-20 -mx-5 -mt-5 bg-gradient-to-r ${theme.banner} border-b border-slate-800/60 transition-colors duration-300`} />

              {/* A. SECCIÓN DE IDENTIDAD */}
              <div className="relative -mt-10 flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white p-1 shadow-xl ring-2 ring-teal-300">
                    <img
                      src="/logo.jpeg"
                      alt={bizName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span 
                    title="Disponible hoy"
                    className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900" 
                  />
                </div>

                <span className={`mt-3 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-colors ${theme.badge}`}>
                  {bizCategory || 'Tu Rubro'}
                </span>

                <h2 className="mt-1.5 text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                  {bizName || 'Nombre de tu Negocio'}
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-teal-400/20 text-teal-300">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                </h2>

                <p className="mt-1 text-xs text-slate-400 max-w-[280px] leading-relaxed">
                  Cortes de autor, barbería tradicional y color. Reservá tu lugar en 30 segundos 👇
                </p>

                {/* B. BARRA DE ICONOS SOCIALES */}
                <div className="mt-4 flex items-center justify-center gap-2.5">
                  {[
                    { icon: FaInstagram, label: 'Instagram', href: '#', color: 'hover:border-pink-500/50 hover:text-pink-400' },
                    { icon: FaWhatsapp, label: 'WhatsApp', href: '#', color: 'hover:border-emerald-500/50 hover:text-emerald-400' },
                    { icon: FaFacebook, label: 'Facebook', href: '#', color: 'hover:border-blue-500/50 hover:text-blue-400' },
                    { icon: Globe, label: 'Web', href: '#', color: 'hover:border-teal-400/50 hover:text-teal-300' },
                  ].map((social, idx) => {
                    const Icon = social.icon
                    return (
                      <a
                        key={idx}
                        href={social.href}
                        onClick={(e) => e.preventDefault()}
                        aria-label={social.label}
                        className={`w-10 h-10 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-center text-slate-300 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${social.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    )
                  })}
                </div>
              </div>

              {/* C. SELECTOR DE NAVEGACIÓN */}
              <div className="mt-5 p-1 bg-slate-950 rounded-2xl border border-slate-800/80 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('servicios')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    activeTab === 'servicios'
                      ? `${theme.tab} text-white shadow-md`
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Servicios</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('turnos')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    activeTab === 'turnos'
                      ? `${theme.tab} text-white shadow-md`
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Sacar Turno</span>
                </button>
              </div>

              {/* D. CATÁLOGO DE SERVICIOS */}
              <div className="mt-4 min-h-[270px]">
                {activeTab === 'servicios' ? (
                  <div className="space-y-2.5">
                    {servicios.map((servicio) => (
                      <div
                        key={servicio.id}
                        className="group bg-slate-950/90 hover:bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-2.5 transition-all duration-200 flex items-center gap-3"
                      >
                        <img
                          src={servicio.imagen}
                          alt={servicio.nombre}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-800 group-hover:scale-105 transition-transform duration-300"
                        />

                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-bold text-white truncate">
                              {servicio.nombre}
                            </h3>
                            {servicio.destacado && (
                              <Star className="w-3 h-3 text-teal-300 fill-teal-300 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {servicio.descripcion}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={servicio.precio}
                                onChange={(e) => handlePriceChange(servicio.id, e.target.value)}
                                className="w-20 bg-slate-900 border border-teal-400/50 rounded px-1.5 py-0.5 text-xs font-extrabold text-teal-300 focus:outline-none"
                              />
                            ) : (
                              <span className={`text-xs font-extrabold ${theme.price}`}>
                                {servicio.precio}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500">
                              • {servicio.duracion}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleReservarServicio(servicio.id)}
                          className={`shrink-0 px-2.5 py-2 rounded-xl border text-[11px] font-bold transition-all active:scale-95 flex items-center gap-0.5 ${theme.btn}`}
                        >
                          <span>Turno</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-3.5 text-left">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        1. Servicio elegido
                      </span>
                      <p className="text-xs font-bold text-white mt-0.5">
                        {servicios.find((s) => s.id === selectedService)?.nombre} —{' '}
                        <span className={theme.price}>
                          {servicios.find((s) => s.id === selectedService)?.precio}
                        </span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        2. Horarios disponibles hoy
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                        {HORARIOS_DEMO.map((hora) => (
                          <button
                            key={hora}
                            type="button"
                            onClick={() => setSelectedTime(hora)}
                            className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              selectedTime === hora
                                ? 'bg-teal-400/20 border-teal-300 text-teal-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {hora}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('servicios')}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-98"
                    >
                      <FaWhatsapp className="w-4 h-4" />
                      <span>Confirmar {selectedTime}hs por WhatsApp</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
                <span>Creado con</span>
                <span className="font-bold text-slate-300">FacilApp</span>
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
            Diseñado para barberías, salones de estética, terapeutas y profesionales independientes.
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
              Personalizá los colores, tipografía, logo oficial, links a tus redes sociales (Instagram, Facebook, TikTok) y mostrá fotos de tus trabajos con precios visibles.
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
              Ingresá tu correo, agregá los servicios que ofrecés y definí tus horarios disponibles.
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

      {/* 5. LLAMADO A LA ACCIÓN (FOOTER CTA) */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-violet-950/90 via-slate-900 to-slate-950 border border-violet-500/30 p-8 sm:p-12 rounded-[36px] text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Empezá a organizar tus turnos hoy
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Sumate a FacilApp y dale a tus clientes la experiencia de agendar rápido y sin vueltas.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-violet-600/30 transition-all hover:-translate-y-0.5"
            >
              <span>Crear Cuenta Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
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