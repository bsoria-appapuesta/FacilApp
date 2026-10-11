import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <h1 className="text-4xl font-extrabold text-amber-500 mb-2">FacilApp</h1>
      <p className="text-slate-400 mb-6 max-w-sm">Plataforma autogestionable para barberías, manicuras y microemprendedores.</p>
      
      <a 
        href="/barberia-demo" 
        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-6 rounded-xl transition-colors shadow-lg"
      >
        Ver Demo de Barbería →
      </a>
    </div>
  );
}
