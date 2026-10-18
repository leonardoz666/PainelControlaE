---
name: ControlaÊ — Painel CEO
description: Uma mesa de controle executiva, compacta e sóbria para operar estabelecimentos com clareza.
colors:
  rail-deep: "#221746"
  rail-mid: "#30205f"
  primary: "#6546d7"
  primary-action: "#6546d7"
  primary-hover: "#5637c1"
  primary-soft: "#f0edfb"
  crown-orange: "#ff6b00"
  ink: "#18172b"
  muted: "#68677c"
  canvas: "#f5f5f8"
  panel: "#ffffff"
  border: "#e5e4eb"
  focus: "#6c36df"
  success: "#0abf78"
  info: "#3c5ce8"
  warning: "#ee8b10"
  danger: "#eb3f49"
typography:
  display:
    fontFamily: "Manrope Variable, Segoe UI, sans-serif"
    fontSize: "clamp(27px, 2.5vw, 32px)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Manrope Variable, Segoe UI, sans-serif"
    fontSize: "18px"
    fontWeight: 790
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Manrope Variable, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope Variable, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope Variable, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 730
    lineHeight: 1.2
    letterSpacing: "normal"
rounded:
  control-sm: "9px"
  control: "9px"
  control-lg: "10px"
  card: "12px"
  panel: "16px"
  pill: "999px"
spacing:
  compact: "7px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "24px"
  page: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-action}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.control-lg}"
    padding: "0 17px"
    height: "42px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "#ffffff"
  button-secondary:
    backgroundColor: "#f0eff9"
    textColor: "#555b7c"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  field:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 13px"
    height: "45px"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "18px"
  status-pill:
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "5px 9px"
---

# Design System: ControlaÊ — Painel CEO

## Overview

**Creative North Star: "A Mesa de Controle"**

O Painel CEO é uma mesa de controle administrativa: sóbrio, compacto e orientado a estado. O rail violeta profundo ancora a navegação e separa o plano de controle da área operacional; o canvas neutro e as superfícies brancas deixam os dados, alertas e próximas ações conduzirem a leitura.

A identidade aparece em poucos gestos memoráveis: a coroa laranja, o rail violeta, números tabulares e divisões precisas. O sistema evita gradientes decorativos, vidro e coleções de cartões flutuantes. A expressão fica concentrada na marca e nas ações primárias; o restante funciona como uma ferramenta executiva.

**Key Characteristics:**

- Rail violeta profundo como âncora permanente no desktop.
- Canvas cinza frio uniforme, sem paisagem decorativa.
- Coroa laranja reservada à identidade, não a ações comuns.
- Painéis brancos opacos, bordas precisas e elevação quase plana.
- Densidade operacional alta, organizada por blocos curtos e escaneáveis.
- Estados, foco, placeholders e reorganização mobile sempre legíveis.

## Colors

A paleta contrapõe violetas reais e profundos a uma base fria, luminosa e quase branca; o laranja entra como assinatura de marca e as cores semânticas aparecem apenas onde carregam significado operacional.

### Primary

- **Violeta de Comando:** conduz ações primárias, estados ativos, links em interação e destaques de prontidão.
- **Violeta do Rail:** cria o campo escuro de navegação e sustenta contraste branco sem competir com o conteúdo.
- **Lilás de Contexto:** colore fundos de ícones, chips de prontidão e camadas discretas.

### Secondary

- **Laranja da Coroa:** identifica o ControlaÊ em marcas e avatares de estabelecimento; sua raridade preserva sua força.

### Tertiary

- **Verde Operacional, Azul Informativo, Âmbar de Atenção e Vermelho Crítico:** diferenciam métricas e estados. A cor sempre acompanha texto ou ícone; nunca é a única pista.

### Neutral

- **Tinta Executiva:** texto principal, títulos e valores que exigem leitura imediata.
- **Cinza Lilás:** explicações, metadados e rótulos secundários.
- **Canvas Neutro:** fundo geral frio e uniforme.
- **Branco Operacional:** painéis principais e superfícies de conteúdo.
- **Linha Fria:** delimitação de campos, registros e divisões internas.

