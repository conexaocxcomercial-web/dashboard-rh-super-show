/** Formatos das tabelas — espelham as abas da planilha normalizada.
 *  Ao migrar para o Google Sheets, só `lib/dados.ts` muda; estes tipos continuam iguais. */

export type Funcionario = {
  ID_Funcionario: number;
  Nome: string;
  Unidade: string;
  Setor: string | null;
  Cargo_Original: string | null;
  Cargo_Padronizado: string | null;
  Data_Admissao: string | null;
  Salario: number | null;
  Fonte_Cadastro: string;
};

export type Ponto = {
  ID_Departamento: number;
  Departamento: string;
  Categoria: string;
  Grupo: "Referência (jornada)" | "Ausência (detalhe)";
  Horas: number;
};

export type Afastamento = {
  ID_Afastamento: number;
  Tipo: "Atestado Médico" | "Falta";
  Nome: string;
  Loja: string;
  Data_Inicial: string;
  Data_Final: string;
  Dias: number | null;
  Motivo: string;
  Mes: number;
  Ano: number;
  Observacao: string | null;
};

export type Turnover = {
  Mes: string;
  Mes_Num: number;
  Ano: number;
  Func_Inicio: number | null;
  Func_Fim: number | null;
  Media_Func: number | null;
  Admissoes: number | null;
  Total_Desligamentos: number | null;
  Demissao_Empresa: number | null;
  Pedidos_Demissao_Voluntario: number | null;
  Turnover_Geral_Pct: number | null;
  Turnover_Voluntario_Pct: number | null;
  Observacao: string | null;
};

export type Desligamento = {
  ID_Desligamento: number;
  Nome: string;
  Cargo_Setor: string | null;
  Data_Saida: string;
  Mes: number;
  Ano: number;
  Tipo_Demissao: string;
  Motivo_Principal: string;
  Observacoes_Entrevista: string | null;
  Observacao_Nome: string | null;
};

export type BaseRH = {
  funcionarios: Funcionario[];
  ponto: Ponto[];
  afastamentos: Afastamento[];
  turnover: Turnover[];
  desligamentos: Desligamento[];
};
