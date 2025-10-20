# CasaCíclica

Organização que se renova.

Aplicação para controle de tarefas recorrentes (diárias, semanais, quinzenais e mensais) acessada pela empregada.

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

## Aba Concluídas

Nova aba acessível em `/concluidas` (link "Concluídas" no topo) exibe todas as tarefas que possuem `ultimaConclusao` definida, agrupadas por categoria:

- Diárias
- Semanais (subgrupos por dia da semana: Segunda, Terça, ...)
- Quinzenais
- Mensais

Colunas mostradas: título, recorrência, dia da semana (quando aplicável), próxima data, última conclusão, status relativo ao dia atual ("Concluída hoje" ou "Concluída anteriormente") e ações rápidas (Re‑concluir, Ativar/Desativar).

O botão "Re-concluir" força atualização de `ultimaConclusao` para hoje e recalcula `proximaData`, útil para corrigir marcações atrasadas. A aba não altera a lógica dos filtros principais; serve como histórico condensado de execução.

## Aba Desativadas

A aba `/desativadas` lista todas as tarefas com `ativa = false`, agrupadas de forma idêntica à aba Concluídas (Diárias, Semanais por dia da semana, Quinzenais, Mensais). Objetivo: servir de "estacionamento" para tarefas pausadas sem perder histórico.

Colunas: título, recorrência, dia da semana (quando aplicável), próxima data, última conclusão e ações.

Ações disponíveis:

- Reativar: alterna `ativa` para `true` imediatamente.
- Remover: exclui definitivamente a tarefa.

Notas:

- Tarefas desativadas não podem ser concluídas enquanto inativas (botão de concluir não aparece aqui).
- Permanecem com seus dados (`ultimaConclusao`, `proximaData`) congelados até reativação, quando então voltam a aparecer nos filtros normais conforme regras de visibilidade.

## Unificação de Fuso Horário

Toda lógica semanal passou a usar tempo local (`getDay` / `setDate`). Antes havia mistura com métodos UTC; isso foi unificado para consistência. Em ambientes multi-fuso pode-se migrar para UTC novamente centralizando conversões.

## Testes Adicionais

Foram incluídos testes para:

- `nextWeeklyOccurrence` (lógica semanal local)
- `mesmoDiaSemanaHoje`
- `naoConcluidaHoje`

Veja `src/tests/recurrence.test.ts`.

## Política de Seed de Dados

A geração inicial de tarefas ocorre apenas quando o `LocalStorage` ainda não possui a chave `tarefas` (primeiro acesso ou limpeza manual). Nesse momento `TaskController` verifica se a lista está vazia e invoca `gerarSeed()` de `src/data/seed.ts`.

### Objetivos

1. Garantir que ao abrir a aplicação exista conteúdo representativo em todas as abas (HOJE, QUINZENA, MÊS).
2. Evitar que tarefas quinzenais ou mensais sejam geradas para uma janela futura invisível no primeiro acesso.
3. Oferecer mecanismo simples de redefinição (reset) sem duplicar tarefas.

### Regras de Geração

- Diárias: `proximaData` é calculada com `calcularProximaData(DIARIA, hoje)` resultando em amanhã. A exibição no filtro HOJE não depende de `proximaData` e sim de não terem sido concluídas hoje (`naoConcluidaHoje`). Isso mantém o ciclo de renovação após conclusão.
- Semanais: cada bloco (Seg..Sex) recebe `diaSemana` explícito (1–5). A próxima ocorrência usa `calcularProximaData(SEMANAL, hoje, diaSemana)` que sempre agenda a próxima semana caso já tenha passado o dia atual.
- Quinzenais: definimos uma data âncora dentro da quinzena corrente. Se hoje está na primeira quinzena (dia 1–15) usamos `anchors.quinzena1` (default 10); senão `anchors.quinzena2` (default 20). Todas as tarefas recebem a mesma `proximaData` ISO desse dia para facilitar visualização.
- Mensais: similar à lógica quinzenal, usando âncoras mensais: `mensal1` (default 15) se estamos na primeira metade do mês, ou `mensal2` (default 28) na segunda metade. O dia 28 foi escolhido por existir em todos os meses e ficar próximo ao final sem depender de overflow.

### Anchors (Âncoras Personalizáveis)

O arquivo `seed.ts` define `DEFAULT_ANCHORS`:

```text
quinzena1: 10
quinzena2: 20
mensal1: 15
mensal2: 28
```

Você pode sobrescrever via `localStorage` na chave `seedAnchors` com um JSON parcial ou completo. Exemplo em DevTools:

```js
localStorage.setItem("seedAnchors", JSON.stringify({ quinzena1: 8, mensal2: 27 }))
```

Validações de faixa (clamp) garantem:

- `quinzena1`: 1–15
- `quinzena2`: 16–31
- `mensal1`: 1–15
- `mensal2`: 16–31

Se algum valor estiver fora da faixa ele é ajustado automaticamente. Erros de parsing retornam aos defaults.

### Reset de Seeds

O botão "Resetar Seeds" em `Configurações` chama `taskController.resetSeeds()` que:

