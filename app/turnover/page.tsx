import { Kpi, Painel, Cabecalho } from "@/components/ui";
import { GraficoEvolucaoQuadro, GraficoTurnover } from "@/components/charts";
import * as m from "@/lib/metrics";
import { num, pct, comSinal } from "@/lib/format";

export default function Turnover() {
  const evolucao = m.evolucaoQuadro();
  const saldo = m.saldoQuadro();

  return (
    <>
      <Cabecalho
        titulo="Turnover e retenção"
        subtitulo="Evolução mensal do quadro — Cidade das Rosas"
        aviso="A média considera apenas os meses fechados. A planilha original dividia por 12 e contava setembro a dezembro como zero, o que reduzia o indicador de 7,1% para 4,7%."
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
        <Kpi rotulo="Turnover geral médio" valor={pct(m.turnoverGeralMedio())} apoio="ao mês" tom="alerta" />
        <Kpi rotulo="Turnover voluntário" valor={pct(m.turnoverVoluntarioMedio())} apoio="por decisão do colaborador" />
        <Kpi rotulo="Admissões" valor={num(m.totalAdmissoes())} apoio="no período" />
        <Kpi rotulo="Desligamentos" valor={num(m.totalDesligamentosTurnover())} apoio="no período" />
        <Kpi rotulo="Saldo do quadro" valor={comSinal(saldo)}
             apoio={`headcount atual: ${num(m.headcountAtual())}`}
             tom={saldo < 0 ? "alerta" : "positivo"} />
      </div>

      <div className="mb-3">
        <Painel titulo="Admissões, desligamentos e headcount por mês"
                nota="Meses em que a coluna rosa supera a roxa indicam encolhimento do quadro.">
          <GraficoEvolucaoQuadro dados={evolucao} />
        </Painel>
      </div>

      <Painel titulo="Turnover geral e voluntário (%)"
              nota="A distância entre as duas linhas mostra quanto da rotatividade parte da empresa e quanto parte do colaborador.">
        <GraficoTurnover dados={evolucao} />
      </Painel>
    </>
  );
}
