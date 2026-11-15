import './globals.css'
import React from 'react'
import type { Metadata, Viewport } from 'next'

const BASE_URL = 'https://facilapp.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'FacilApp | Tu Link en Bio Inteligente y Turnos por WhatsApp',
  description:
    'Gestioná tus turnos en automático y directo por WhatsApp. Mostrá tu catálogo de servicios, precios y disponibilidad sin comisiones.',
  openGraph: {
    title: 'FacilApp | Turnos Automáticos y Catálogo por WhatsApp',
    description:
      'Reservá tu turno en segundos. Elegí el servicio, fecha y horario disponible y confirmá directo por WhatsApp sin vueltas.',
    url: BASE_URL,
    siteName: 'FacilApp',
    images: [
      {
        url: '/logo.jpeg',
        width: 800,
        height: 800,
        alt: 'FacilApp - Turnos por WhatsApp',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FacilApp | Turnos Automáticos por WhatsApp',
    description:
      'Gestioná tus turnos en automático y directo por WhatsApp. Catálogo de servicios y reservas online.',
    images: ['/logo.jpeg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}