1. Substitui inteiramente a lista atual por uma nova chamada a `gerarSeed()`.
2. Preserva quaisquer âncoras customizadas (não altera `seedAnchors`).
3. Dispara evento `tasks:reset` para atualização da UI.

ATENÇÃO: O reset remove tarefas criadas manualmente. Para migrar tarefas customizadas antes de um reset, considere exportar a lista (ex: copiar JSON do `localStorage.getItem('tarefas')`).

### Idempotência e Duplicação

- A geração automática só acontece se `LocalStorageService.listar()` retorna lista vazia (evita duplicar ao recarregar).
- Cada seed usa `crypto.randomUUID()` garantindo IDs únicos. Um novo reset sempre cria IDs diferentes.
- `hidratar()` no controller recalcula `proximaData` apenas se estiver ausente (robustez para evoluções futuras ou migrações).

### Como Alterar Seeds

1. Edite os arrays de string em `seedDiarias`, `seedSemanais`, `seedQuinzenais`, `seedMensais`.
2. Ajuste âncoras em `DEFAULT_ANCHORS` se quiser novos defaults.
3. (Opcional) Em produção, defina âncoras via `localStorage` antes de usar "Resetar Seeds" para aplicar novos dias.

### Diferença entre Anchors e Recorrência Mensal Padrão

`calcularProximaData` para recorrência mensal tenta manter o mesmo dia no mês seguinte; se o dia não existir (ex: 31 no próximo mês), usa o último dia do mês seguinte. Já a lógica de seed força todos os mensais para um dia âncora consistente evitando datas no início ou fim que possam não aparecer nos filtros iniciais.

### Boas Práticas

- Use âncoras centrais (10, 15, 20, 28) para espaçar tarefas e facilitar checagem visual.
- Evite âncoras muito próximas (ex: 14 e 15) que concentrariam carga em dias consecutivos.
- Documente qualquer alteração interna na seção acima para manter alinhamento entre código e README.

### Futuras Extensões (Ideias)

- Persistir âncoras via uma tela de configurações em vez de usar DevTools.
- Exportar/importar conjunto de tarefas personalizado para ambientes diferentes.
- Flag para escolher se tarefas diárias devem iniciar "devidas hoje" (ajustando seed para `proximaData = hoje`).

Em caso de divergência entre este README e `seed.ts`, considere `seed.ts` a fonte de verdade e atualize a documentação.

## Comportamento Após Concluir Tarefa

Quando uma tarefa é marcada como concluída (ação "Concluir") a aplicação atualiza `ultimaConclusao` e calcula uma nova `proximaData` usando `calcularProximaData` conforme a recorrência:

- Diária: a próxima ocorrência será sempre o dia seguinte. Resultado: no próximo dia a tarefa volta a aparecer como pendente na aba HOJE.
- Semanal: a próxima ocorrência cai na mesma semana seguinte (mesmo dia da semana). A tarefa só aparecerá novamente na aba HOJE quando chegar aquele dia da semana.
- Quinzenal: a próxima data é 14 dias à frente mantendo o mesmo dia numérico do mês de referência; ela será listada novamente na aba QUINZENA quando `proximaData` cair dentro da quinzena atual e ainda não estiver concluída hoje.
- Mensal: tenta manter o mesmo dia numérico no mês seguinte; se o dia não existir (ex: 31 em mês com 30 dias) usa o último dia do mês. A tarefa reaparece na aba MES quando `proximaData` está dentro do mês corrente e não foi concluída hoje.

Critérios de visibilidade (resumo):

- HOJE: Diárias não concluídas hoje + Semanais cujo `diaSemana` é hoje.
- QUINZENA: Quinzenais com `proximaData` dentro da quinzena atual e não concluídas hoje.
- MES: Mensais com `proximaData` dentro do mês atual e não concluídas hoje.

Assim, somente tarefas diárias "renovam" automaticamente no dia seguinte; as demais aguardam alcançar sua janela temporal antes de voltarem como pendentes.

## Tema & Paleta CasaCíclica

A aplicação utiliza um sistema de tema claro/escuro controlado via classe `dark` aplicada ao elemento `html` e persistida em `localStorage` na chave `prefTheme`. A paleta foi convertida em variáveis CSS definidas em `src/styles/index.css` permitindo evolução futura sem buscar e substituir cores espalhadas.

### Variáveis Principais

`--cc-bg` (fundo principal), `--cc-bg-alt` (fundo de cartões / seções), `--cc-accent` (cor de destaque primária), `--cc-accent-alt` (destaque alternativo), `--cc-border` (bordas suaves), `--cc-text` (texto principal), `--cc-muted` (texto secundário), além das específicas de botão e gradiente:

- `--cc-btn-bg`, `--cc-btn-hover`
- `--cc-gradient-from`, `--cc-gradient-via`, `--cc-gradient-to`
- `--cc-focus` (realce de foco/acessibilidade)

### Paleta Light (Hex)

- Fundo: `#fdfaf6`
- Fundo alternativo: `#f7f1e7`
- Acento: `#e8c766`
- Acento alternativo / Ocre: `#d9a441`
- Borda neutra: `#d8d5cf`
- Texto principal: `#3d352e`
- Texto secundário: `#6d655c`
- Botão hover: `#c78924`

