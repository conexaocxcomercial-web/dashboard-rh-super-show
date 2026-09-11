/** Filtros lidos da URL (?unidade=...&de=3&ate=8).
 *
 *  Manter o estado na URL, e não em memória, traz três vantagens:
 *  o link já carrega a visão filtrada e pode ser compartilhado com o cliente,
 *  o botão voltar do navegador funciona, e os dados continuam no servidor
 *  em vez de serem despachados para o navegador. */

import type { Afastamento, Desligamento, Ponto, Turnover } from "./types";

export const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

/** Faixas de duração — separam afastamento pontual de afastamento prolongado,
 *  que exigem respostas de RH completamente diferentes. */
export const FAIXAS_DIAS = [
  { id: "1",    rotulo: "1 dia",        min: 1,  max: 1 },
  { id: "2-3",  rotulo: "2 a 3 dias",   min: 2,  max: 3 },
  { id: "4-7",  rotulo: "4 a 7 dias",   min: 4,  max: 7 },
  { id: "8+",   rotulo: "8 dias ou +",  min: 8,  max: Infinity },
];

export type Filtros = {
  unidade?: string;
  de: number;          // mês inicial (1–12)
  ate: number;         // mês final (1–12)
  tipo?: string;       // Atestado Médico | Falta
  faixa?: string;      // id de FAIXAS_DIAS
  departamento?: string;
  tipoDemissao?: string;
  motivo?: string;
};

type Params = { [k: string]: string | string[] | undefined };

const texto = (v: string | string[] | undefined) =>
  typeof v === "string" && v !== "" && v !== "todos" ? v : undefined;

const inteiro = (v: string | string[] | undefined, padrao: number) => {
  const n = Number(typeof v === "string" ? v : NaN);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : padrao;
};

export function lerFiltros(params: Params): Filtros {
  const de = inteiro(params.de, 1);
  const ate = inteiro(params.ate, 12);
  return {
    unidade: texto(params.unidade),
    de: Math.min(de, ate),
    ate: Math.max(de, ate),
    tipo: texto(params.tipo),
    faixa: texto(params.faixa),
    departamento: texto(params.departamento),
    tipoDemissao: texto(params.tipoDemissao),
    motivo: texto(params.motivo),
  };
}

export const filtrosAtivos = (f: Filtros) =>
  [f.unidade, f.tipo, f.faixa, f.departamento, f.tipoDemissao, f.motivo].filter(Boolean).length +
  (f.de !== 1 || f.ate !== 12 ? 1 : 0);

/* ---------- aplicação dos filtros ---------- */

export function filtrarAfastamentos(dados: Afastamento[], f: Filtros): Afastamento[] {
  const faixa = FAIXAS_DIAS.find((x) => x.id === f.faixa);
  return dados.filter((a) => {
    if (a.Mes < f.de || a.Mes > f.ate) return false;
    if (f.unidade && a.Loja !== f.unidade) return false;
    if (f.tipo && a.Tipo !== f.tipo) return false;
    if (faixa) {
      const d = a.Dias;
      if (d == null || d < faixa.min || d > faixa.max) return false;
    }
    return true;
  });
}

export function filtrarDesligamentos(dados: Desligamento[], f: Filtros): Desligamento[] {
  return dados.filter((d) => {
    if (d.Mes < f.de || d.Mes > f.ate) return false;
    if (f.tipoDemissao && d.Tipo_Demissao !== f.tipoDemissao) return false;
    if (f.motivo && d.Motivo_Principal !== f.motivo) return false;
    return true;
  });
}

export function filtrarTurnover(dados: Turnover[], f: Filtros): Turnover[] {
  return dados.filter((t) => t.Mes_Num >= f.de && t.Mes_Num <= f.ate);
}

/** O relatório de ponto é um total do período, sem data e sem unidade:
 *  só aceita recorte por departamento. Filtrar por mês aqui seria inventar
 *  precisão que o dado não tem. */
export function filtrarPonto(dados: Ponto[], f: Filtros): Ponto[] {
  if (!f.departamento) return dados;
  return dados.filter((p) => p.Departamento === f.departamento);
}
