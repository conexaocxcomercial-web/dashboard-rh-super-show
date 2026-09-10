/** Métricas do dashboard — equivalentes em TypeScript às medidas DAX documentadas
 *  em `Medidas_DAX_Dashboard_RH.md`. Mantidas juntas para que a regra de negócio
 *  fique num lugar só, e não espalhada pelos componentes. */

import { carregarBase } from "./dados";
import type { BaseRH } from "./types";

export const base: BaseRH = carregarBase();

/* Categorias de ausência consideradas PLANEJADAS (direito ou programável).
   Férias sozinha é 53% de toda a ausência — misturá-la com atestado e falta
   inflaria o indicador e esconderia o que de fato é problema de gestão. */
export const PLANEJADAS = [
  "Férias", "Abono", "Folga Gestor", "Externo", "Amamentação",
  "Licença Maternidade", "Licença Paternidade", "Licença Casamento",
];

const soma = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/* ---------- Quadro de pessoal ---------- */

/** Conta apenas quem tem registro completo na folha.
 *  `Status_Funcionario` (via desligamentos) superestimava, porque 13 dos 34
 *  desligamentos têm nome parcial e não casam com o cadastro. */
export const headcountAtivo = () =>
  base.funcionarios.filter((f) => f.Fonte_Cadastro === "Folha de pagamento (completo)").length;

/** A coluna `Setor` da planilha normalizada não separou corretamente loja de
 *  comercial (todos vieram como loja), então não expomos esse recorte na tela.
 *  Se o RH corrigir a origem, esta função volta a ser útil. */
export const headcountPorSetor = (setor: string) =>
  base.funcionarios.filter(
    (f) => f.Fonte_Cadastro === "Folha de pagamento (completo)" && f.Setor === setor
  ).length;

export const folhaSalarial = () =>
  soma(base.funcionarios.map((f) => f.Salario ?? 0));

export const salarioMedio = () => {
  const comSalario = base.funcionarios.filter((f) => f.Salario != null);
  return comSalario.length ? folhaSalarial() / comSalario.length : 0;
};

/* ---------- Ponto e absenteísmo ---------- */

export const horasPorCategoria = (categoria: string) =>
  soma(base.ponto.filter((p) => p.Categoria === categoria).map((p) => p.Horas));

export const horasPrevistas = () => horasPorCategoria("Horas Previstas");
export const horasTrabalhadas = () => horasPorCategoria("Horas Trabalhadas");

export const ausenciaDetalhe = () => base.ponto.filter((p) => p.Grupo === "Ausência (detalhe)");

export const horasNaoPlanejadas = () =>
  soma(ausenciaDetalhe().filter((p) => !PLANEJADAS.includes(p.Categoria)).map((p) => p.Horas));

export const horasPlanejadas = () =>
  soma(ausenciaDetalhe().filter((p) => PLANEJADAS.includes(p.Categoria)).map((p) => p.Horas));

export const absenteismoNaoPlanejado = () => horasNaoPlanejadas() / horasPrevistas();
export const ausenciaPlanejadaPct = () => horasPlanejadas() / horasPrevistas();
export const aderenciaJornada = () => horasTrabalhadas() / horasPrevistas();
export const pctPericiaSobreNaoPlanejado = () => horasPorCategoria("Perícia") / horasNaoPlanejadas();

/** Ranking de departamentos por % de absenteísmo não planejado. */
export function deptosPorAbsenteismo() {
  const nomes = Array.from(new Set(base.ponto.map((p) => p.Departamento)));
  return nomes
    .map((dep) => {
      const linhas = base.ponto.filter((p) => p.Departamento === dep);
      const prev = soma(linhas.filter((l) => l.Categoria === "Horas Previstas").map((l) => l.Horas));
      const nao = soma(
        linhas
          .filter((l) => l.Grupo === "Ausência (detalhe)" && !PLANEJADAS.includes(l.Categoria))
          .map((l) => l.Horas)
      );
      return { departamento: dep, previstas: prev, naoPlanejadas: nao, pct: prev ? nao / prev : 0 };
    })
    .filter((d) => d.previstas > 0)
    .sort((a, b) => b.pct - a.pct);
}

/** Causas do absenteísmo não planejado, da maior para a menor. */
export function causasNaoPlanejadas() {
  const cats = Array.from(new Set(ausenciaDetalhe().map((p) => p.Categoria))).filter(
    (c) => !PLANEJADAS.includes(c)
  );
  return cats
    .map((c) => ({ categoria: c, horas: horasPorCategoria(c) }))
    .filter((c) => c.horas > 0)
    .sort((a, b) => b.horas - a.horas);
}

export function composicaoAusencia() {
  const cats = Array.from(new Set(ausenciaDetalhe().map((p) => p.Categoria)));
  return cats
    .map((c) => ({
      categoria: c,
      horas: horasPorCategoria(c),
      planejada: PLANEJADAS.includes(c),
    }))
    .filter((c) => c.horas > 0)
    .sort((a, b) => b.horas - a.horas);
}

/* ---------- Afastamentos ---------- */

export const totalAfastamentos = () => base.afastamentos.length;
export const totalPorTipo = (tipo: string) =>
  base.afastamentos.filter((a) => a.Tipo === tipo).length;

export const diasPerdidos = () => soma(base.afastamentos.map((a) => a.Dias ?? 0));

