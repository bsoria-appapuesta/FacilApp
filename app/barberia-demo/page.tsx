import React from 'react';
import { supabase, Profile, Service } from '../../lib/supabase';

export default async function BarberiaDemoPage() {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', 'barberia-demo')
    .single<Profile>();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 sm:p-6 font-sans">
      <main className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
        
        <section className="text-center space-y-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {profile?.name || 'Barbería San José'}
            </h1>
            <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {profile?.category || 'Barbería & Peluquería'}
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {profile?.bio || 'Cortes clásicos, barba y estilismo profesional. Reservá tu turno por WhatsApp.'}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>Servicios & Turnos</span>
          </h2>
          <div className="space-y-3">
            {services && services.length > 0 ? (
              services.map((service: Service) => {
                const waMessage = encodeURIComponent(`Hola! Quiero agendar un turno para *${service.title}* ($${service.price}).`);
                return (
                  <div key={service.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-100">{service.title}</h3>
                        {service.description && <p className="text-xs text-slate-400 mt-0.5">{service.description}</p>}
                      </div>
                      <span className="text-sm font-bold text-amber-400">${service.price}</span>
                    </div>
                    <a
                      href={`https://wa.me/${profile?.whatsapp || '5491112345678'}?text=${waMessage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-center text-xs font-semibold py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                    >
                      Agendar por WhatsApp
                    </a>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No hay servicios disponibles en este momento.</p>
            )}
          </div>
        </section>

        <footer className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Powered by <span className="font-bold text-amber-500">FacilApp</span>
          </p>
        </footer>

      </main>
    </div>
  );
}
