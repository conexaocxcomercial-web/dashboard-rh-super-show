const ptBR = "pt-BR";

export const num = (v: number, casas = 0) =>
  v.toLocaleString(ptBR, { minimumFractionDigits: casas, maximumFractionDigits: casas });

export const moeda = (v: number) =>
  v.toLocaleString(ptBR, { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const moedaCurta = (v: number) =>
  v >= 1000 ? `R$ ${(v / 1000).toLocaleString(ptBR, { maximumFractionDigits: 1 })}k` : moeda(v);

export const pct = (v: number, casas = 1) =>
  `${(v * 100).toLocaleString(ptBR, { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`;

export const horas = (v: number) => `${num(v)}h`;

export const comSinal = (v: number) => (v > 0 ? `+${num(v)}` : num(v));
