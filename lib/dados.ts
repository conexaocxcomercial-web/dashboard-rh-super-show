/** ÚNICO ponto de entrada dos dados.
 *
 *  Hoje: lê o JSON gerado a partir da planilha normalizada.
 *  Depois: troque o corpo de `carregarBase()` por uma chamada ao Google Sheets
 *  (via Service Account, na rota /api) sem tocar em nenhum outro arquivo.
 */
import bruto from "@/data/dados.json";
import type { BaseRH } from "./types";

export function carregarBase(): BaseRH {
  return bruto as unknown as BaseRH;
}