**The Crown Reserve Rule.** O laranja pertence à identidade da marca; ações rotineiras permanecem violetas.

**The Semantic Pairing Rule.** Verde, azul, âmbar e vermelho devem sempre reforçar um rótulo, ícone ou mensagem explícita.

## Typography

**Display Font:** Manrope Variable (com Segoe UI e sans-serif como fallback)
**Body Font:** Manrope Variable (com Segoe UI e sans-serif como fallback)
**Label/Mono Font:** Manrope Variable; tokens técnicos usam a pilha monoespaçada nativa do sistema.

**Character:** Manrope dá ao painel uma voz contemporânea, precisa e amigável. Pesos fortes e tracking negativo comprimem títulos com autoridade; corpo e rótulos mantêm abertura suficiente para leitura rápida.

### Hierarchy

- **Display** (820, fluido entre 30px e 38px, 1.08): título principal da superfície.
- **Headline** (800, 21px, 1.2): títulos de painéis e formulários.
- **Title** (820, 19px, 1.2): nome de estabelecimento e títulos locais de alta prioridade.
- **Body** (400, 15px, 1.55): orientação e explicações; prefira linhas curtas em vez de blocos extensos.
- **Label** (730, 13px, 1.2): campos e controles. Metadados podem descer a 10–12px somente quando o contraste e o espaço forem preservados.

**The Numeric Calm Rule.** Valores, contagens e cobranças usam algarismos tabulares para permanecer alinhados durante atualização.

**The Weight Before Size Rule.** A hierarquia cresce primeiro por peso e contraste; tamanhos muito grandes não pertencem a esta interface operacional.

## Layout

No desktop, o shell reserva um rail fixo de 220px e entrega o restante a um canvas fluido. O conteúdo central tem largura máxima de 1440px e respiro de página de 28–32px. Cabeçalho, resumo e clientes compartilham o mesmo eixo. O resumo forma uma faixa contínua de cinco células; clientes formam registros separados por linhas, com identidade, cobrança e ações em zonas previsíveis.

O ritmo usa intervalos compactos de 7–14px dentro de controles e grupos, 18–24px entre blocos internos e 25–34px entre seções. Isso mantém as ações densas sem parecerem apertadas. As métricas formam cinco colunas no desktop, três em telas intermediárias e duas no mobile; cartões de clientes quebram de três zonas para duas e finalmente para uma coluna.

Abaixo de 980px, o rail torna-se um cabeçalho de altura natural e a navegação perde elementos não essenciais. Abaixo de 720px, cabeçalhos, busca, formulários, cobrança e ações empilham; abaixo de 430px, a prioridade passa a ser nome, estado e próxima ação. Nenhuma ação pode depender de hover, e alvos interativos importantes preservam cerca de 44–48px de altura.

**The Scan Lane Rule.** Identidade, situação financeira e ações ocupam zonas previsíveis; não misture controles entre essas faixas no desktop.

**The Stack, Don't Shrink Rule.** No mobile, reorganize blocos e expanda botões em vez de comprimir texto e alvos.

## Elevation & Depth

O sistema é essencialmente plano. Bordas frias e mudanças sutis de superfície separam regiões; sombras aparecem apenas em painéis agregadores e ações primárias, com baixa amplitude. Cartões filhos não flutuam dentro de outros cartões.

### Shadow Vocabulary

- **Panel Rest:** (`0 1px 2px rgba(34, 28, 58, .04)`) separa painéis grandes do canvas.
- **Primary Action:** (`0 4px 12px rgba(76, 49, 161, .2)`) dá presença controlada aos CTAs.

**The Flat Operations Rule.** Estrutura nasce de bordas, alinhamento e proximidade; sombra não substitui hierarquia.

**The One-Container Rule.** Registros repetidos compartilham um contêiner e são separados por linhas; evite empilhar cartões filhos com elevação própria.

## Shapes

Controles usam cantos suavemente arredondados de 8–10px e painéis operacionais usam 14–16px. Pílulas são totalmente arredondadas e reservadas a estados compactos. A coroa aparece em quadrados arredondados laranja, criando uma silhueta constante entre marca e clientes.

