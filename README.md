# Gerenciador de Tarefas Domésticas

Aplicação para controle de tarefas recorrentes (diárias, semanais, quinzenais e assumido mensal) acessada pela empregada.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- React Router v6
- Persistência: LocalStorage API
- Padrão de organização: MVC (Models, Controllers, Views)

## Desenvolvimento

Instalar dependências:

```bash
npm install
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Executar testes:

```bash
npm test
```

## Build

```bash
npm run build
```

## Deploy (Vercel)

Após o build, a pasta `dist` será publicada automaticamente. O arquivo `vercel.json` garante fallback de rotas SPA.

## Estrutura

```text
src/
  models/
  controllers/
  services/storage/
  views/components/
  views/pages/
  routes/
  utils/
  types/
  styles/
  tests/
```

## Assunção

O prompt repete "semanalmente" duas vezes; considerei que a quarta recorrência seria **mensalmente**. Ajuste facilmente em `src/types/index.ts` se necessário.

## Semântica dos Filtros

Os filtros ativos na aplicação seguem regras específicas:

- **HOJE**: Exibe somente
  - Tarefas semanais cujo `diaSemana` coincide com o dia atual (`mesmoDiaSemanaHoje`).
  - Tarefas diárias que ainda NÃO foram concluídas hoje (`naoConcluidaHoje`).
  - Além disso, um bloco secundário mostra as tarefas diárias já concluídas hoje (estilizadas com menor destaque).
- **QUINZENA**: Exibe apenas tarefas quinzenais cuja `proximaData` cai na quinzena corrente e que não foram concluídas hoje.
  - A quinzena corrente é determinada em `dentroDaQuinzenaAtual` (dias 1–15 ou 16–final do mês).
- **MES**: Exibe apenas tarefas mensais cuja `proximaData` está dentro do mês atual e não foram concluídas hoje.

Helpers principais em `src/utils/recurrence.ts`:

- `mesmoDiaSemanaHoje(diaSemana?: number): boolean` — compara `Date.getDay()` local.
- `naoConcluidaHoje(task): boolean` — retorna true se `ultimaConclusao` não é hoje.
- `dentroDaQuinzenaAtual(proximaData?: string)` — determina se data está na quinzena atual.
- `dentroDoMesAtual(proximaData?: string)` — determina se data está no mês atual.

## Unificação de Fuso Horário

Toda lógica semanal passou a usar tempo local (`getDay` / `setDate`). Antes havia mistura com métodos UTC; isso foi unificado para consistência. Em ambientes multi-fuso pode-se migrar para UTC novamente centralizando conversões.

## Testes Adicionais

Foram incluídos testes para:

- `nextWeeklyOccurrence` (lógica semanal local)
- `mesmoDiaSemanaHoje`
- `naoConcluidaHoje`

Veja `src/tests/recurrence.test.ts`.

## Política de Seeds

As tarefas iniciais (seed) são geradas em `src/data/seed.ts` seguindo regras para garantir visibilidade imediata nas abas:

- Diárias: próxima data = amanhã (cálculo padrão de recorrência diária) para permitir que apareçam como pendentes hoje se ainda não concluídas.
- Semanais: cada grupo recebe `diaSemana` correspondente (Seg=1 .. Sex=5) e `proximaData` calculada pela função de recorrência.
- Quinzenais: usamos dias âncora fixos dentro da quinzena atual: **10** (se hoje está na primeira quinzena) ou **20** (se está na segunda). Isso posiciona todas as tarefas quinzenais claramente dentro da janela visível.
- Mensais: usamos dia âncora **15** (se hoje está na primeira metade do mês) ou **28** (se está na segunda metade). Escolhemos 28 por sempre existir e estar próximo do fim do mês sem extrapolar.

Reset: O botão "Resetar Seeds" em `Configurações` chama `taskController.resetSeeds()` regenerando todo o conjunto com base na data corrente.

Objetivo: Evitar que tarefas quinzenais/mensais caiam inadvertidamente fora do filtro inicial por uma data gerada na próxima janela.

## Licença

Uso interno.
