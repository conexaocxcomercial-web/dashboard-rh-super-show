/** Métricas do dashboard — equivalentes em TypeScript às medidas DAX documentadas
 *  em `Medidas_DAX_Dashboard_RH.md`.
 *
 *  As funções recebem os dados como parâmetro em vez de lerem a base global,
 *  para que o mesmo cálculo sirva tanto para o total quanto para um recorte filtrado. */

import { carregarBase } from "./dados";
import type { Afastamento, BaseRH, Desligamento, Ponto, Turnover } from "./types";

export const base: BaseRH = carregarBase();

/* Categorias de ausência consideradas PLANEJADAS (direito ou programável).
   Férias sozinha é 53% de toda a ausência — misturá-la com atestado e falta
   inflaria o indicador e esconderia o que de fato é problema de gestão. */
export const PLANEJADAS = [
  "Férias", "Abono", "Folga Gestor", "Externo", "Amamentação",
  "Licença Maternidade", "Licença Paternidade", "Licença Casamento",
];

const soma = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const MES_CURTO = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

/* ---------- Quadro de pessoal (sem recorte: a folha é uma foto do momento) ---------- */

/** Conta apenas quem tem registro completo na folha.
 *  Cruzar por nome com os desligamentos superestimava, porque 13 dos 34
 *  registros têm nome parcial e não casam com o cadastro. */
export const headcountAtivo = () =>
  base.funcionarios.filter((f) => f.Fonte_Cadastro === "Folha de pagamento (completo)").length;

export const folhaSalarial = () => soma(base.funcionarios.map((f) => f.Salario ?? 0));

export const salarioMedio = () => {
  const comSalario = base.funcionarios.filter((f) => f.Salario != null);
  return comSalario.length ? folhaSalarial() / comSalario.length : 0;
};

/* ---------- Ponto e absenteísmo ---------- */

export const horasPorCategoria = (p: Ponto[], categoria: string) =>
  soma(p.filter((x) => x.Categoria === categoria).map((x) => x.Horas));

export const horasPrevistas = (p: Ponto[]) => horasPorCategoria(p, "Horas Previstas");
export const horasTrabalhadas = (p: Ponto[]) => horasPorCategoria(p, "Horas Trabalhadas");

const ausencias = (p: Ponto[]) => p.filter((x) => x.Grupo === "Ausência (detalhe)");

export const horasNaoPlanejadas = (p: Ponto[]) =>
  soma(ausencias(p).filter((x) => !PLANEJADAS.includes(x.Categoria)).map((x) => x.Horas));

export const horasPlanejadas = (p: Ponto[]) =>
  soma(ausencias(p).filter((x) => PLANEJADAS.includes(x.Categoria)).map((x) => x.Horas));

export const absenteismoNaoPlanejado = (p: Ponto[]) =>
  horasPrevistas(p) ? horasNaoPlanejadas(p) / horasPrevistas(p) : 0;
export const ausenciaPlanejadaPct = (p: Ponto[]) =>
  horasPrevistas(p) ? horasPlanejadas(p) / horasPrevistas(p) : 0;
export const aderenciaJornada = (p: Ponto[]) =>
  horasPrevistas(p) ? horasTrabalhadas(p) / horasPrevistas(p) : 0;
export const pctPericiaSobreNaoPlanejado = (p: Ponto[]) =>
  horasNaoPlanejadas(p) ? horasPorCategoria(p, "Perícia") / horasNaoPlanejadas(p) : 0;

export function deptosPorAbsenteismo(p: Ponto[]) {
  const nomes = Array.from(new Set(p.map((x) => x.Departamento)));
  return nomes
    .map((dep) => {
      const linhas = p.filter((x) => x.Departamento === dep);
      const prev = soma(linhas.filter((l) => l.Categoria === "Horas Previstas").map((l) => l.Horas));
      const nao = soma(
        linhas.filter((l) => l.Grupo === "Ausência (detalhe)" && !PLANEJADAS.includes(l.Categoria))
              .map((l) => l.Horas)
      );
      return { departamento: dep, previstas: prev, naoPlanejadas: nao, pct: prev ? nao / prev : 0 };
    })
    .filter((d) => d.previstas > 0)
    .sort((a, b) => b.pct - a.pct);
}

export function causasNaoPlanejadas(p: Ponto[]) {
  const cats = Array.from(new Set(ausencias(p).map((x) => x.Categoria)))
    .filter((c) => !PLANEJADAS.includes(c));
  return cats
    .map((c) => ({ categoria: c, horas: horasPorCategoria(p, c) }))
    .filter((c) => c.horas > 0)
    .sort((a, b) => b.horas - a.horas);
}

export function composicaoAusencia(p: Ponto[]) {
  const cats = Array.from(new Set(ausencias(p).map((x) => x.Categoria)));
  return cats
    .map((c) => ({ categoria: c, horas: horasPorCategoria(p, c), planejada: PLANEJADAS.includes(c) }))
    .filter((c) => c.horas > 0)
    .sort((a, b) => b.horas - a.horas);
}

export const listaDepartamentos = () =>
  Array.from(new Set(base.ponto.map((p) => p.Departamento))).sort();

/* ---------- Afastamentos ---------- */

export const totalPorTipo = (a: Afastamento[], tipo: string) =>
  a.filter((x) => x.Tipo === tipo).length;

export const diasPerdidos = (a: Afastamento[]) => soma(a.map((x) => x.Dias ?? 0));

/** Ignora o registro com datas invertidas (Dias nulo) nos dois lados da conta. */
export const mediaDiasPorOcorrencia = (a: Afastamento[]) => {
  const validos = a.filter((x) => x.Dias != null);
  return validos.length ? soma(validos.map((x) => x.Dias as number)) / validos.length : 0;
};

