"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const PAGINAS = [
  { href: "/visao-geral",       curto: "Visão",        longo: "Visão geral" },
  { href: "/absenteismo",       curto: "Ponto",        longo: "Absenteísmo" },
  { href: "/saude-ocupacional", curto: "Saúde",        longo: "Saúde ocupacional" },
  { href: "/turnover",          curto: "Turnover",     longo: "Turnover" },
  { href: "/desligamentos",     curto: "Saídas",       longo: "Desligamentos" },
];

function BotaoTema() {
  const [escuro, setEscuro] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem("tema");
    const preferido = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const usar = salvo ? salvo === "escuro" : preferido;
    setEscuro(usar);
    document.documentElement.classList.toggle("dark", usar);
  }, []);

  const alternar = () => {
    const novo = !escuro;
    setEscuro(novo);
    document.documentElement.classList.toggle("dark", novo);
    localStorage.setItem("tema", novo ? "escuro" : "claro");
  };

  return (
    <button
      onClick={alternar}
      aria-label={escuro ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className="w-9 h-9 grid place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--marca)] hover:border-[var(--marca)] transition-colors"
    >
      {escuro ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Navegação lateral — desktop e TV */}
      <nav className="hidden lg:flex lg:flex-col lg:w-52 xl:w-56 shrink-0 border-r border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="mb-7">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--marca)]" />
            <span className="font-semibold text-sm tracking-tight">Painel de RH</span>
          </div>
          <p className="text-[0.68rem] text-[var(--muted)] mt-1 ml-4.5">Cidade das Rosas</p>
        </div>

        <ul className="space-y-0.5 flex-1">
          {PAGINAS.map((p) => {
            const ativo = caminho === p.href;
            return (
              <li key={p.href}>
                <Link
                  href={p.href}
                  aria-current={ativo ? "page" : undefined}
                  className={`block px-3 py-2 rounded-lg text-[0.8rem] transition-colors ${
                    ativo
                      ? "bg-[var(--tint-marca)] text-[var(--marca)] font-semibold"
                      : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--tint-marca)]/40"
                  }`}
                >
                  {p.longo}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
          <span className="text-[0.68rem] text-[var(--muted)]">jan–ago 2026</span>
          <BotaoTema />
        </div>
      </nav>

      {/* Barra superior — celular e tablet */}
      <header className="lg:hidden sticky top-0 z-20 bg-[var(--surface)] border-b border-[var(--line)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--marca)]" />
          <span className="font-semibold text-sm">Painel de RH</span>
        </div>
        <BotaoTema />
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-7 pb-24 lg:pb-7 max-w-[1600px] w-full">{children}</main>

      {/* Abas inferiores — celular e tablet */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-[var(--surface)] border-t border-[var(--line)] grid grid-cols-5">
        {PAGINAS.map((p) => {
          const ativo = caminho === p.href;
          return (
            <Link
              key={p.href}
              href={p.href}
              aria-current={ativo ? "page" : undefined}
              className={`py-2.5 text-center text-[0.68rem] font-medium transition-colors ${
                ativo ? "text-[var(--marca)]" : "text-[var(--muted)]"
              }`}
            >
              <span className={`block h-0.5 mx-auto mb-1.5 rounded-full transition-all ${
                ativo ? "w-6 bg-[var(--marca)]" : "w-0 bg-transparent"
              }`} />
              {p.curto}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
