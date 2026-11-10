import './globals.css';
import React from 'react';

export const metadata = {
  title: 'FacilApp',
  description: 'Tu perfil comercial en minutos',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}