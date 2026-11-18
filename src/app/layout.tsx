import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // El nonce de esta petición (src/proxy.ts): sin él, la política de seguridad bloquearía el script del tema.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${cinzel.variable} h-full antialiased`}
      // El script del tema pone data-theme antes de hidratar: el atributo del servidor y el del navegador
      // difieren a propósito.
      suppressHydrationWarning
    >
      <head>
        {/* Una etiqueta <script> normal: el navegador la ejecuta al leerla, antes del primer pintado.
            next/script con beforeInteractive no sirve aquí: en producción lo encola y lo ejecuta cuando carga
            el JavaScript de Next, y se vería un instante el tema contrario. En desarrollo, React puede avisar
            («Encountered a script tag…») si rehace la página en el navegador; para entonces el script ya se
            ejecutó desde el HTML del servidor, así que el aviso es inofensivo. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col overflow-x-clip font-sans">{children}</body>
    </html>
  );
}