export function afastamentosPorMes(a: Afastamento[]) {
  return MES_CURTO.map((nome, i) => {
    const doMes = a.filter((x) => x.Mes === i + 1);
    return {
      mes: nome,
      atestados: doMes.filter((x) => x.Tipo === "Atestado Médico").length,
      faltas: doMes.filter((x) => x.Tipo === "Falta").length,
    };
  }).filter((m) => m.atestados > 0 || m.faltas > 0);
}

export function afastamentosPorUnidade(a: Afastamento[]) {
  const lojas = Array.from(new Set(a.map((x) => x.Loja)));
  return lojas.map((loja) => ({
    loja,
    atestados: a.filter((x) => x.Loja === loja && x.Tipo === "Atestado Médico").length,
    faltas: a.filter((x) => x.Loja === loja && x.Tipo === "Falta").length,
  }));
}

export function topColaboradores(a: Afastamento[], limite = 8) {
  const mapa = new Map<string, { nome: string; ocorrencias: number; dias: number }>();
  for (const x of a) {
    const at = mapa.get(x.Nome) ?? { nome: x.Nome, ocorrencias: 0, dias: 0 };
    at.ocorrencias += 1;
    at.dias += x.Dias ?? 0;
    mapa.set(x.Nome, at);
  }
  return Array.from(mapa.values()).sort((p, q) => q.ocorrencias - p.ocorrencias).slice(0, limite);
}

export function motivosAtestado(a: Afastamento[], limite = 6) {
  const so = a.filter((x) => x.Tipo === "Atestado Médico" && !x.Motivo.startsWith("Não informado"));
  const mapa = new Map<string, number>();
  for (const x of so) mapa.set(x.Motivo, (mapa.get(x.Motivo) ?? 0) + 1);
  return Array.from(mapa, ([motivo, qtd]) => ({ motivo, qtd }))
    .sort((p, q) => q.qtd - p.qtd).slice(0, limite);
}

export const listaUnidades = () =>
  Array.from(new Set(base.afastamentos.map((a) => a.Loja))).sort();

/* ---------- Turnover ---------- */

/** Só meses fechados. Set–Dez estão em branco na base; a planilha original
 *  os contava como zero, o que puxava a média de 7,1% para 4,7%. */
export const mesesFechados = (t: Turnover[]) => t.filter((x) => x.Total_Desligamentos != null);

const mediaDe = (t: Turnover[], campo: keyof Turnover) => {
  const vs = mesesFechados(t).map((x) => x[campo] as number).filter((v) => v != null);
  return vs.length ? soma(vs) / vs.length : 0;
};

export const turnoverGeralMedio = (t: Turnover[]) => mediaDe(t, "Turnover_Geral_Pct");
export const turnoverVoluntarioMedio = (t: Turnover[]) => mediaDe(t, "Turnover_Voluntario_Pct");
export const totalAdmissoes = (t: Turnover[]) => soma(mesesFechados(t).map((x) => x.Admissoes ?? 0));
export const totalDesligamentosTurnover = (t: Turnover[]) =>
  soma(mesesFechados(t).map((x) => x.Total_Desligamentos ?? 0));
export const saldoQuadro = (t: Turnover[]) => totalAdmissoes(t) - totalDesligamentosTurnover(t);

export const headcountAtual = (t: Turnover[]) => {
  const f = mesesFechados(t).filter((x) => x.Func_Fim != null);
  return f.length ? (f[f.length - 1].Func_Fim as number) : 0;
};

export const evolucaoQuadro = (t: Turnover[]) =>
  mesesFechados(t).map((x) => ({
    mes: x.Mes.slice(0, 3),
    admissoes: x.Admissoes ?? 0,
    desligamentos: x.Total_Desligamentos ?? 0,
    headcount: x.Media_Func ?? 0,
    turnoverGeral: (x.Turnover_Geral_Pct ?? 0) * 100,
    turnoverVoluntario: (x.Turnover_Voluntario_Pct ?? 0) * 100,
  }));

export const mesMaisMovimentado = (t: Turnover[]) => {
  const l = mesesFechados(t)
    .map((x) => ({ mes: x.Mes, total: (x.Admissoes ?? 0) + (x.Total_Desligamentos ?? 0) }))
    .sort((a, b) => b.total - a.total);
  return l[0];
};

/* ---------- Desligamentos ---------- */

export const pctPorTipo = (d: Desligamento[], tipos: string[]) =>
  d.length ? d.filter((x) => tipos.includes(x.Tipo_Demissao)).length / d.length : 0;

export function porTipoDemissao(d: Desligamento[]) {
  const mapa = new Map<string, number>();
  for (const x of d) mapa.set(x.Tipo_Demissao, (mapa.get(x.Tipo_Demissao) ?? 0) + 1);
  return Array.from(mapa, ([tipo, qtd]) => ({ tipo, qtd })).sort((a, b) => b.qtd - a.qtd);
}

export function porMotivoPrincipal(d: Desligamento[], limite = 6) {
  const mapa = new Map<string, number>();
  for (const x of d) mapa.set(x.Motivo_Principal, (mapa.get(x.Motivo_Principal) ?? 0) + 1);
  return Array.from(mapa, ([motivo, qtd]) => ({ motivo, qtd }))
    .sort((a, b) => b.qtd - a.qtd).slice(0, limite);
}

export const listaTiposDemissao = () =>
  Array.from(new Set(base.desligamentos.map((d) => d.Tipo_Demissao))).sort();

export const listaMotivos = () =>
  Array.from(new Set(base.desligamentos.map((d) => d.Motivo_Principal))).sort();
