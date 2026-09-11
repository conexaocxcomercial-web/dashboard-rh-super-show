import { NextResponse } from "next/server";
import { NOME_COOKIE } from "@/lib/sessao";

export const runtime = "edge";

export async function POST(req: Request) {
  const resposta = NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  resposta.cookies.set(NOME_COOKIE, "", { path: "/", maxAge: 0 });
  return resposta;
}
