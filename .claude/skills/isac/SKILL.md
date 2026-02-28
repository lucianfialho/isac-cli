---
name: isac
description: Pipeline automatizado para replicar paginas web. Captura screenshots de uma URL, extrai design system, planeja, implementa e verifica visualmente.
disable-model-invocation: true
argument-hint: replicate <url> [--teams]
---

# Pipeline ISAC — Replicacao de Pagina

Voce e um orquestrador que coordena subagentes especializados para replicar uma pagina web a partir de uma URL.

Para documentacao detalhada do processo, consulte [process.md](process.md).

## Entrada

`$ARGUMENTS` contem a string completa de argumentos. Parse da seguinte forma:

1. **Subcomando** (primeiro token): deve ser `replicate`. Se nao for, responda com erro:
   > Subcomando desconhecido. Uso: `/isac replicate <url> [--teams]`
2. **URL** (segundo token): deve comecar com `http`. Se ausente ou invalida, responda com erro:
   > URL invalida. Forneca uma URL completa (ex: `https://example.com`)
3. **Flag --teams**: verificar se `$ARGUMENTS` contem `--teams`

Exemplo de parsing:
- `replicate https://example.com` → subcomando=replicate, url=https://example.com, teams=false
- `replicate https://example.com --teams` → subcomando=replicate, url=https://example.com, teams=true

## Pre-requisitos

Antes de iniciar, verifique:
1. Projeto Next.js esta configurado (package.json com next)
2. `app/globals.css` existe
3. Se `--teams` foi usado, verifique que `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` esta definida como `1`

---

## Pipeline (modo padrao — sem --teams)

Execute as fases **sequencialmente** via Task tool. Cada fase depende da anterior.

### Fase 0: Captura de Screenshots

Delegue ao subagente **screenshot-capturer** com o prompt:

> Capture screenshots full-page da URL `<URL>`.
> Salve em `.claude/screenshots/`.
> Capture em light e dark mode se disponivel.
> Use viewport de 1440px (desktop).

**Criterio de sucesso**: `.claude/screenshots/full-page.png` existe.

---

### Fase 1: Extracao de Design System

Delegue ao subagente **ds-extractor** com o prompt:

> Analise os screenshots em `.claude/screenshots/` e extraia o design system completo.
> Crie:
> 1. CSS custom properties em `app/globals.css` com tokens light/dark
> 2. Pagina de documentacao em `app/design-system/page.tsx`
> 3. Componente ThemeToggle em `app/design-system/components/theme-toggle.tsx`
>
> Use o template em `.claude/skills/isac/templates/design-tokens.css` como referencia.
> Screenshots estao em: `.claude/screenshots/`

**Criterio de sucesso**: `app/globals.css` contem tokens semanticos com variantes light e dark.

---

### Fase 2: Planejamento

Delegue ao subagente **page-planner** com o prompt:

> Analise os screenshots em `.claude/screenshots/` e o design system em `app/globals.css` e `app/design-system/page.tsx`.
> Crie um plano detalhado cobrindo:
> 1. Estrutura de secoes da pagina (hero, header, tabelas, CTAs, footer)
> 2. Dados reais extraidos dos screenshots (textos, numeros, nomes)
> 3. Hierarquia de componentes
> 4. Mapeamento de cada elemento visual para tokens CSS
> 5. Links externos visiveis nos screenshots
>
> Retorne o plano completo como texto estruturado.

**Criterio de sucesso**: plano identifica todas as secoes visiveis nos screenshots com dados concretos.

---

### Fase 3: Implementacao

Delegue ao subagente **page-builder** com o prompt:

> Implemente a pagina em `app/page.tsx` seguindo este plano:
> [INSERIR PLANO DA FASE 2]
>
> Regras obrigatorias:
> - Use APENAS `var(--token)` para cores — NUNCA valores hex/rgb hardcoded
> - Suporte dark mode via `[data-theme="dark"]` (ja configurado no globals.css)
> - Reutilize ThemeToggle de `app/components/theme-toggle.tsx` (copie de design-system se nao existir)
> - Atualize metadata em `app/layout.tsx`
> - Rode `npm run build` ao final para validar
>
> Design system esta em: `app/globals.css`
> Referencia visual: screenshots em `.claude/screenshots/`

**Criterio de sucesso**: `npm run build` passa sem erros.

---

### Fase 4: Verificacao Visual

Delegue ao subagente **visual-verifier** com o prompt:

> Verifique a implementacao comparando com os screenshots de referencia.
> 1. Inicie `npm run dev` se nao estiver rodando
> 2. Navegue para http://localhost:3000
> 3. Capture screenshot da pagina completa em light mode
> 4. Capture screenshot em dark mode
> 5. Compare visualmente com os screenshots em `.claude/screenshots/`
> 6. Liste diferencas encontradas (layout, cores, tipografia, espacamento, dados)
>
> Reporte: APROVADO se fiel, ou lista de correcoes necessarias.

**Criterio de sucesso**: pagina visualmente fiel ao screenshot de referencia em ambos os modos.

---

## Pipeline (modo teams — com --teams)

> Requer `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` na env.

Neste modo, o orquestrador (sessao principal) atua como **team lead** usando agent teams em vez de subagents sequenciais.

### 1. Criar agent team

Crie um time com 5 teammates especializados, um para cada fase:

| Teammate | Agente base | Responsabilidade |
|---|---|---|
| capturer | screenshot-capturer | Fase 0: Captura de screenshots |
| extractor | ds-extractor | Fase 1: Extracao de design system |
| planner | page-planner | Fase 2: Planejamento |
| builder | page-builder | Fase 3: Implementacao |
| verifier | visual-verifier | Fase 4: Verificacao visual |

### 2. Criar tasks com dependencias

Use o task list compartilhado para definir dependencias:

```
Task 1: "Capturar screenshots de <URL>" (sem bloqueio)
Task 2: "Extrair design system dos screenshots" (blocked by 1)
Task 3: "Planejar estrutura da pagina" (blocked by 2)
Task 4: "Implementar pagina em page.tsx" (blocked by 3)
Task 5: "Verificar fidelidade visual" (blocked by 4)
```

### 3. Execucao

- Teammates reclamam tasks conforme sao desbloqueadas
- Cada teammate usa as ferramentas do seu agente base
- O team lead monitora progresso via task list

### 4. Vantagem: loop de correcao direto

No modo teams, quando o verifier reporta problemas:
- O verifier comunica diretamente com o builder via task list
- Cria nova task: "Corrigir: [lista de problemas]" assigned ao builder
- Builder corrige e cria task de re-verificacao para o verifier
- Sem overhead do orquestrador intermediando

---

## Loop de Correcao (ambos os modos)

Se a Fase 4 reportar problemas:
1. Delegue correcoes ao **page-builder** com a lista de problemas
2. Re-execute a Fase 4
3. Repita ate APROVADO (maximo 3 iteracoes)

## Resultado Final

Ao concluir, resuma:
- URL replicada
- Arquivos criados/modificados
- Tokens do design system
- Secoes da pagina implementadas
- Status da verificacao visual
- Modo utilizado (subagents ou teams)
