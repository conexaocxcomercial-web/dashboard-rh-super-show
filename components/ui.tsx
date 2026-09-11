import type { ReactNode } from "react";
import { SimboloCx } from "./Marca";

type Tom = "neutro" | "marca" | "alerta" | "positivo";

const tons: Record<Tom, { fundo: string; rotulo: string; valor: string }> = {
  neutro:   { fundo: "bg-[var(--surface)]", rotulo: "text-[var(--muted)]", valor: "text-[var(--ink)]" },
  marca:    { fundo: "bg-[var(--tint-marca)]", rotulo: "text-[var(--marca)]", valor: "text-[var(--marca)]" },
  alerta:   { fundo: "bg-[var(--tint-magenta)]", rotulo: "text-[var(--magenta)]", valor: "text-[var(--magenta)]" },
  positivo: { fundo: "bg-[var(--tint-lima)]", rotulo: "text-[var(--lima-texto)]", valor: "text-[var(--lima-texto)]" },
};

export function Kpi({
  rotulo, valor, apoio, tom = "neutro",
}: { rotulo: string; valor: string; apoio?: string; tom?: Tom }) {
  const t = tons[tom];
  return (
    <div className={`${t.fundo} rounded-xl p-4 border border-[var(--line)] flex flex-col justify-between min-h-[110px]`}>
      <p className={`text-[0.7rem] font-medium leading-snug ${t.rotulo}`}>{rotulo}</p>
      <div className="mt-3">
        <p className={`text-[1.4rem] sm:text-[1.75rem] xl:text-[2rem] leading-none font-semibold tnum tracking-tight ${t.valor}`}>{valor}</p>
        {apoio && <p className={`text-[0.7rem] mt-1 ${t.rotulo} opacity-80`}>{apoio}</p>}
      </div>
    </div>
  );
}

export function Painel({
  titulo, nota, children, className = "",
}: { titulo: string; nota?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`painel bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 flex flex-col ${className}`}>
      <h2 className="text-sm font-semibold mb-3 text-[var(--ink)]">{titulo}</h2>
      <div className="flex-1 min-h-0">{children}</div>
      {nota && <p className="text-[0.68rem] text-[var(--muted)] mt-3">{nota}</p>}
    </section>
  );
}

export function Alerta({
  titulo, children,
}: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-xl p-4 bg-[var(--tint-magenta)] border border-[var(--magenta)]/30">
      <h2 className="text-sm font-semibold text-[var(--magenta)] mb-1.5">{titulo}</h2>
      <div className="text-[0.8rem] leading-relaxed text-[var(--ink)]">{children}</div>
    </section>
  );
}

export function Destaques({ itens }: { itens: { titulo: string; texto: string }[] }) {
  return (
    <section className="relative overflow-hidden rounded-xl p-4 bg-[var(--tint-marca)] border border-[var(--marca)]/25">
      {/* O sorriso da marca como marca-d'água: é aqui que a consultoria comenta
          os números, então faz sentido assinar o bloco. */}
      <SimboloCx
        titulo=""
        className="pointer-events-none absolute -right-5 -bottom-6 w-36 text-[var(--marca)] opacity-[0.07]"
      />
      <h2 className="relative text-sm font-semibold text-[var(--marca)] mb-2">Destaques do período</h2>
      <ul className="relative space-y-2">
        {itens.map((i) => (
          <li key={i.titulo} className="text-[0.8rem] leading-relaxed text-[var(--ink)]">
            <span className="font-semibold">{i.titulo}</span> {i.texto}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Cabecalho({ titulo, subtitulo, aviso }: { titulo: string; subtitulo: string; aviso?: string }) {
  return (
    <header className="mb-5">
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{titulo}</h1>
      <p className="text-sm text-[var(--muted)] mt-0.5">{subtitulo}</p>
      {aviso && (
        <p className="text-[0.7rem] text-[var(--muted)] mt-2 border-l-2 border-[var(--marca)] pl-2">
          {aviso}
        </p>
      )}
    </header>
  );
}
