import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Las capitulares de las inscripciones romanas, para los rótulos y la marca: el toque de Antigüedad.
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "MemnonHistory AI",
  description:
    "Enciclopedia histórica ordenada, con contribuciones verificadas y una IA que responde citando de dónde sale cada dato.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${cinzel.variable} h-full antialiased`}
      // El script del tema pone data-theme antes de hidratar: el atributo del servidor y el del navegador
      // difieren a propósito.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col overflow-x-clip font-sans">
        {/* beforeInteractive: Next lo coloca en el <head> y lo ejecuta antes del primer pintado. Con una
            etiqueta <script> escrita a mano, React avisa de que no la ejecutará al renderizar en el cliente. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
