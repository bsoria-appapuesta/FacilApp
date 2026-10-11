import { supabase } from '@/lib/supabase'

export default async function BarberiaPage() {
  const { data: servicios, error } = await supabase
    .from('servicios')
    .select('*')

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">Barbería San José</h1>
        <p className="text-slate-400 mb-6">Lista de precios y turnos</p>

        {error && (
          <div className="p-4 bg-red-500/20 text-red-400 rounded-lg mb-4">
            Error al cargar servicios desde Supabase
          </div>
        )}

        <div className="space-y-4">
          {servicios && servicios.length > 0 ? (
            servicios.map((servicio: any) => (
              <div 
                key={servicio.id} 
                className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-center"
              >
                <div>
                  <h2 className="font-semibold text-lg">{servicio.nombre}</h2>
                  <p className="text-slate-400 text-sm">{servicio.descripcion}</p>
                </div>
                <span className="font-bold text-green-400 text-lg">
                  ${servicio.precio}
                </span>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-4">
              No hay servicios registrados aún.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}