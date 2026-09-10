"use client";

import {
  BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { useCoresTema, estiloTooltip, eixo } from "./base";

/* Combo: admissões x desligamentos (colunas) + headcount médio (linha) */
export function GraficoEvolucaoQuadro({ dados }: { dados: any[] }) {
  const c = useCoresTema();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={dados} margin={{ top: 6, right: -8, left: -24, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="mes" {...eixo(c)} />
        {/* Eixo esquerdo: movimentações (0–10). Eixo direito: headcount (~60).
            Sem separar, as barras ficariam achatadas contra a linha. */}
        <YAxis yAxisId="mov" {...eixo(c)} allowDecimals={false} />
        <YAxis yAxisId="hc" orientation="right" {...eixo(c)}
               domain={[0, (max: number) => Math.ceil((max * 1.15) / 10) * 10]} />
        <Tooltip {...estiloTooltip(c)} />
        <Legend wrapperStyle={{ fontSize: 11, color: c.muted }} iconType="circle" iconSize={7} />
        <Bar yAxisId="mov" dataKey="admissoes" name="Admissões" fill={c.marca} radius={[3, 3, 0, 0]} maxBarSize={18} />
        <Bar yAxisId="mov" dataKey="desligamentos" name="Desligamentos" fill={c.magenta} radius={[3, 3, 0, 0]} maxBarSize={18} />
        <Line yAxisId="hc" type="monotone" dataKey="headcount" name="Headcount médio" stroke={c.ink}
              strokeWidth={2} dot={{ r: 2.5, fill: c.ink }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* Barras horizontais ordenadas — para rankings */
export function GraficoRanking({
  dados, chaveRotulo, chaveValor, altura = 220, destacarPrimeiro = false, sufixo = "",
}: {
  dados: any[]; chaveRotulo: string; chaveValor: string;
  altura?: number; destacarPrimeiro?: boolean; sufixo?: string;
}) {
  const c = useCoresTema();
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={dados} layout="vertical" margin={{ top: 2, right: 52, left: 6, bottom: 2 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category" dataKey={chaveRotulo} width={132}
          tick={{ fill: c.muted, fontSize: 11 }} axisLine={false} tickLine={false}
        />
        <Tooltip {...estiloTooltip(c)} cursor={{ fill: c.grid }} />
        <Bar dataKey={chaveValor} radius={[0, 3, 3, 0]} maxBarSize={18}>
          {dados.map((_, i) => (
            <Cell key={i} fill={destacarPrimeiro && i === 0 ? c.magenta : c.marca} />
          ))}
          <LabelList
            dataKey={chaveValor} position="right"
            formatter={(v: number) => `${typeof v === "number" ? v.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : v}${sufixo}`}
            style={{ fill: c.muted, fontSize: 11 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* Colunas agrupadas por unidade, fatiadas por tipo */
export function GraficoUnidades({ dados }: { dados: any[] }) {
  const c = useCoresTema();
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={dados} margin={{ top: 6, right: 6, left: -24, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="loja" {...eixo(c)} />
        <YAxis {...eixo(c)} />
        <Tooltip {...estiloTooltip(c)} cursor={{ fill: c.grid }} />
        <Legend wrapperStyle={{ fontSize: 11, color: c.muted }} iconType="circle" iconSize={7} />
        <Bar dataKey="atestados" name="Atestados" fill={c.marca} radius={[3, 3, 0, 0]} maxBarSize={34} />
        <Bar dataKey="faltas" name="Faltas" fill={c.lavanda} radius={[3, 3, 0, 0]} maxBarSize={34} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* Séries temporais de atestados x faltas */
export function GraficoSerieAfastamentos({ dados }: { dados: any[] }) {
  const c = useCoresTema();
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={dados} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="mes" {...eixo(c)} />
        <YAxis {...eixo(c)} />
        <Tooltip {...estiloTooltip(c)} />
        <Legend wrapperStyle={{ fontSize: 11, color: c.muted }} iconType="circle" iconSize={7} />
        <Line type="monotone" dataKey="atestados" name="Atestados" stroke={c.marca}
              strokeWidth={2.5} dot={{ r: 3, fill: c.marca }} />
        <Line type="monotone" dataKey="faltas" name="Faltas" stroke={c.magenta}
              strokeWidth={2.5} dot={{ r: 3, fill: c.magenta }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* Turnover geral x voluntário, em % */
export function GraficoTurnover({ dados }: { dados: any[] }) {
  const c = useCoresTema();
  return (
    <ResponsiveContainer width="100%" height={230}>
      <LineChart data={dados} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="mes" {...eixo(c)} />
        <YAxis {...eixo(c)} unit="%" />
        <Tooltip {...estiloTooltip(c)} formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
        <Legend wrapperStyle={{ fontSize: 11, color: c.muted }} iconType="circle" iconSize={7} />
        <Line type="monotone" dataKey="turnoverGeral" name="Geral" stroke={c.magenta}
              strokeWidth={2.5} dot={{ r: 3, fill: c.magenta }} />
        <Line type="monotone" dataKey="turnoverVoluntario" name="Voluntário" stroke={c.marca}
              strokeWidth={2.5} dot={{ r: 3, fill: c.marca }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* Composição da ausência — planejada x não planejada, cores distintas */
export function GraficoComposicao({ dados }: { dados: any[] }) {
  const c = useCoresTema();
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={dados} layout="vertical" margin={{ top: 2, right: 56, left: 6, bottom: 2 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="categoria" width={126}
               tick={{ fill: c.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...estiloTooltip(c)} cursor={{ fill: c.grid }}
                 formatter={(v: any) => `${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}h`} />
        <Bar dataKey="horas" name="Horas" radius={[0, 3, 3, 0]} maxBarSize={17}>
          {dados.map((d, i) => (
            <Cell key={i} fill={d.planejada ? c.lavanda : c.magenta} />
          ))}
          <LabelList dataKey="horas" position="right"
                     formatter={(v: number) => `${Math.round(v).toLocaleString("pt-BR")}h`}
                     style={{ fill: c.muted, fontSize: 11 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* Desligamentos por tipo */
export function GraficoTipoDemissao({ dados }: { dados: any[] }) {
  const c = useCoresTema();
  const paleta = [c.magenta, c.marca, c.lavanda, c.lima];
  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={dados} layout="vertical" margin={{ top: 2, right: 44, left: 6, bottom: 2 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="tipo" width={150}
               tick={{ fill: c.muted, fontSize: 10.5 }} axisLine={false} tickLine={false} />
        <Tooltip {...estiloTooltip(c)} cursor={{ fill: c.grid }} />
        <Bar dataKey="qtd" name="Desligamentos" radius={[0, 3, 3, 0]} maxBarSize={20}>
          {dados.map((_, i) => <Cell key={i} fill={paleta[i % paleta.length]} />)}
          <LabelList dataKey="qtd" position="right" style={{ fill: c.muted, fontSize: 11 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
