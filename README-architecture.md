# Arquitetura Atomic Design

Este projeto foi iniciado com componentes em `src/views/components` e páginas em `src/views/pages`. Foi adicionada agora uma camada de Atomic Design para organizar crescimento futuro.

## Camadas

- **Átomos (`@atoms`)**: Elementos básicos, estateless ou com lógica mínima. Ex: `Skeleton`.
- **Moléculas (`@molecules`)**: Combinação simples de átomos. Ex: `TaskItem`, `Filters`.
- **Organismos (`@organisms`)**: Blocos maiores compostos de moléculas/átomos e lógica de domínio. Ex: `TaskList`, `TaskForm`, `Quote`.
- **Templates (`@templates`)**: Estruturas de página, definem layout mas não dados específicos (a criar conforme necessidade).

## Aliases

Configurados em `tsconfig.json` e `vite.config.ts`:

```text
@atoms, @molecules, @organisms, @templates, @utils, @hooks, @models, @services, @routes, @constants
```

Permitem importar assim:

```ts
import { Skeleton } from '@atoms';
import { TaskItem } from '@molecules';
import { TaskList } from '@organisms';
```

## Estratégia de Migração

1. Fase 1 (atual): Barrels exportando componentes originais sem mover arquivos (reduz risco).
2. Fase 2: Mover fisicamente arquivos para pastas específicas mantendo shallow barrels.
3. Fase 3: Introduzir templates e padrões para layouts (ex: `HomeTemplate`).
4. Fase 4: Ajustar testes para usar aliases e remover caminhos relativos longos.

## Próximos Passos Sugeridos

- Migrar `TaskItem.tsx` e `Filters.tsx` fisicamente para `components/molecules/`.
- Criar `HomeTemplate` que compõe Navbar + TaskList + Footer.
- Adicionar testes de render por camada para garantir isolamento.
- Documentar convenção de nomenclatura (prefixo opcional, evitar sufixo redundante "Component").

## Navegação de Histórico

Agora as páginas de histórico foram consolidadas sob `/historico/*`:

- `/historico/concluidas`
- `/historico/desativadas`

O acesso foi intencionalmente centralizado em um `<select>` dentro da `Navbar` (rótulo "Histórico") para reduzir poluição de links principais e reforçar que são visões secundárias/consultivas. A rota antiga `/desativadas` continua funcionando via redirect para manter compatibilidade com referências existentes.

Motivações:

1. Diminuir largura da barra principal em mobile.
2. Agrupar mentalmente estados passados (concluídas / desativadas) fora do fluxo de tarefas ativas.
3. Facilitar futura adição de novas visões históricas sem proliferar tabs.

Testes adicionados em `src/tests/historyNavigation.test.tsx` validam o redirect e render das páginas.

## Regras Rápidas

- Evitar que átomos importem moléculas/organismos.
- Organismos podem importar moléculas e átomos; preferir não importar templates.
- Templates só importam organismos/moléculas/átomos.
- Páginas (`views/pages`) podem ser temporárias até templates assumirem.

## Manutenção

Verificar regularmente duplicações. Quando lógica crescer, considerar extrair hooks para `@hooks`.

---
Última atualização: (gerado automaticamente)
