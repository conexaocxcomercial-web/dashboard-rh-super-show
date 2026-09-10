import { Kpi, Painel, Cabecalho } from "@/components/ui";
import { GraficoRanking, GraficoTipoDemissao } from "@/components/charts";
import * as m from "@/lib/metrics";
import { num, pct } from "@/lib/format";

const EXPERIENCIA = ["Termino de contrato de experiencia", "Pedido de demissão na experiencia"];
const VOLUNTARIO = ["Pedido de demissão", "Pedido de demissão na experiencia"];

export default function Desligamentos() {
  const tipos = m.porTipoDemissao();
  const motivos = m.porMotivoPrincipal(6);
  const registros = [...m.base.desligamentos].sort((a, b) => b.Data_Saida.localeCompare(a.Data_Saida));

  return (
    <>
      <Cabecalho
        titulo="Análise de desligamentos"
        subtitulo="Motivos, tipos e perfis das saídas registradas em 2026"
        aviso="13 dos 34 registros têm apenas nome parcial na base original e não foram vinculados ao cadastro de funcionários."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Kpi rotulo="Total de desligamentos" valor={num(m.totalDesligamentos())} apoio="jan a ago de 2026" />
        <Kpi rotulo="Ainda na experiência" valor={pct(m.pctPorTipo(EXPERIENCIA), 0)}
             apoio="sinaliza seleção, não retenção" tom="alerta" />
        <Kpi rotulo="Decisão da empresa" valor={pct(m.pctPorTipo(["Demissão pela empresa"]), 0)} />
        <Kpi rotulo="Pedido do colaborador" valor={pct(m.pctPorTipo(VOLUNTARIO), 0)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-3 mb-3">
        <Painel titulo="Tipo de desligamento">
          <GraficoTipoDemissao dados={tipos} />
        </Painel>
        <Painel titulo="Motivo principal da saída">
          <GraficoRanking dados={motivos} chaveRotulo="motivo" chaveValor="qtd" altura={210} destacarPrimeiro />
        </Painel>
      </div>

      <Painel titulo="Registros individuais"
              nota={`${registros.length} desligamentos, do mais recente para o mais antigo.`}>
        <div className="overflow-x-auto max-h-[420px]">
          <table className="w-full text-[0.78rem]">
            <thead className="sticky top-0 bg-[var(--surface)]">
              <tr className="text-[var(--muted)] border-b border-[var(--line)]">
                <th className="text-left font-medium py-1.5">Saída</th>
                <th className="text-left font-medium">Cargo</th>
                <th className="text-left font-medium">Tipo</th>
                <th className="text-left font-medium">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((d) => (
                <tr key={d.ID_Desligamento} className="border-b border-[var(--line)] last:border-0">
                  <td className="py-1.5 pr-3 tnum whitespace-nowrap">
                    {d.Data_Saida.split("-").reverse().slice(0, 2).join("/")}
                  </td>
                  <td className="pr-3">{d.Cargo_Setor ?? "—"}</td>
                  <td className="pr-3">{d.Tipo_Demissao}</td>
                  <td>{d.Motivo_Principal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Painel>
    </>
  );
}