Bordas são claras, finas e frias. O canvas permanece uniforme; o conteúdo usa geometria ortogonal e previsível. Evite misturar cantos retos, círculos decorativos e raios aleatórios no mesmo componente.

**The Radius Ladder Rule.** Controle, cartão e painel devem subir de forma reconhecível na escala de raio; o tamanho do contêiner determina a curvatura.

## Components

### Buttons

- **Shape:** controles firmes e arredondados, normalmente com 11–12px de raio e altura mínima de 44–48px.
- **Primary:** texto branco sobre violeta sólido, peso forte, ícone opcional e espaçamento horizontal confortável.
- **Hover / Focus:** hover sobe 1px e aprofunda a cor; foco por teclado usa contorno violeta de 3px com offset de 3px. Movimento é praticamente removido quando o sistema solicita redução.
- **Secondary / Ghost:** secundários usam lilás-neutro e texto escuro; ações textuais ficam transparentes. Estados desabilitados reduzem opacidade e removem deslocamento.

### Chips

- **Style:** pílulas compactas com fundo tonal e texto semântico escuro; um ponto ou ícone reforça o significado.
- **State:** prontidão usa violeta, proteção usa azul e pendência usa âmbar. Status de acesso mantém seu próprio rótulo textual.

### Cards / Containers

- **Corner Style:** 12px para blocos locais e 14–16px para painéis agregadores.
- **Background:** branco opaco em painéis e registros operacionais.
- **Shadow Strategy:** use apenas Panel Rest em contêineres agregadores; filhos são planos.
- **Border:** linha fria de 1px separa regiões e registros.
- **Internal Padding:** 12–16px em registros operacionais; 16–20px em formulários.

### Inputs / Fields

- **Style:** fundo branco, borda fria de 1px, raio de 9px e altura de 38–45px.
- **Focus:** borda muda para violeta claro com halo externo suave, além do contorno global visível por teclado.
- **Placeholder / Disabled:** placeholders mantêm contraste legível; desabilitado nunca depende apenas de cor e deve preservar o rótulo.

### Navigation

O rail usa branco e lavanda sobre violeta profundo. A opção ativa recebe uma superfície branca translúcida e peso alto; hover clareia texto e superfície. Em mobile, o rail vira cabeçalho e elementos secundários desaparecem antes que a navegação seja comprimida.

### Metric Card

Cada métrica ocupa uma célula de uma faixa única, combinando ícone tonal compacto, número tabular e rótulo curto. Divisões verticais substituem cartões independentes; o tom semântico varia sem alterar a estrutura.

### Client Action Grid

Em telas largas, cada registro mantém estabelecimento, mensalidade e situação compactos à esquerda e usa o espaço restante para uma grade de ações 4 × 2. Em larguras intermediárias, as ações descem para uma faixa neutra; no mobile, reorganizam-se em duas colunas e a ação de acesso ocupa a largura total. Os botões não têm contorno e usam ícone ao lado do rótulo; somente a ação de acesso é preenchida.

## Do's and Don'ts

### Do:

- **Do** mantenha o rail violeta e a coroa laranja como âncoras reconhecíveis do ControlaÊ.
- **Do** agrupe ações por estabelecimento e preserve separadores claros entre identidade, cobrança e operação.
- **Do** use bordas e alinhamento antes de recorrer a sombra ou superfície adicional.
- **Do** apresente estados críticos com texto, cor e, quando útil, ícone.
- **Do** empilhe conteúdo responsivamente e preserve alvos de toque confortáveis.
- **Do** mantenha foco visível, placeholders legíveis e suporte a movimento reduzido.

### Don't:

- **Don't** transforme o laranja da coroa em cor genérica de CTA ou de status.
- **Don't** use sombras pretas duras, glassmorphism excessivo ou blur que prejudique a leitura.
- **Don't** esconda pré-condições de ativação, estados de carregamento ou feedback de ações.
- **Don't** reduza cartões complexos até virarem linhas ilegíveis no mobile; reorganize-os em blocos.
- **Don't** introduza uma segunda família tipográfica ou pesos leves em dados operacionais.
- **Don't** altere comportamento de API, regras de negócio ou conteúdo real para acomodar a composição visual.
