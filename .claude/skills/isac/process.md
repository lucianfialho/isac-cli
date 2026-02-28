# Processo ISAC — Replicacao de Pagina

Documentacao detalhada do pipeline de replicacao visual usado neste projeto.

## Visao Geral

O processo replica paginas web a partir de uma URL, usando um pipeline de 6 fases
com subagentes especializados. A chave e **nunca hardcodar valores visuais** — tudo
passa por um design system intermediario com CSS custom properties.

## Por que este processo funciona

1. **Captura automatica**: nao precisa tirar screenshots manualmente — a Fase 0 faz isso
2. **Design System como contrato**: tokens CSS sao a interface entre design e codigo
3. **Dark mode gratis**: tokens semanticos com variantes light/dark
4. **Consistencia**: componentes consomem tokens, nao valores magicos
5. **Manutenibilidade**: mudar uma cor no token atualiza toda a pagina
6. **Separacao de responsabilidades**: extracao de tokens e documentacao visual sao fases independentes

## Fluxo

```
URL ──── Fase 0 ──► Screenshots (.claude/screenshots/)
                         │
Screenshots ─── Fase 1a ──► Tokens CSS (globals.css)
    │                           │
    │                           ▼
    └───── Fase 1b ──► Documentacao DS (design-system/page.tsx)
    │                           │
    │                           ▼
    └───────── Fase 2 ──► Plano (estrutura + dados)
                                │
                                ▼
                   Fase 3 ──► Implementacao (page.tsx)
                                │
                                ▼
                   Fase 4 ──► Verificacao Visual
                                │
                            ┌───┴───┐
                            │       │
                         APROVADO  CORRIGIR ──► volta Fase 3
```

## Fase 0: Captura de Screenshots

### Processo

1. Navegue ate a URL fornecida via chrome-devtools MCP
2. Aguarde carregamento completo (networkIdle)
3. Redimensione viewport para 1440px (desktop padrao)
4. Capture screenshot full-page em light mode
5. Tente emular dark mode (`prefers-color-scheme: dark`) e capture
6. Para paginas longas, capture secoes individuais

### Saida

```
.claude/screenshots/
  full-page.png          # Light mode
  full-page-dark.png     # Dark mode (se disponivel)
  section-*.png          # Secoes individuais (opcional)
```

## Fase 1a: Extracao de Tokens

### O que extrair dos screenshots

1. **Paleta de cores primitivas**
   - Backgrounds (primario, secundario, terciario)
   - Textos (primario, secundario, terciario)
   - Bordas (primaria, secundaria, sutil)
   - Acentos (destaque, links, icones)

2. **Tipografia**
   - Font families (serif para titulos, sans para body, mono para codigo)
   - Font sizes (display, headings, body, small, xs)
   - Font weights (regular, medium, semibold, bold)

3. **Espacamento e radii**
   - Border radius (small, medium, pill)
   - Padding patterns

4. **Componentes**
   - Botoes (estilo, padding, borda)
   - Badges (pills, tags)
   - Cards/surfaces
   - Tabelas
   - Headers

### Estrutura dos tokens

```css
:root {
  /* Primitivos — nunca usados diretamente em componentes */
  --sf-white: #ffffff;
  --sf-gray-100: #f5f5f5;
  /* ... */

  /* Semanticos — usados nos componentes */
  --color-bg-primary: var(--sf-white);
  --color-text-primary: var(--sf-gray-900);
  /* ... */
}

[data-theme="dark"] {
  --color-bg-primary: var(--sf-gray-950);
  --color-text-primary: var(--sf-gray-100);
  /* ... */
}
```

### Resultado esperado
- `app/globals.css` com tokens primitivos + semanticos + dark mode

## Fase 1b: Documentacao do Design System

### O que a pagina deve conter

A pagina `app/design-system/page.tsx` e uma documentacao visual interativa de todos os tokens e componentes extraidos. Ela serve como referencia para a Fase 3 (implementacao) e como validacao visual dos tokens.

### Estrutura esperada (secoes obrigatorias)

1. **Header** — titulo "Design System" + ThemeToggle para alternar temas
2. **Primitive Palette** — grid de swatches coloridos com nome e variavel CSS de cada primitivo
3. **Semantic Tokens** — tabela com 5 colunas (Token / Light swatch / Light ref / Dark swatch / Dark ref), agrupada por categoria (Background, Text, Border, Surface, Accent)
4. **Typography** — font families com preview, font sizes com preview "Aa", font weights com preview "The quick brown fox", type scale in context
5. **Border Radius** — quadrados com diferentes radii e valores exibidos
6. **Components** — preview visual de cada componente do site:
   - Sticky Header (glass-morphism com blur)
   - Buttons (primary + small)
   - Links (inline + project com seta)
   - Language Badge (pills com borda)
   - Fork Badge (com icone SVG)
   - Star Count (com estrela em accent color)
7. **Leaderboard Table** — tabela com dados reais extraidos dos screenshots
8. **CTA Banner** — card com texto persuasivo + botao de acao
9. **Hero / Definition Block** — titulo serif 72px, fonetica, definicoes numeradas (se aplicavel)

### Relacao com o template

O agente `ds-page-builder` usa o template em `.claude/skills/isac/templates/design-system-page.tsx` como scaffolding. O template contem a estrutura JSX completa com comentarios `/* PREENCHER */` indicando onde inserir dados reais. O agente deve:

