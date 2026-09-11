# RH estratégico — Cidade das Rosas

Painel de indicadores de pessoal, absenteísmo e turnover.
Apoio ao serviço **RH estratégico**, da conexão.cx.
Next.js 14 (App Router) · TypeScript · Tailwind · Recharts.

## Rodar localmente

```bash
npm install
npm run dev
```
Abre em http://localhost:3000

## Variáveis de ambiente (obrigatórias)

Copie `.env.example` para `.env.local` e preencha:

```
SENHA_ACESSO=...      # senha única compartilhada com a diretoria
SEGREDO_SESSAO=...    # gere com: openssl rand -base64 32
```

Sem essas duas variáveis o app responde 500 de propósito, em vez de subir desprotegido.

## Publicar na Vercel

1. Suba este repositório no GitHub. O `.gitignore` já exclui `.env.local` —
   a senha nunca vai para o repositório.
2. Em vercel.com: **New Project** → importe o repositório.
3. Em **Environment Variables**, cadastre `SENHA_ACESSO` e `SEGREDO_SESSAO`.
4. **Deploy**.

Para trocar a senha depois, altere a variável na Vercel e refaça o deploy.
Todas as sessões abertas continuam válidas até expirarem; para derrubá-las
na hora, troque também o `SEGREDO_SESSAO`.

## Estrutura

```
app/                  uma pasta por página do dashboard
components/ui.tsx     KPI, painel, alerta, cabeçalho
components/charts/    gráficos (Recharts, client components)
lib/dados.ts          ÚNICO ponto de entrada dos dados
lib/metrics.ts        todas as regras de cálculo, num lugar só
lib/types.ts          formato das tabelas
data/dados.json       dados atuais, extraídos da planilha normalizada
```

## Marca

Os logos ficam em `public/` e são aplicados como **máscara CSS** pelo componente
`components/Marca.tsx`. O PNG define apenas o recorte; a cor vem do tema via `bg-current`.
Por isso um único arquivo serve para o tema claro, o escuro e versões tingidas —
não é preciso manter as versões positiva e negativa separadas.

Para trocar um logo, substitua o PNG em `public/` mantendo fundo transparente,
e ajuste o `aspectRatio` correspondente em `components/Marca.tsx`.

| Arquivo | Onde aparece |
|---|---|
| `rh-estrategico.png` | topo da navegação e barra superior no celular |
| `conexao-cx.png` | assinatura no rodapé |
| `simbolo-cx.png` | barra do celular, marca-d'água dos destaques, favicon |

## Acesso

Senha única compartilhada, validada **no servidor**. O navegador nunca recebe a senha,
e o cookie de sessão é `httpOnly` — o JavaScript da página não consegue lê-lo.

- `middleware.ts` bloqueia toda página antes de renderizar: sem sessão válida,
  nenhum dado chega ao navegador.
- O cookie guarda apenas a data de expiração e uma assinatura HMAC-SHA256.
  Adulterar o valor invalida a assinatura e derruba a sessão.
- Senha e assinatura são comparadas em tempo constante, para que a duração da
  resposta não revele quantos caracteres estavam corretos.
- Cada tentativa tem atraso fixo de 600 ms, encarecendo força bruta.
- A sessão dura 7 dias. O botão **Sair** fica no rodapé da navegação.

Ao tentar abrir uma página protegida sem sessão, o destino é guardado na URL
e o usuário volta para ele após entrar.

## Filtros

O estado dos filtros fica na **URL** (`?unidade=Felipe+Camarão&de=5&ate=8&faixa=8%2B`),
não em memória. Assim o link já carrega a visão filtrada e pode ser enviado ao cliente,
o botão voltar do navegador funciona, e os dados permanecem no servidor.

| Página | Filtros disponíveis |
|---|---|
| Visão geral | período (mês a mês), unidade |
| Absenteísmo | departamento |
| Saúde ocupacional | período, unidade, tipo, faixa de duração |
| Turnover | período |
| Desligamentos | período, tipo de saída, motivo |

A página de Absenteísmo aceita **apenas** departamento: o relatório de ponto é um total
acumulado do período, sem data e sem unidade na origem. Filtrar por mês ali produziria
um número que a fonte não sustenta.

As faixas de duração (1 dia · 2–3 · 4–7 · 8 dias ou mais) separam afastamento pontual de
afastamento prolongado, que exigem respostas de RH diferentes.

## Temas

Claro e escuro, alternados pelo botão no rodapé da navegação.
A escolha fica salva no navegador; na primeira visita segue a preferência do sistema.
As cores ficam em variáveis CSS no topo de `app/globals.css`.

## Próximas etapas

**Tela de login** — a implementar. Validação no servidor (rota de API), com
sessão em cookie httpOnly. Senha em variável de ambiente, nunca no código do cliente.

**Integração com Google Sheets** — a implementar. Só `lib/dados.ts` muda:
a planilha fica privada e é lida por uma Service Account do lado do servidor.
Todo o restante do código continua igual, porque depende dos tipos em `lib/types.ts`,
não da origem dos dados.

## Decisões de cálculo que valem registro

- **Headcount = 63**: conta quem tem registro completo na folha. Cruzar por nome com a
  tabela de desligamentos superestimava, porque 13 dos 34 registros têm nome parcial.
- **Turnover médio = 7,1%**: média apenas dos meses fechados. A planilha original dividia
  por 12 e contava setembro a dezembro como zero, o que reduzia o número para 4,7%.
- **Absenteísmo separa planejado de não planejado**: férias sozinha responde por 53% das
  horas de ausência. Somada ao resto, escondia o indicador que mede gestão.
- **Média de dias por afastamento** ignora o registro com datas invertidas.

## Limitações dos dados de origem

- Felipe Camarão só tem dados de atestado e falta. Não há folha nem turnover para a unidade,
  por isso os KPIs de quadro e custo se referem apenas à Cidade das Rosas.
- A coluna `Setor` da planilha não separou loja de comercial — todos vieram como loja.
- 48 atestados e 68 faltas estão sem motivo preenchido na origem.
