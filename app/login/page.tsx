import { Suspense } from "react";
import FormularioLogin from "./FormularioLogin";
import { LogoRhEstrategico, LogoConexao, SimboloCx } from "@/components/Marca";

export const metadata = { title: "Acesso — RH estratégico" };

export default function Login() {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* Coluna da marca — vira faixa curta no celular */}
      <aside className="relative overflow-hidden bg-[var(--marca)] text-white
                        px-6 py-10 lg:px-14 lg:py-14 flex flex-col">
        {/* O sorriso posicionado para que só a curva apareça, como textura de fundo */}
        <SimboloCx
          titulo=""
          className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2
                     w-[560px] text-white opacity-[0.08] hidden lg:block"
        />
        <LogoRhEstrategico
          titulo="RH estratégico"
          className="relative shrink-0 w-[200px] lg:w-[240px] text-white"
        />
        <div className="relative flex-1 flex items-center mt-10 lg:mt-0">
          <div className="max-w-md">
            <p className="text-xl lg:text-3xl font-semibold leading-[1.15] tracking-tight">
              Os números de gente da sua operação, atualizados e prontos para decidir.
            </p>
            <p className="text-sm lg:text-base mt-4 text-white/75 leading-relaxed">
              Painel de acompanhamento do RH estratégico, a consultoria mensalista
              que atua como business partner do seu negócio.
            </p>
          </div>
        </div>
      </aside>

      {/* Coluna do formulário */}
      <main className="flex items-center justify-center px-6 py-12 lg:py-14 bg-[var(--bg)]">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Acessar o painel</h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 mb-7">
            Informe a senha compartilhada com a diretoria.
          </p>

          <Suspense fallback={null}>
            <FormularioLogin />
          </Suspense>

          <div className="mt-12 pt-5 border-t border-[var(--line)] flex items-center gap-2">
            <span className="text-[0.65rem] text-[var(--muted)]">feito com</span>
            <LogoConexao titulo="conexão.cx" className="w-[86px] text-[var(--ink)] opacity-70" />
          </div>
        </div>
      </main>
    </div>
  );
}
