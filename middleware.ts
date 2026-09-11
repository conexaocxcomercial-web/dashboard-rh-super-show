import { NextResponse, type NextRequest } from "next/server";
import { NOME_COOKIE, tokenValido } from "@/lib/sessao";

/** Protege todas as páginas do painel. Roda antes de qualquer renderização,
 *  então nenhum dado chega ao navegador sem sessão válida. */
export async function middleware(req: NextRequest) {
  const segredo = process.env.SEGREDO_SESSAO;

  // Sem segredo configurado o app não sobe de forma segura: melhor falhar visivelmente.
  if (!segredo) {
    return new NextResponse(
      "Configuração ausente: defina SEGREDO_SESSAO e SENHA_ACESSO nas variáveis de ambiente.",
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }
    );
  }

  const autenticado = await tokenValido(req.cookies.get(NOME_COOKIE)?.value, segredo);
  const indoParaLogin = req.nextUrl.pathname === "/login";

  if (!autenticado && !indoParaLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // guarda o destino para voltar depois do login
    url.searchParams.set("destino", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (autenticado && indoParaLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/visao-geral";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
