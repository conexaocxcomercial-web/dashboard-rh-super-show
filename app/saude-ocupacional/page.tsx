import { Kpi, Painel, Cabecalho } from "@/components/ui";
import { GraficoSerieAfastamentos, GraficoRanking, GraficoUnidades } from "@/components/charts";
import * as m from "@/lib/metrics";
import { num } from "@/lib/format";

export default function SaudeOcupacional() {
  const serie = m.afastamentosPorMes();
  const motivos = m.motivosAtestado(6);
  const unidades = m.afastamentosPorUnidade();
  const top = m.topColaboradores(8);

  return (
    <>
      <Cabecalho
        titulo="Saúde ocupacional"
        subtitulo="Atestados médicos e faltas, por período, unidade e colaborador"
        aviso="Os atestados pesam muito mais que as faltas nesta operação — por isso ocupam o espaço principal da página."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Kpi rotulo="Atestados médicos" valor={num(m.totalPorTipo("Atestado Médico"))} tom="marca" />
        <Kpi rotulo="Faltas" valor={num(m.totalPorTipo("Falta"))} />
        <Kpi rotulo="Dias perdidos" valor={num(m.diasPerdidos())} apoio="soma dos afastamentos" />
        <Kpi rotulo="Média por ocorrência" valor={`${m.mediaDiasPorOcorrencia().toFixed(1)} dias`}
             apoio="separa afastamento curto de longo" />
      </div>

      <div className="grid lg:grid-cols-3 gap-3 mb-3">
        <Painel titulo="Atestados e faltas ao longo do ano" className="lg:col-span-2"
                nota="Picos ajudam a identificar sazonalidade, como surtos de virose.">
          <GraficoSerieAfastamentos dados={serie} />
        </Painel>
        <Painel titulo="Por unidade">
          <GraficoUnidades dados={unidades} />
        </Painel>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <Painel titulo="Motivos de atestado mais frequentes"
                nota="Registros sem motivo preenchido ficam fora do ranking.">
          <GraficoRanking dados={motivos} chaveRotulo="motivo" chaveValor="qtd" altura={230} />
        </Painel>
        <Painel titulo="Colaboradores com mais afastamentos"
                nota="Serve para direcionar apoio de RH, não para punição.">
          <div className="overflow-x-auto">
            <table className="w-full text-[0.78rem]">
              <thead>
                <tr className="text-[var(--muted)] border-b border-[var(--line)]">
                  <th className="text-left font-medium py-1.5">Colaborador</th>
                  <th className="text-right font-medium">Ocorrências</th>
                  <th className="text-right font-medium">Dias</th>
                </tr>
              </thead>
              <tbody>
                {top.map((c) => (
                  <tr key={c.nome} className="border-b border-[var(--line)] last:border-0">
                    <td className="py-1.5 pr-2">{c.nome}</td>
                    <td className="text-right tnum">{c.ocorrencias}</td>
                    <td className="text-right tnum">{c.dias}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Painel>
      </div>
    </>
  );
}