1. Ler o template para entender a estrutura
2. Ler `app/globals.css` para obter os tokens
3. Ler screenshots para extrair dados de exemplo
4. Gerar a pagina final substituindo todos os placeholders

### Arquivos gerados

| Arquivo | Descricao |
|---|---|
| `app/design-system/page.tsx` | Documentacao visual completa |
| `app/design-system/layout.tsx` | Layout wrapper (bg + color + min-height) |
| `app/design-system/components/theme-toggle.tsx` | Toggle system/light/dark com localStorage |
| `app/components/theme-toggle.tsx` | Copia para uso na pagina principal |

### Criterios de aprovacao

- `npm run build` passa sem erros
- Pagina contem TODAS as 9 secoes listadas acima
- Arrays `primitives` e `semanticTokens` correspondem 1:1 com o globals.css
- Dados da tabela sao reais (extraidos dos screenshots), nao lorem ipsum
- ThemeToggle funciona (cicla system → light → dark)
- Cores usam exclusivamente `var()`, sem hex/rgb hardcoded nos componentes

## Fase 2: Planejamento

### O que analisar

1. **Secoes da pagina**: hero, header, content, tables, CTAs, footer
2. **Dados reais**: extrair textos, numeros, nomes dos screenshots
3. **Hierarquia**: qual componente contem qual
4. **Links**: URLs externas visiveis
5. **Comportamentos**: sticky headers, scroll effects

### Formato do plano

```markdown
## Estrutura
1. Sticky Header — glass-morphism, logo + botao + toggle
2. Hero — titulo serif 72px, definicoes, creditos
3. Leaderboard — tabela com N linhas
4. CTA Banner — chamada + botao

## Dados
| # | Nome | Descricao | ... |

## Tokens por secao
- Header: bg-glass, border-subtle, surface-elevated
- Hero: text-primary (titulo), text-secondary (subtitulo)
```

## Fase 3: Implementacao

### Regras de ouro

1. **Cores**: `var(--color-token)` — NUNCA `#hex` ou `rgb()`
2. **Fontes**: definir stacks como constantes JS, usar var() para custom fonts
3. **Componentes client**: apenas onde necessario (ThemeToggle). Pagina pode ser server component
4. **Inline styles**: seguir padrao do design-system para consistencia com tokens
5. **Build**: `npm run build` deve passar

### Checklist

- [ ] Todas as secoes do plano implementadas
- [ ] Todos os dados reais inseridos
- [ ] Dark mode funcional
- [ ] ThemeToggle integrado
- [ ] Layout responsivo basico (overflow-x em tabelas)
- [ ] Build sem erros

## Fase 4: Verificacao Visual

### Processo

1. Dev server rodando
2. Screenshot em light mode (full page)
3. Screenshot em dark mode (full page)
4. Comparacao com referencia:
   - Layout e proporcoes
   - Cores e contraste
   - Tipografia e pesos
   - Espacamentos
   - Dados corretos

### Criterios de aprovacao

- Estrutura fiel (mesmas secoes, mesma ordem)
- Cores compativeis (tokens corretos, dark mode funcional)
- Tipografia correta (serif/sans/mono nos lugares certos)
- Dados corretos (textos, numeros, nomes)

## Subagentes

| Subagente | Funcao | Model | Tools |
|---|---|---|---|
| screenshot-capturer | Captura screenshots da URL | haiku | MCP chrome-devtools |
| ds-extractor | Extrai tokens CSS de screenshots | opus | Read, Write, Edit, Glob |
| ds-page-builder | Constroi documentacao visual do DS | opus | Read, Write, Edit, Glob, Bash |
| page-planner | Planeja estrutura da pagina | opus | Read, Glob, Grep |
| page-builder | Implementa o codigo | opus | Read, Write, Edit, Glob, Grep, Bash |
| visual-verifier | Compara screenshots | sonnet | Read, Glob, Bash, MCP chrome-devtools |

## Modo Agent Teams (--teams)

Quando invocado com `--teams`, o pipeline usa agent teams em vez de subagents sequenciais.

### Diferenca principal

| Aspecto | Subagents (padrao) | Agent Teams (--teams) |
|---|---|---|
| Orquestracao | Sessao principal delega sequencialmente | Team lead cria tasks com dependencias |
| Comunicacao | Via orquestrador (hub-and-spoke) | Direta entre teammates (task list compartilhado) |
| Loop de correcao | Orquestrador intermedia builder↔verifier | Verifier cria task direto para builder |
| Overhead | Maior (contexto passa pelo orquestrador) | Menor (comunicacao peer-to-peer) |

### Quando usar --teams

- Paginas complexas com muitas secoes
- Quando o loop de correcao e esperado (paginas detalhadas)
- Para aproveitar comunicacao direta builder↔verifier

### Requisitos

- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` deve estar definida na env
- Configuravel em `.claude/settings.local.json`

## Exemplo Real: slopforks.com

Este processo foi usado para replicar a home do slopforks.com neste repositorio.

### Resultado
- **Design System**: 14 cores primitivas, 14 tokens semanticos, 3 font stacks, 3 radii
- **Componentes**: ThemeToggle, sticky header, language badges, star counts, fork badges
- **Pagina**: hero com definicao, leaderboard com 11 projetos, CTA banner
- **Dark mode**: funcional via `[data-theme="dark"]`
- **Build**: passa sem erros
