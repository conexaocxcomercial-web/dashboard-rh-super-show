/** Sessão por cookie assinado (HMAC-SHA256).
 *
 *  Usa Web Crypto em vez de bibliotecas Node, porque o middleware do Next roda
 *  no runtime Edge. O cookie guarda só a data de expiração e a assinatura —
 *  não guarda a senha, e não pode ser forjado sem o segredo do servidor. */

const codificador = new TextEncoder();

const DURACAO_SESSAO_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias
export const NOME_COOKIE = "sessao_rh";

async function chave(segredo: string) {
  return crypto.subtle.importKey(
    "raw",
    codificador.encode(segredo),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function assinar(conteudo: string, segredo: string) {
  const bytes = await crypto.subtle.sign("HMAC", await chave(segredo), codificador.encode(conteudo));
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Comparação em tempo constante: evita que o tempo de resposta revele
 *  quantos caracteres da assinatura estavam certos. */
function iguaisEmTempoConstante(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

export async function criarToken(segredo: string) {
  const expira = String(Date.now() + DURACAO_SESSAO_MS);
  return `${expira}.${await assinar(expira, segredo)}`;
}

export async function tokenValido(token: string | undefined, segredo: string) {
  if (!token) return false;
  const [expira, assinatura] = token.split(".");
  if (!expira || !assinatura) return false;
  if (!(await assinar(expira, segredo).then((a) => iguaisEmTempoConstante(a, assinatura)))) return false;
  return Number(expira) > Date.now();
}

/** A senha também é comparada em tempo constante, pelo mesmo motivo. */
export async function senhaConfere(enviada: string, correta: string, segredo: string) {
  const [a, b] = await Promise.all([assinar(enviada, segredo), assinar(correta, segredo)]);
  return iguaisEmTempoConstante(a, b);
}

export const DURACAO_SEGUNDOS = DURACAO_SESSAO_MS / 1000;
