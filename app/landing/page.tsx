'use client'

import { Sparkles, ArrowRight, Smartphone, ShieldCheck, Zap, Layers } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      
      {/* Navbar */}
      <nav className="max-w-6xl mx-auto p-6 flex justify-between items-center border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-rose-500/20">
            F
          </div>
          <span className="font-black text-xl tracking-tight text-white">FacilApp</span>
        </div>

        <a
          href="/admin"
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs transition shadow-lg shadow-rose-500/20"
        >
          Iniciar Sesión
        </a>
      </nav>

      {/* Hero Header */}
      <section className="max-w-4xl mx-auto text-center px-6 py-16 sm:py-24 space-y-6">
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-rose-400 px-3.5 py-1.5 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Plataforma de Gestión para Microemprendedores
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Tu negocio en un solo link. <br />
          <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Turnos, Catálogo y Redes.
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Reemplazá tu Linktree tradicional por una herramienta completa. Muestra tus trabajos, gestioná reservas online y recibí confirmaciones directas en WhatsApp.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
          <a
            href="/"
            className="px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20"
          >
            <span>Ver Ejemplo en Vivo</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/admin"
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl transition text-sm border border-slate-800"
          >
            Panel de Administración
          </a>
        </div>
      </section>

      {/* Características principales */}
      <section className="max-w-5xl mx-auto px-6 py-12 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-white text-base">Perfil 100% Personalizable</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Elegí colores, fuentes, fotos de fondo y agregá ilimitadas redes sociales en segundos desde tu celular.
          </p>
        </div>

        <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-white text-base">Reservas & Pedidos por WhatsApp</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tus clientes seleccionan el servicio, el día y la hora. La orden te llega armada a tu WhatsApp lista para confirmar.
          </p>
        </div>

        <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-white text-base">Catálogo con Precios</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Subí fotos HD de tus trabajos, productos o servicios con nombre y precio para mostrar la calidad de lo que hacés.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-600">
        FacilApp © 2026 - Gestión inteligente para microemprendedores
      </footer>
    </div>
  )
}