# Jarvis — Auditoria e Plano de Refatoração Incremental

**Base normativa:** [JXS.md](./JXS.md)<br>
**Escopo auditado:** pipeline cognitivo, integração em `script.js`, Groq, conhecimento, skills, memória, histórico, UI e Canvas.<br>
**Estratégia:** evolução por contratos, mantendo os IDs de DOM, eventos, armazenamento e funções do Motion Hub já utilizados.

## 1. Diagnóstico

### 1.1 Pontos preservados

- Pipeline local já separado por responsabilidade.
- Skills carregadas sob demanda.
- Conhecimento local consultado antes do Groq.
- Contexto de sessão e memória persistente limitados.
- Integração funcional com as operações existentes do Hub.
- Canvas aceita contexto direto e incremental.
- Interface em tela inteira e painel flutuante compartilham mensagens.

### 1.2 Lacunas críticas contra a JXS

| Área | Limitação atual | Impacto JXS |
| --- | --- | --- |
| Orquestração | O Router decide pelo Groq, mas `script.js` conclui o fluxo por fora | Não há um ciclo cognitivo único nem resultado final uniforme |
| Histórico | A resposta provisória local é registrada antes do Groq e o Groq gera outro registro | Auditoria duplicada e tempo incorreto |
| Resposta | Contrato contém principalmente `response`, `source` e um `action` isolado | Não expressa representação, risco, progresso, suposições ou várias Smart Actions |
| UI | Canvas é sugerido por regex aplicada ao texto final | Falsos positivos e acoplamento entre conteúdo e ação |
| Planner | Seleciona entre social/local/Groq, mas não ranqueia ações ou componentes | Não implementa avanço, representação e risco definidos na JXS |
| Intenção | Classificador produz um único rótulo e pouca evidência | Intenções compostas e entidades ficam invisíveis |
| Contexto | Tópico é extraído por duas regex e não possui referências ou mudança explícita robusta | Follow-ups frágeis e risco de misturar projetos |
| Memória | Armazena dados, mas não explica uso, não corrige e não esquece seletivamente | Memória não é visível nem controlável |
| Skills | Descriptors não são validados e saídas variam | Integrações futuras exigiriam condições especiais |
| Pesquisa | Existe ferramenta web no legado, mas o pipeline local não a recebe como adapter | Pedidos atuais podem terminar em mensagem de indisponibilidade incorreta |
| Progresso | Apenas indicador genérico de digitação | Trabalho longo não comunica etapas reais nem permite cancelamento |
| Erros | Contingência genérica esconde categoria e recuperação | Falta estado compreensível e falha parcial |
| Ações do Hub | O parser e a execução continuam em uma função condicional no monólito | Difícil testar e substituir sem regressão |
| Modos | Programador, Arquiteto, Professor, Designer, Negócios e Pesquisador não existem | Comportamento não se adapta de forma explícita |

## 2. Contratos de compatibilidade

Durante toda a refatoração devem permanecer estáveis:

- `window.JarvisCognitive.process(message, runtime)`;
- `window.JarvisCognitive.resetConversation()`;
- `window.motionCanvas.applyContext(payload)`;
- eventos `motion:jarvis-ready`, `motion:canvas-context` e `motion:canvas-open`;
- IDs dos compositores e listas de mensagens;
- `jarvisMessages` como histórico visual da sessão atual;
- armazenamento legado de dados do Motion Hub;
- `jarvisTryLocal` como adapter temporário para operações do monólito.

O adapter legado deixa de decidir experiência. Ele apenas executa ou consulta operações existentes quando uma skill solicita.

## 3. Etapas implementadas

### Etapa 1 — Contrato de resposta e rastreamento

- Introduzir resposta versionada e normalizada.
- Separar mensagem, representação, Smart Actions, estado, risco e metadados.
- Registrar somente a conclusão real no histórico.
- Manter aliases antigos para a UI existente.

### Etapa 2 — Intenção, contexto e modos

- Classificar intenção principal e intenções secundárias.
- Extrair entidades e evidências de classificação.
- Tratar mudança de tópico, referência contextual e tópico de projeto.
- Inferir modos inteligentes sem exigir seleção manual.

### Etapa 3 — Planner de experiência e Smart Actions

- Escolher representação apropriada.
- Gerar e ranquear ações estruturadas.
- Aplicar política de risco, confirmação e execução automática.
- Implementado em `OperationalPolicy`, com recibos reversíveis para mutações locais e confirmação obrigatória para exclusões e financeiro.
- Remover inferência de Canvas baseada no texto da resposta.

### Etapa 4 — Adapters e capacidades

- Padronizar a fronteira com operações do Hub.
- Expor pesquisa web ao pipeline como adapter.
- Manter fallback legado quando uma operação ainda não foi migrada.
- Preparar ações para documentos, projetos, roadmap e futuras integrações.

### Etapa 5 — Memória, progresso e recuperação

- Expor memórias utilizadas e APIs para inspeção/esquecimento.
- Emitir etapas reais do pipeline.
- Permitir cancelamento da operação atual.
- Classificar erros e oferecer recuperação coerente.

### Etapa 6 — UI compatível

- Renderizar Smart Actions estruturadas.
- Mostrar progresso textual real e fonte da resposta.
- Manter painel e página sincronizados.
- Preservar abertura incremental do Canvas.

### Etapa 7 — Verificação

- Sintaxe e integridade dos documentos de conhecimento.
- Testes do Router sem Groq.
- Fluxos de UI em desktop e mobile.
- Ações locais, pesquisa indisponível, cancelamento, memória e Canvas.
- Ausência de erros no console.

## 4. Dívida deliberadamente isolada

O executor `jarvisTryLocal` permanece em `script.js` porque acessa diretamente o estado privado do monólito (`S`) e dezenas de funções de renderização e persistência. Movê-lo integralmente exigiria primeiro modularizar o domínio do Motion Hub, o que ultrapassa a fronteira segura desta refatoração.

Nesta etapa ele será tratado como `runtime.hub.execute`: um adapter sem autoridade sobre intenção, memória, formato, Groq ou Smart Actions. Novas operações não devem ser adicionadas ao parser legado; devem entrar como capacidades estruturadas no adapter.

## 5. Critério de conclusão

A refatoração incremental está concluída quando o fluxo antigo continua funcionando e toda nova resposta atravessa um contrato único, com fonte, intenção, modo, representação, ações, rastreamento e histórico final verificável.

## 6. Registro da implementação

As sete etapas foram aplicadas mantendo os contratos da seção 2.

- Resposta cognitiva versionada em `contracts/JarvisResponse.js`.
- Modos e representação em `experience/`.
- Smart Actions e risco em `actions/`.
- Intenções secundárias, entidades e contexto versionado.
- Memória inspecionável e esquecimento seletivo.
- Pesquisa como skill e adapter, com rota serverless equivalente.
- Progresso por estágio, atraso antirruído e cancelamento.
- Contexto cognitivo enviado ao Groq somente após decisão local.
- Histórico concluído uma única vez, depois da resposta efetiva.
- UI compatível com página, painel e Canvas incremental.
- Política answer-first, bloqueio de seletores consecutivos e validação de respostas externas.
- Skill de negócios que transforma ideias vagas em uma hipótese inicial sem devolver o trabalho ao usuário.

O executor legado permanece exclusivamente na fronteira `runtime.hub.execute`, conforme a dívida isolada da seção 4.
