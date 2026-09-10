import type { Metadata, Viewport } from "next";
import "./globals.css";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: "Painel de RH — Cidade das Rosas",
  description: "Indicadores de pessoal, absenteísmo e turnover",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1e1e" },
  ],
};

/** Aplica o tema antes da primeira pintura, evitando o "flash" de tela clara. */
const scriptTema = `
(function(){try{
  var s=localStorage.getItem('tema');
  var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
  if(s==='escuro'||(!s&&d))document.documentElement.classList.add('dark');
}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: scriptTema }} /></head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
