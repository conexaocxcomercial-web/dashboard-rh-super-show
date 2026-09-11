import { Kpi, Painel, Cabecalho, Destaques } from "@/components/ui";
import BarraFiltros from "@/components/Filtros";
import { GraficoEvolucaoQuadro, GraficoRanking, GraficoUnidades } from "@/components/charts";
import * as m from "@/lib/metrics";
import { lerFiltros, filtrarAfastamentos, filtrarDesligamentos, filtrarTurnover } from "@/lib/filtros";
import { num, moedaCurta, moeda, pct, comSinal } from "@/lib/format";

export default function VisaoGeral({ searchParams }: { searchParams: Record<string, string> }) {
  const f = lerFiltros(searchParams);
  const afast = filtrarAfastamentos(m.base.afastamentos, f);
  const desl = filtrarDesligamentos(m.base.desligamentos, f);
  const turn = filtrarTurnover(m.base.turnover, f);

  const saldo = m.saldoQuadro(turn);
  const movimentado = m.mesMaisMovimentado(turn);
  const pericia = m.horasPorCategoria(m.base.ponto, "Perícia");

  return (
    <>
      <Cabecalho
        titulo="Visão geral de RH"
        subtitulo="Cidade das Rosas · 2026"
        aviso="Felipe Camarão aparece somente no bloco de afastamentos: não há dados de folha nem de turnover para a unidade."
      />

      <BarraFiltros campos={[
        { tipo: "periodo" },
        { tipo: "select", nome: "unidade", rotulo: "Unidade",
          opcoes: m.listaUnidades().map((u) => ({ valor: u, rotulo: u })) },
      ]} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
        <Kpi rotulo="Headcount ativo" valor={num(m.headcountAtivo())}
             apoio={`${num(m.headcountAtual(turn))} na loja pelo controle de turnover`} />
        <Kpi rotulo="Folha salarial" valor={moedaCurta(m.folhaSalarial())}
             apoio={`média ${moeda(m.salarioMedio())}`} />
        <Kpi rotulo="Turnover geral médio" valor={pct(m.turnoverGeralMedio(turn))}
             apoio="ao mês" tom="alerta" />
        <Kpi rotulo="Absenteísmo não planejado" valor={pct(m.absenteismoNaoPlanejado(m.base.ponto))}
             apoio="da jornada prevista" tom="marca" />
        <Kpi rotulo="Saldo do quadro" valor={comSinal(saldo)}
             apoio={`${m.totalAdmissoes(turn)} entradas · ${m.totalDesligamentosTurnover(turn)} saídas`}
             tom={saldo < 0 ? "alerta" : "positivo"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-3 mb-3">
        <Painel titulo="Evolução do quadro" className="lg:col-span-2"
                nota="Colunas: movimentações do mês. Linha: headcount médio.">
          <GraficoEvolucaoQuadro dados={m.evolucaoQuadro(turn)} />
        </Painel>
        <Painel titulo="Principais motivos de saída">
          <GraficoRanking dados={m.porMotivoPrincipal(desl, 4)} chaveRotulo="motivo"
                          chaveValor="qtd" altura={260} destacarPrimeiro />
        </Painel>
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <Painel titulo="Afastamentos por unidade" nota={`${afast.length} registros no recorte atual.`}>
          <GraficoUnidades dados={m.afastamentosPorUnidade(afast)} />
        </Painel>
        <div className="lg:col-span-2">
          <Destaques itens={[
            { titulo: "Perícia concentrada.",
              texto: `${num(pericia)}h em Produção Cidade das Rosas — ${pct(m.pctPericiaSobreNaoPlanejado(m.base.ponto), 0)} de todo o absenteísmo não planejado da empresa, num único departamento.` },
            { titulo: "Fim de experiência domina as saídas.",
              texto: `${pct(m.pctPorTipo(desl, ["Termino de contrato de experiencia", "Pedido de demissão na experiencia"]), 0)} dos desligamentos ocorrem ainda no contrato de experiência, o que aponta para seleção, não retenção.` },
            { titulo: `${movimentado?.mes ?? "—"} foi o mês mais movimentado.`,
              texto: `${movimentado?.total ?? 0} movimentações somando entradas e saídas.` },
          ]} />
        </div>
      </div>
    </>
  );
}
