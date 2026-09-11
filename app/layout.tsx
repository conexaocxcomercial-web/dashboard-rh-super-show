import type { Metadata, Viewport } from "next";
import "./globals.css";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: "RH estratégico — Cidade das Rosas",
  description: "Painel de indicadores de pessoal, absenteísmo e turnover. Feito com conexão.cx.",
  icons: { icon: "/icon.png" },
  robots: { index: false, follow: false },
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
        {/* O Shell desenha a navegação do painel. Ele próprio se desliga
            na rota /login, que tem layout inteiro próprio. */}
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
