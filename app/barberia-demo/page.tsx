import { supabase } from '@/lib/supabase'

export default async function BarberiaPage() {
  const { data: servicios, error } = await supabase
    .from('services')
    .select('*')

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="max-w-md mx-auto">
        <header className="mb-8 text-center border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold text-amber-500 mb-1">
            Barbería San José
          </h1>
          <p className="text-slate-400 text-sm">
            Catálogo de servicios y lista de precios
          </p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl mb-6 text-sm text-center">
            Error al conectar con la base de datos
          </div>
        )}

        <div className="space-y-4">
          {servicios && servicios.length > 0 ? (
            servicios.map((servicio: any) => (
              <div 
                key={servicio.id} 
                className="p-5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors shadow-sm flex justify-between items-center"
              >
                <div className="pr-4">
                  <h2 className="font-bold text-lg text-slate-100">
                    {servicio.title}
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    {servicio.description}
                  </p>
                  <span className="inline-block mt-2 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                    ⏱️ {servicio.duration}
                  </span>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="font-extrabold text-amber-400 text-xl">
                    ${servicio.price}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-8 text-sm">
              No hay servicios registrados aún.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}