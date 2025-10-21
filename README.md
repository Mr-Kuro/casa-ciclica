# CasaCíclica

[![Uso acadêmico permitido](https://img.shields.io/badge/Uso%20acad%C3%AAmico-permitido-blueviolet)](./LICENSE)

> Nota: Este projeto foi desenvolvido em modo **"vibe coding"** – evolução incremental, foco em fluidez criativa e ajustes rápidos conforme as ideias surgiam, priorizando clareza funcional antes de otimizações estruturais profundas. Refatorações pontuais podem ter sido adiadas em favor de manter o ritmo de descoberta de features.

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

## Licença & Uso Acadêmico

Este projeto é distribuído sob uma licença proprietária. Uso comercial, distribuição pública e demonstrações hospedadas não são permitidos sem autorização escrita.

Entretanto existe uma concessão limitada para uso **acadêmico não comercial**:

- Tarefas de cursos, TCCs, trabalhos universitários.
- Pesquisa acadêmica (prototipagem / papers) sem publicar o código modificado publicamente.
- Forks privados para estudo mantendo avisos de copyright.

Condições: manter atribuição ao autor ("Baseado em CasaCíclica de Anderson Queiroz - Mr. Kuro"), preservar avisos e não hospedar versão de produção acessível ao público. Leia o arquivo `LICENSE` para detalhes completos (incluindo restrições adicionais e cláusulas em inglês).

Para casos limítrofes (ex: demo remota pública para banca), solicite autorização prévia via contato no `LICENSE`.

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
- **SEMANA** (nova aba): Lista todas as tarefas diárias e semanais não concluídas hoje, agrupadas em "Diárias" e pelos dias da semana (Domingo ... Sábado). Permite alternar ordenação interna por título.

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

A aplicação utiliza um sistema de tema claro/escuro controlado via classe `dark` aplicada ao elemento `html` e persistida em `localStorage` na chave `prefTheme`. As cores são centralizadas em variáveis CSS em `src/styles/index.css`.

### Tokens de Cor

Principais superfícies e semântica:

| Variável | Uso |
|----------|-----|
| `--cc-bg` | Fundo da página |
| `--cc-bg-alt` | Cartões básicos / seções elevadas |
| `--cc-surface-2` | Destaques / agrupamentos |
| `--cc-border` | Bordas neutras |
| `--cc-text` | Texto principal |
| `--cc-muted` | Texto secundário |
| `--cc-text-subtle` | Texto menor / rotulagem discreta |
| `--cc-primary` | Ação primária / ênfases |
| `--cc-success`, `--cc-danger`, `--cc-warning` | Estados semânticos |
| `--cc-link` | Links inline |
| `--cc-focus` | Contorno de acessibilidade |
| `--cc-gradient-*` | Barras e backgrounds decorativos |
| `--cc-motive-*` | Área da citação motivacional |

### Paleta Light (Atualizada)

Bege puxado ao marrom + ocre clarinho para calor e legibilidade.

| Papel | Hex |
|-------|-----|
| Fundo (`--cc-bg`) | `#f9f4ec` |
| Fundo alt (`--cc-bg-alt`) | `#f3e9db` |
| Superfície 2 (`--cc-surface-2`) | `#ead7c2` |
| Acento (`--cc-accent`) | `#e2c290` |
| Acento alt (`--cc-accent-alt`) | `#d6a869` |
| Borda (`--cc-border`) | `#dbcdbd` |
| Texto principal (`--cc-text`) | `#4a3b30` |
| Texto secundário (`--cc-muted`) | `#7c6a5b` |
| Texto sutil (`--cc-text-subtle`) | `#8d7c6d` |
| Primário (`--cc-primary`) | `#915f24` |
| Primário hover (`--cc-primary-hover`) | `#774e1d` |
| Botão base (`--cc-btn-bg`) | `#d6a869` |
| Botão hover (`--cc-btn-hover`) | `#c08d49` |
| Link (`--cc-link`) | `#1f4d7a` |
| Link hover (`--cc-link-hover`) | `#163a5c` |
| Foco (`--cc-focus`) | `#a86e30` |
| Warning (`--cc-warning`) | `#b07500` |
| Warning hover | `#8f5f00` |
| Success (`--cc-success`) | `#2f7d42` |
| Danger (`--cc-danger`) | `#b23734` |

### Paleta Dark (Atualizada)

Azul oceano fechado + Van Dyck Brown para profundidade aconchegante.

| Papel | Hex |
|-------|-----|
| Fundo (`--cc-bg`) | `#0a1419` |
| Fundo alt (`--cc-bg-alt`) | `#112027` |
| Superfície 2 (`--cc-surface-2`) | `#1b333d` |
| Acento (`--cc-accent`) | `#1c3f4b` |
| Acento alt (`--cc-accent-alt`) | `#285868` |
| Borda (`--cc-border`) | `#2c4a54` |
| Texto principal (`--cc-text`) | `#f2efe9` |
| Texto secundário (`--cc-muted`) | `#b4b0aa` |
| Texto sutil (`--cc-text-subtle`) | `#d3d0cb` |
| Primário (`--cc-primary`) | `#a57442` |
| Primário hover (`--cc-primary-hover`) | `#8c6136` |
| Botão base (`--cc-btn-bg`) | `#285868` |
| Botão hover (`--cc-btn-hover`) | `#327089` |
| Link (`--cc-link`) | `#66b7d1` |
| Link hover (`--cc-link-hover`) | `#56a1ba` |
| Foco (`--cc-focus`) | `#66b7d1` |
| Warning (`--cc-warning`) | `#d6a869` |
| Warning hover | `#c08d49` |
| Success (`--cc-success`) | `#2fae7a` |
| Danger (`--cc-danger`) | `#e3645f` |

### Hover & Foco

Botões aplicam leve `filter: brightness(0.95~0.96)` no hover para preservar saturação. Foco usa `outline: 2px solid var(--cc-focus)` garantindo contraste AA.

### Customização Rápida

- Ajuste somente variáveis em `:root` e `html.dark` para trocar tema sem tocar em componentes.
- Para um tema adicional (ex: alto contraste), crie uma classe `html.high-contrast` duplicando o bloco escuro e elevando brilho/contraste.
- Evite substituir cores diretamente em componentes; mantenha a indireção pelas variáveis para consistência.

### Extensões Futuras

- Gerador de tema via UI salvando JSON em `localStorage`.
- Modo monocromático para contexto de impressão.
- Tokens para estados de arrasto (`--cc-drag-bg`) e seleção (`--cc-selection-bg`).

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

## Métricas e Análises de Tarefas

Para enriquecer a visão de detalhe de cada tarefa foram adicionadas métricas calculadas dinamicamente em `src/utils/analytics.ts`. O objetivo é oferecer contexto temporal (quando foi criada, quando foi concluída, quando volta) e um rótulo descritivo da recorrência.

### Campo `criadaEm`

Cada tarefa possui agora o timestamp ISO (`criadaEm`) de sua criação. Seeds antigos passam por hidratação no `TaskController` garantindo preenchimento retroativo (fallback para o momento de hidratação). Esse campo nunca é atualizado após criação.

### Funções Disponíveis

- `diasDesdeCriacao(task)`: Número de dias completos desde `criadaEm` até agora.
- `diasDesdeUltimaConclusao(task)`: Dias desde `ultimaConclusao` (se ausente, retorna `undefined`).
- `diasAteProxima(task)`: Dias restantes até `proximaData` (valor negativo indica data já passada/atrasada).
- `descricaoRecorrencia(task)`: String amigável (ex: "Diária", "Semanal (Segunda)").
- `statusRecorrencia(task)`: Estado sintético (ex: `DEVIDA_HOJE`, `ATRASADA`, `AGENDADA`, `SEM_PROXIMA`). Usado para colorir badges.

### Exibição na Tela `TaskDetail`

A página de detalhes (`src/views/pages/TaskDetail.tsx`) mostra cartões com:

1. Recorrência (tag + descrição)  
2. Criada há X dias  
3. Última conclusão (X dias) ou mensagem de nunca concluída  
4. Próxima ocorrência em X dias (ou atrasada há Y dias)  
5. Status textual e cor semântica (verde para hoje, amarelo para futuro, vermelho para atraso).

### Casos Limite

- Tarefas sem `ultimaConclusao`: métricas de conclusão omitidas / mensagem de ausência.
- `proximaData` passada: `diasAteProxima` negativo → status `ATRASADA`.
- Falta de `proximaData` (deveria ser raro) gera status `SEM_PROXIMA`.

### Ordenação Avançada Persistente

O componente de listagem (`TaskList`) suporta ordenação por múltiplas colunas (Título, Recorrência, Dia da Semana, Próxima Data, Última Conclusão). A escolha (chave + direção) é persistida em `localStorage` na chave `sortPrefs` por meio de helpers em `src/utils/sortStorage.ts`:

- `loadSortPrefs()`: Lê e valida `{ key, dir }` retornando defaults se inválido.
- `saveSortPrefs(prefs)`: Serializa preferência atual.

Isso garante consistência da visualização ao recarregar a aplicação.

### Testes Relacionados

Novos testes foram adicionados em:

- `analytics.test.ts`: Cobertura das funções de métricas e status.
- `createWeeklyTask.test.ts`: Verifica criação semanal e cálculo da próxima ocorrência (ambiente `jsdom`).
- `sortTasks.test.ts`: Garante ordenação determinística por diferentes chaves e direções.

### Próximas Melhorias

- Teste específico para persistência de preferências (mock de `localStorage` e verificação da restauracão automática).
- Internacionalização das descrições (Português → outros idiomas) mantendo chaves semânticas.
- Indicador de "ciclo" (quantas vezes já foi concluída) incrementando contador persistido.

## Manutenção da Documentação

Após qualquer mudança em recorrência, cálculos de datas ou novos estados em `statusRecorrencia`, lembre de atualizar esta seção para evitar descompasso entre comportamento e descrição.

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
