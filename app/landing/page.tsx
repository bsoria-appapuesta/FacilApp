'use client'

import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  MessageCircle, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Palette, 
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 1. NAVEGACIÓN SUPERIOR */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-600/30">
              F
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Facil<span className="text-indigo-400">App</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
            >
              <span>Empezar Gratis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tu link en bio inteligente para reservas</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Gestioná tus turnos en automático y directo por <span className="text-emerald-400">WhatsApp</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Olvidate de responder mensajes a deshora preguntando horarios disponibles. Creá tu página personalizada en 2 minutos: tus clientes eligen fecha, horario y te confirman al instante.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            <span>Crear mi página ahora</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/barberia-demo"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2"
          >
            <span>Ver demo en vivo</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        <div className="pt-6 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sin comisiones por turno
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Clientes sin registro previo
          </span>
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
          {/* Card 1 */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Disponibilidad Dinámica</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configurá tus días de atención, rango de horas y duración de turnos. El sistema bloquea automáticamente los horarios ya tomados para evitar superposiciones.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FaWhatsapp className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Confirmación por WhatsApp</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Al pedir el turno, el cliente envía un mensaje autogenerado a tu WhatsApp con los datos completos. Vos confirmás o reprogramás con un solo clic.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Catálogo y Marca Propia</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Personalizá los colores, tipografía, logo oficial, links a tus redes sociales (Instagram, TikTok) y mostrá fotos de tus trabajos con precios visibles.
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
            <span className="text-3xl font-black text-indigo-400">01</span>
            <h4 className="font-bold text-sm text-white">Creá tu cuenta</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingresá tu correo, agregá los servicios que ofrecés y definí tus horarios disponibles.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-3xl font-black text-indigo-400">02</span>
            <h4 className="font-bold text-sm text-white">Compartí tu enlace</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pegá tu link en tu biografía de Instagram, TikTok o ponelo como respuesta automática de WhatsApp.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-3xl font-black text-indigo-400">03</span>
            <h4 className="font-bold text-sm text-white">Recibí las reservas</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tus clientes eligen su horario y te llega la notificación lista para agendar y atender.
            </p>
          </div>
        </div>
      </section>

      {/* 5. LLAMADO A LA ACCIÓN (FOOTER CTA) */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-8 sm:p-12 rounded-[36px] text-center space-y-6 shadow-2xl relative overflow-hidden">
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
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition"
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