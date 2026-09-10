import { Kpi, Painel, Cabecalho, Destaques } from "@/components/ui";
import { GraficoEvolucaoQuadro, GraficoRanking, GraficoUnidades } from "@/components/charts";
import * as m from "@/lib/metrics";
import { num, moedaCurta, moeda, pct, comSinal } from "@/lib/format";

export default function VisaoGeral() {
  const evolucao = m.evolucaoQuadro();
  const motivos = m.porMotivoPrincipal(4);
  const unidades = m.afastamentosPorUnidade();
  const saldo = m.saldoQuadro();
  const movimentado = m.mesMaisMovimentado();

  return (
    <>
      <Cabecalho
        titulo="Visão geral de RH"
        subtitulo="Cidade das Rosas · janeiro a agosto de 2026"
        aviso="Felipe Camarão aparece somente no bloco de afastamentos: não há dados de folha nem de turnover para a unidade."
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
        <Kpi rotulo="Headcount ativo" valor={num(m.headcountAtivo())}
             apoio={`${num(m.headcountAtual())} na loja pelo controle de turnover`} />
        <Kpi rotulo="Folha salarial" valor={moedaCurta(m.folhaSalarial())}
             apoio={`média ${moeda(m.salarioMedio())}`} />
        <Kpi rotulo="Turnover geral médio" valor={pct(m.turnoverGeralMedio())}
             apoio="ao mês" tom="alerta" />
        <Kpi rotulo="Absenteísmo não planejado" valor={pct(m.absenteismoNaoPlanejado())}
             apoio="da jornada prevista" tom="marca" />
        <Kpi rotulo="Saldo do quadro" valor={comSinal(saldo)}
             apoio={`${m.totalAdmissoes()} entradas · ${m.totalDesligamentosTurnover()} saídas`}
             tom={saldo < 0 ? "alerta" : "positivo"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-3 mb-3">
        <Painel titulo="Evolução do quadro" className="lg:col-span-2"
                nota="Colunas: movimentações do mês. Linha: headcount médio.">
          <GraficoEvolucaoQuadro dados={evolucao} />
        </Painel>
        <Painel titulo="Principais motivos de saída">
          <GraficoRanking dados={motivos} chaveRotulo="motivo" chaveValor="qtd" altura={260} destacarPrimeiro />
        </Painel>
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <Painel titulo="Afastamentos por unidade">
          <GraficoUnidades dados={unidades} />
        </Painel>
        <div className="lg:col-span-2">
          <Destaques itens={[
            { titulo: "Perícia concentrada.",
              texto: `${num(m.horasPorCategoria("Perícia"))}h em Produção Cidade das Rosas — ${pct(m.pctPericiaSobreNaoPlanejado(), 0)} de todo o absenteísmo não planejado da empresa, num único departamento.` },
            { titulo: "Fim de experiência domina as saídas.",
              texto: `${pct(m.pctPorTipo(["Termino de contrato de experiencia", "Pedido de demissão na experiencia"]), 0)} dos desligamentos ocorrem ainda no contrato de experiência, o que aponta para seleção, não retenção.` },
            { titulo: `${movimentado?.mes} foi o mês mais movimentado.`,
              texto: `${movimentado?.total} movimentações somando entradas e saídas.` },
          ]} />
        </div>
      </div>
    </>
  );
}