/** Média por ocorrência ignorando o registro com datas invertidas (Dias nulo). */
export const mediaDiasPorOcorrencia = () => {
  const validos = base.afastamentos.filter((a) => a.Dias != null);
  return validos.length ? soma(validos.map((a) => a.Dias as number)) / validos.length : 0;
};

export function afastamentosPorMes() {
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const doMes = base.afastamentos.filter((a) => a.Mes === m);
    return {
      mes: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][i],
      atestados: doMes.filter((a) => a.Tipo === "Atestado Médico").length,
      faltas: doMes.filter((a) => a.Tipo === "Falta").length,
    };
  }).filter((m) => m.atestados > 0 || m.faltas > 0);
}

export function afastamentosPorUnidade() {
  const lojas = Array.from(new Set(base.afastamentos.map((a) => a.Loja)));
  return lojas.map((loja) => ({
    loja,
    atestados: base.afastamentos.filter((a) => a.Loja === loja && a.Tipo === "Atestado Médico").length,
    faltas: base.afastamentos.filter((a) => a.Loja === loja && a.Tipo === "Falta").length,
  }));
}

export function topColaboradores(limite = 8) {
  const mapa = new Map<string, { nome: string; ocorrencias: number; dias: number }>();
  for (const a of base.afastamentos) {
    const at = mapa.get(a.Nome) ?? { nome: a.Nome, ocorrencias: 0, dias: 0 };
    at.ocorrencias += 1;
    at.dias += a.Dias ?? 0;
    mapa.set(a.Nome, at);
  }
  return Array.from(mapa.values()).sort((a, b) => b.ocorrencias - a.ocorrencias).slice(0, limite);
}

export function motivosAtestado(limite = 6) {
  const so = base.afastamentos.filter(
    (a) => a.Tipo === "Atestado Médico" && !a.Motivo.startsWith("Não informado")
  );
  const mapa = new Map<string, number>();
  for (const a of so) mapa.set(a.Motivo, (mapa.get(a.Motivo) ?? 0) + 1);
  return Array.from(mapa, ([motivo, qtd]) => ({ motivo, qtd }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, limite);
}

/* ---------- Turnover ---------- */

/** Só meses fechados. Set–Dez estão em branco na base — a planilha original
 *  os contava como zero, o que puxava a média de 7,1% para 4,7%. */
export const mesesFechados = () => base.turnover.filter((t) => t.Total_Desligamentos != null);

const mediaDe = (campo: keyof (typeof base.turnover)[number]) => {
  const vs = mesesFechados().map((t) => t[campo] as number).filter((v) => v != null);
  return vs.length ? soma(vs) / vs.length : 0;
};

export const turnoverGeralMedio = () => mediaDe("Turnover_Geral_Pct");
export const turnoverVoluntarioMedio = () => mediaDe("Turnover_Voluntario_Pct");
export const totalAdmissoes = () => soma(mesesFechados().map((t) => t.Admissoes ?? 0));
export const totalDesligamentosTurnover = () =>
  soma(mesesFechados().map((t) => t.Total_Desligamentos ?? 0));
export const saldoQuadro = () => totalAdmissoes() - totalDesligamentosTurnover();

export const headcountAtual = () => {
  const fechados = mesesFechados().filter((t) => t.Func_Fim != null);
  return fechados.length ? (fechados[fechados.length - 1].Func_Fim as number) : 0;
};

export const evolucaoQuadro = () =>
  mesesFechados().map((t) => ({
    mes: t.Mes.slice(0, 3),
    admissoes: t.Admissoes ?? 0,
    desligamentos: t.Total_Desligamentos ?? 0,
    headcount: t.Media_Func ?? 0,
    turnoverGeral: (t.Turnover_Geral_Pct ?? 0) * 100,
    turnoverVoluntario: (t.Turnover_Voluntario_Pct ?? 0) * 100,
  }));

export const mesMaisMovimentado = () => {
  const l = mesesFechados()
    .map((t) => ({ mes: t.Mes, total: (t.Admissoes ?? 0) + (t.Total_Desligamentos ?? 0) }))
    .sort((a, b) => b.total - a.total);
  return l[0];
};

/* ---------- Desligamentos ---------- */

export const totalDesligamentos = () => base.desligamentos.length;

export const pctPorTipo = (tipos: string[]) =>
  base.desligamentos.filter((d) => tipos.includes(d.Tipo_Demissao)).length / totalDesligamentos();

export function porTipoDemissao() {
  const mapa = new Map<string, number>();
  for (const d of base.desligamentos) mapa.set(d.Tipo_Demissao, (mapa.get(d.Tipo_Demissao) ?? 0) + 1);
  return Array.from(mapa, ([tipo, qtd]) => ({ tipo, qtd })).sort((a, b) => b.qtd - a.qtd);
}

export function porMotivoPrincipal(limite = 6) {
  const mapa = new Map<string, number>();
  for (const d of base.desligamentos)
    mapa.set(d.Motivo_Principal, (mapa.get(d.Motivo_Principal) ?? 0) + 1);
  return Array.from(mapa, ([motivo, qtd]) => ({ motivo, qtd }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, limite);
}

export function desligamentosPorMes() {
  return Array.from({ length: 12 }, (_, i) => ({
    mes: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][i],
    qtd: base.desligamentos.filter((d) => d.Mes === i + 1).length,
  })).filter((m) => m.qtd > 0);
}
