import { NextResponse } from "next/server";
import { NOME_COOKIE, criarToken, senhaConfere, DURACAO_SEGUNDOS } from "@/lib/sessao";

export const runtime = "edge";

/** Atraso fixo em toda tentativa. Não impede um ataque determinado, mas torna
 *  força bruta cara o bastante para uma senha razoável. */
const ATRASO_MS = 600;
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const segredo = process.env.SEGREDO_SESSAO;
  const senhaCorreta = process.env.SENHA_ACESSO;

  if (!segredo || !senhaCorreta) {
    return NextResponse.json(
      { erro: "O acesso ainda não foi configurado no servidor." },
      { status: 500 }
    );
  }

  let senha = "";
  try {
    const corpo = await req.json();
    senha = typeof corpo?.senha === "string" ? corpo.senha : "";
  } catch {
    senha = "";
  }

  await esperar(ATRASO_MS);

  if (!(await senhaConfere(senha, senhaCorreta, segredo))) {
    return NextResponse.json({ erro: "Senha incorreta." }, { status: 401 });
  }

  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(NOME_COOKIE, await criarToken(segredo), {
    httpOnly: true,                // JavaScript da página não consegue ler
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
  return resposta;
}
