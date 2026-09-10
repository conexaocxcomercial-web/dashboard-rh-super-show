import { Kpi, Painel, Cabecalho, Alerta } from "@/components/ui";
import { GraficoRanking, GraficoComposicao } from "@/components/charts";
import * as m from "@/lib/metrics";
import { num, pct } from "@/lib/format";

export default function Absenteismo() {
  const deptos = m.deptosPorAbsenteismo().slice(0, 8).map((d) => ({
    departamento: d.departamento.replace(" CIDADE DAS ROSAS", " CDR"),
    pct: Number((d.pct * 100).toFixed(1)),
  }));
  const causas = m.causasNaoPlanejadas().map((c) => ({ ...c, horas: Math.round(c.horas) }));
  const composicao = m.composicaoAusencia().map((c) => ({ ...c, horas: Math.round(c.horas) }));
  const pior = m.deptosPorAbsenteismo()[0];

  return (
    <>
      <Cabecalho
        titulo="Absenteísmo por departamento"
        subtitulo="Horas não trabalhadas, separadas entre planejadas e não planejadas"
        aviso="Férias e licenças ficam fora do indicador principal: são direito e são programáveis, então não medem problema de gestão."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Kpi rotulo="Absenteísmo não planejado" valor={pct(m.absenteismoNaoPlanejado())}
             apoio={`${num(m.horasNaoPlanejadas())}h · indicador de gestão`} tom="alerta" />
        <Kpi rotulo="Ausência planejada" valor={pct(m.ausenciaPlanejadaPct())}
             apoio={`${num(m.horasPlanejadas())}h · férias e licenças`} />
        <Kpi rotulo="Aderência à jornada" valor={pct(m.aderenciaJornada())}
             apoio={`${num(m.horasTrabalhadas())}h de ${num(m.horasPrevistas())}h`} />
        <Kpi rotulo="Falta não justificada" valor={pct(m.horasPorCategoria("Falta Não Justificada") / m.horasPrevistas())}
             apoio={`${num(m.horasPorCategoria("Falta Não Justificada"))}h · baixo`} tom="positivo" />
      </div>

      <div className="mb-3">
        <Alerta titulo="Perícia concentrada em Produção Cidade das Rosas">
          <p>
            {num(m.horasPorCategoria("Perícia"))}h de perícia do INSS, o equivalente a{" "}
            <strong>{pct(m.pctPericiaSobreNaoPlanejado(), 0)} de todo o absenteísmo não planejado</strong>,
            registradas num único departamento. Afastamento previdenciário nesse volume, concentrado
            em produção, costuma indicar questão ergonômica ou de saúde ocupacional — vale
            investigar antes que vire passivo trabalhista.
          </p>
        </Alerta>
      </div>

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
              nota="Roxo claro: planejada. Rosa: não planejada. Férias sozinha responde por mais da metade do total.">
        <GraficoComposicao dados={composicao} />
      </Painel>
    </>
  );
}