### Paleta Dark (Hex)

- Fundo: `#16151a`
- Fundo alternativo: `#201f24`
- Violeta acento: `#5b5bd6`
- Azul oceano: `#0f4c70`
- Borda: `#3a3842`
- Texto principal: `#e8e6e3`
- Texto secundário: `#a39fa8`
- Botão hover: `#4949bb`
- Foco (marrom aquecido): `#a37b35`

### Gradientes

Navbar e menu mobile usam gradiente linear a partir das variáveis `--cc-gradient-*`. No tema claro: transição de ocre para amarelo suave e bege; no tema escuro: violeta → azul oceano → marrom escuro (borda). A troca é automática com a classe `dark`.

### Toggle de Tema

O componente `Navbar` inclui um botão acessível com `aria-pressed` e ícones ☀️ / 🌙. Estado persistente em `localStorage`. Para animações futuras basta aplicar `transition` sobre `background-color` e `color` no seletor global.

### Extensão Futura

Possíveis evoluções:

- Escala de tons adicionais (`--cc-accent-50..900`) se Tailwind for customizado.
- Modo alto contraste (acentos mais saturados e foco com outline espesso).
- Seleção de paleta alternativa via tela de Configurações (persistência em chave `prefPalette`).

### Como Alterar Cores

Edite as variáveis em `:root` e `html.dark` dentro de `src/styles/index.css`. Evite modificar diretamente componentes para manter coerência. Após mudança, a recompilação do Vite reflete instantaneamente.

### Testes Visuais

Atualmente não há snapshot dos estilos; recomendação: adicionar teste de presença de classe `dark` após toggle e verificar que as variáveis mudam (ex: computar estilo de `body`). Isso pode ser feito com `jsdom` lendo `getComputedStyle(document.body)`. Fora do escopo inicial, deixado como melhoria incremental.

---

### Níveis de Surface

Para padronizar fundos em diferentes profundidades foram introduzidas variáveis:

| Nível | Variável            | Uso sugerido                     |
|-------|---------------------|----------------------------------|
| 0     | `--cc-surface-0`    | Fundo de página / layout geral  |
| 1     | `--cc-surface-1`    | Containers padrão / seções       |
| 2     | `--cc-surface-2`    | Destaques (cards acentuados)     |

Classes utilitárias:

- `.surface` = nível 1
- `.surface-alt` = nível 0
- `.surface-accent` = nível 2
- `.gradient-bar` = gradiente temático (Navbar / barras decorativas)

Essas classes evitam repetir tokens Tailwind e facilitam ajustes temáticos futuros.

## Acessibilidade & SEO

### Contraste

Botões principais usam texto branco sobre cores escuras (modo claro) ou cores de alto contraste sobre fundo escuro garantindo relação próxima ou superior a 4.5:1 para texto pequeno. Tokens semânticos adicionados:

- `--cc-primary`, `--cc-primary-hover`
- `--cc-danger`, `--cc-danger-hover`
- `--cc-success`, `--cc-success-hover`
- `--cc-warning`, `--cc-warning-hover`
- `--cc-link`, `--cc-link-hover`

Variantes de botão: `.btn-primary`, `.btn-danger`, `.btn-success`, `.btn-warning`, `.btn-link`.

### Foco e Navegação

Uso de `focus:ring` em botões e inputs. Recomenda-se evolução com `:focus-visible` e outline custom com `--cc-focus`. Adicionar skip-link no topo é sugerido para navegação por teclado.

### Preferências de Tema

`color-scheme: light dark` no HTML e duas metas `theme-color` adaptam a UI a barras do navegador em ambientes mobile. Persistência de tema via `prefTheme`.

### Meta Tags

Incluídas: `description`, `keywords`, `author`, `canonical`, Open Graph (`og:title`, `og:description`, `og:type`, `og:locale`). Futuro: `og:image`, `twitter:card`.

### Links

`.btn-link` preserva sublinhado (sem remover affordance). Hover escurece cor para reforçar clicabilidade.

### Checklist Futuro

- Teste automatizado de contraste WCAG (fórmula luminância relativa)
- Skip link e regiões ARIA (`role="main"`)
- Legendas (`<caption>`) para tabelas Concluídas/Desativadas
- Preferência de redução de movimento (`prefers-reduced-motion`)

### Classes Semânticas Recentes

Novas utilitárias adicionadas para reforçar o Design System:

- `.text-muted` aplica `var(--cc-muted)` para texto secundário.
- `.text-subtle` aplica `var(--cc-text-subtle)` para texto pouco enfatizado (metadados, contagens).
- `.table-head` estiliza cabeçalho de tabela com variáveis dedicadas (`--cc-table-head-bg`, `--cc-table-head-text`).
- `.table-row` aplica borda superior uniforme com `--cc-surface-border`.
- `.row-hover` utiliza `--cc-surface-hover` para feedback de linha.

Objetivo: remover dependência de classes Tailwind acidentais (`text-gray-500`, `hover:bg-gray-50`) e centralizar a paleta em tokens.

## Licença

Uso interno.
