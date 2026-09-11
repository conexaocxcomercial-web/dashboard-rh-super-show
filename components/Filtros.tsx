"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { MESES } from "@/lib/filtros";

type Opcao = { valor: string; rotulo: string };

function Seletor({
  nome, rotulo, opcoes, valor, aoMudar, larguraMin = "auto",
}: {
  nome: string; rotulo: string; opcoes: Opcao[];
  valor: string; aoMudar: (v: string) => void; larguraMin?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[0.62rem] text-[var(--muted)] font-medium">{rotulo}</span>
      <select
        name={nome}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        style={{ minWidth: larguraMin }}
        className="text-[0.78rem] bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)]
                   rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-[var(--marca)]
                   focus:border-[var(--marca)] transition-colors appearance-none
                   bg-no-repeat bg-[right_0.5rem_center] pr-7"
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>{o.rotulo}</option>
        ))}
      </select>
    </label>
  );
}

export type CampoFiltro =
  | { tipo: "periodo" }
  | { tipo: "select"; nome: string; rotulo: string; opcoes: Opcao[] };

export default function BarraFiltros({ campos }: { campos: CampoFiltro[] }) {
  const router = useRouter();
  const caminho = usePathname();
  const params = useSearchParams();

  const atualizar = useCallback(
    (mudancas: Record<string, string>) => {
      const p = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(mudancas)) {
        if (!v || v === "todos") p.delete(k);
        else p.set(k, v);
      }
      const qs = p.toString();
      router.replace(qs ? `${caminho}?${qs}` : caminho, { scroll: false });
    },
    [params, caminho, router]
  );

  const de = params.get("de") ?? "1";
  const ate = params.get("ate") ?? "12";
  const temFiltro = Array.from(params.keys()).length > 0;

  const mesesOpcoes = MESES.map((m, i) => ({ valor: String(i + 1), rotulo: m }));

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4 pb-4 border-b border-[var(--line)]">
      {campos.map((c, i) => {
        if (c.tipo === "periodo") {
          return (
            <div key={i} className="flex items-end gap-1.5">
              <Seletor nome="de" rotulo="De" opcoes={mesesOpcoes} valor={de}
                       aoMudar={(v) => atualizar({ de: v })} larguraMin="72px" />
              <span className="text-[var(--muted)] text-xs pb-2">–</span>
              <Seletor nome="ate" rotulo="Até" opcoes={mesesOpcoes} valor={ate}
                       aoMudar={(v) => atualizar({ ate: v })} larguraMin="72px" />
            </div>
          );
        }
        return (
          <Seletor
            key={c.nome}
            nome={c.nome}
            rotulo={c.rotulo}
            opcoes={[{ valor: "todos", rotulo: "Todos" }, ...c.opcoes]}
            valor={params.get(c.nome) ?? "todos"}
            aoMudar={(v) => atualizar({ [c.nome]: v })}
            larguraMin="130px"
          />
        );
      })}

      {temFiltro && (
        <button
          onClick={() => router.replace(caminho, { scroll: false })}
          className="text-[0.72rem] text-[var(--marca)] hover:underline pb-2 font-medium"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
