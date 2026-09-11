import { Kpi, Painel, Cabecalho, Alerta } from "@/components/ui";
import BarraFiltros from "@/components/Filtros";
import { GraficoRanking, GraficoComposicao } from "@/components/charts";
import * as m from "@/lib/metrics";
import { lerFiltros, filtrarPonto } from "@/lib/filtros";
import { num, pct } from "@/lib/format";

export default function Absenteismo({ searchParams }: { searchParams: Record<string, string> }) {
  const f = lerFiltros(searchParams);
  const p = filtrarPonto(m.base.ponto, f);

  const deptos = m.deptosPorAbsenteismo(p).slice(0, 8).map((d) => ({
    departamento: d.departamento.replace(" CIDADE DAS ROSAS", " CDR"),
    pct: Number((d.pct * 100).toFixed(1)),
  }));
  const causas = m.causasNaoPlanejadas(p).map((c) => ({ ...c, horas: Math.round(c.horas) }));
  const composicao = m.composicaoAusencia(p).map((c) => ({ ...c, horas: Math.round(c.horas) }));
  const faltaNJ = m.horasPorCategoria(p, "Falta Não Justificada");
  const prev = m.horasPrevistas(p);
  const pericia = m.horasPorCategoria(p, "Perícia");

  return (
    <>
      <Cabecalho
        titulo="Absenteísmo por departamento"
        subtitulo="Horas não trabalhadas, separadas entre planejadas e não planejadas"
        aviso="Férias e licenças ficam fora do indicador principal: são direito e são programáveis, então não medem problema de gestão."
      />

      <BarraFiltros campos={[
        { tipo: "select", nome: "departamento", rotulo: "Departamento",
          opcoes: m.listaDepartamentos().map((d) => ({ valor: d, rotulo: d })) },
      ]} />

      <p className="text-[0.7rem] text-[var(--muted)] -mt-2 mb-4">
        O relatório de ponto é um total acumulado do período, sem data e sem unidade na origem.
        Por isso esta página aceita recorte apenas por departamento.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Kpi rotulo="Absenteísmo não planejado" valor={pct(m.absenteismoNaoPlanejado(p))}
             apoio={`${num(m.horasNaoPlanejadas(p))}h · indicador de gestão`} tom="alerta" />
        <Kpi rotulo="Ausência planejada" valor={pct(m.ausenciaPlanejadaPct(p))}
             apoio={`${num(m.horasPlanejadas(p))}h · férias e licenças`} />
        <Kpi rotulo="Aderência à jornada" valor={pct(m.aderenciaJornada(p))}
             apoio={`${num(m.horasTrabalhadas(p))}h de ${num(prev)}h`} />
        <Kpi rotulo="Falta não justificada" valor={pct(prev ? faltaNJ / prev : 0)}
             apoio={`${num(faltaNJ)}h`} tom={prev && faltaNJ / prev > 0.02 ? "alerta" : "positivo"} />
      </div>

      {pericia > 0 && (
        <div className="mb-3">
          <Alerta titulo="Perícia concentrada em Produção Cidade das Rosas">
            <p>
              {num(pericia)}h de perícia do INSS, o equivalente a{" "}
              <strong>{pct(m.pctPericiaSobreNaoPlanejado(p), 0)} do absenteísmo não planejado</strong> no
              recorte atual. Afastamento previdenciário nesse volume, concentrado em produção, costuma
              indicar questão ergonômica ou de saúde ocupacional — vale investigar antes que vire
              passivo trabalhista.
            </p>
          </Alerta>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-3 mb-3">
        <Painel titulo="Departamentos por absenteísmo não planejado"
                nota="Férias e licenças excluídas do cálculo.">
          <GraficoRanking dados={deptos} chaveRotulo="departamento" chaveValor="pct"
                          altura={250} destacarPrimeiro sufixo="%" />
        </Painel>
        <Painel titulo="Causas do absenteísmo não planejado">
          <GraficoRanking dados={causas} chaveRotulo="categoria" chaveValor="horas"
                          altura={250} destacarPrimeiro sufixo="h" />
        </Painel>
      </div>

      <Painel titulo="Composição completa da ausência"
              nota="Roxo claro: planejada. Rosa: não planejada.">
        <GraficoComposicao dados={composicao} />
      </Painel>
    </>
  );
}
