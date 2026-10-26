import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Doto (Oliver Lalan) es la tipografía de todo el sitio, incluidos los créditos.
// Va dentro del proyecto para no depender de la conexión con Google Fonts al compilar.
const doto = localFont({
  src: "./fonts/Doto-Variable.woff2",
  variable: "--font-doto-family",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Paulo Aylas | Desarrollador Web",
  description: "Portfolio de Paulo Aylas, desarrollador web.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${doto.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
