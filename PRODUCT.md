# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

O usuário principal é o CEO da plataforma ControlaÊ, que administra estabelecimentos clientes, seus acessos e a disponibilidade do serviço.

## Product Purpose

O Painel CEO centraliza a operação comercial e técnica da plataforma sem expor nem misturar os dados operacionais de cada restaurante. Sucesso significa cadastrar, preparar, ativar, suspender e dar acesso a um estabelecimento com clareza e segurança.

## Positioning

Uma única plataforma operacional atende vários estabelecimentos independentes, cada um com banco próprio, enquanto o CEO controla clientes, assinatura, acesso, provisionamento e impressão em um plano de controle central.

## Operating Context

O painel é usado em desktop para acompanhar a carteira de clientes e executar ações administrativas. Cada estabelecimento possui link próprio, banco PostgreSQL separado, usuário Dono e token individual do agente de impressão.

## Capabilities and Constraints

- Cadastrar estabelecimentos e consultar ou editar sua conexão PostgreSQL nas configurações, com acesso exclusivo ao CEO autenticado.
- Preparar ou atualizar o banco operacional com progresso por etapas e contagem das alterações aplicadas, confirmando a conclusão após o registro no painel.
- Exibir o motivo e a orientação de recuperação em falhas de preparação ou atualização, com código do erro e referência de atendimento, sem expor credenciais ou diagnósticos técnicos.
- Criar ou reconciliar o usuário Dono e redefinir sua senha.
- Editar mensalidade e vencimento, controlar status e gerar token de impressão.
- Copiar e abrir o link operacional do estabelecimento.
- A ativação exige banco preparado e Dono ativo.
- Cobrança é administrativa e manual; não existe gateway automático nesta versão.
- A lógica atual e os contratos da API devem ser preservados durante alterações visuais.

## Brand Commitments

O produto se chama **ControlaÊ** e esta superfície é identificada como **Painel CEO**. A referência visual fornecida em 15/10/2026 é vinculante para este redesenho.

## Evidence on Hand

- Interface funcional existente em `app/page.tsx`.
- Referência visual fornecida pelo usuário para a tela de estabelecimentos.
- Dados reais vindos da API; não fabricar métricas, clientes ou estados.

## Product Principles

- Separação de dados deve ser evidente e confiável.
- A situação de cada cliente deve ser compreendida em poucos segundos.
- Ações críticas precisam ser claras, reversíveis quando possível e acompanhadas de feedback.
- O visual pode ser marcante sem reduzir legibilidade ou eficiência operacional.

## Accessibility & Inclusion

Controles devem permanecer utilizáveis por teclado, apresentar foco visível, contraste suficiente e rótulos acessíveis em desktop e mobile.
