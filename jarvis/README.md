# Jarvis Cognitive Architecture

O Jarvis usa dois cérebros com papéis distintos:

- **Local Brain:** pipeline determinístico, rápido, com contexto, memória, conhecimento, skills e ações do Motion Hub.
- **Groq:** especialista usado somente quando a política local identifica conteúdo aberto ou complexo.

## Pipeline

Toda entrada percorre, nesta ordem:

1. `InputNormalizer`: limpa a entrada, reduz repetições, expande abreviações e cria uma versão sem acentos para comparação.
2. `SocialEngine`: identifica conversa casual e combina inícios, transições e encerramentos em centenas de variações locais.
3. `IntentEngine`: classifica a intenção por regras pequenas, ordenadas por prioridade.
4. `ContextEngine`: mantém tópico e turnos recentes na sessão.
5. `MemoryEngine`: guarda projetos, objetivos, tecnologias, preferências, arquivos e conversas com limite e expiração.
6. `KnowledgeEngine`: consulta JSON local sob demanda e mantém os documentos em cache.
7. `SkillEngine`: valida o descriptor e carrega dinamicamente apenas a skill escolhida.
8. `LocalBrain`: combina skill, conhecimento e a ponte de comandos do Motion Hub.
9. `Planner`: escolhe resposta, representação e Smart Actions com política de risco.
10. `GroqPolicy`: autoriza o especialista somente depois de todos os estágios locais.
11. `HistoryManager`: registra mensagem, intenção, fonte e tempo de resposta.

`ConversationPolicy` mantém a conversa em modo answer-first. Ela limita perguntas, valida quando um seletor é legítimo e persiste a obrigação de entregar depois de uma escolha. `ResponseGuard` verifica a saída final e solicita uma única correção interna se um especialista violar essa política.

`OperationalPolicy` classifica ferramentas mutáveis por domínio e risco. Alterações locais reversíveis geram um recibo com desfazer; exclusões e operações financeiras ficam pendentes até confirmação explícita. O adapter do Motion Hub captura e restaura o estado afetado, mantendo a política separada do monólito.

A conexão Groq é validada ao salvar a chave e mantém um status local sem armazenar a credencial na memória cognitiva. Falhas de autenticação, permissão, limite, capacidade e rede são apresentadas separadamente; uma falha da API não pode ser descrita como chave ausente.

O ponto de composição é `router/JarvisRouter.js`. A interface pública criada por `JarvisBootstrap.js` fica em `window.JarvisCognitive`. Toda saída usa o contrato versionado de `contracts/JarvisResponse.js`, mantendo aliases para integrações antigas.

As ações já existentes de tarefas, agenda, projetos e finanças continuam disponíveis por uma ponte `localExecutor` fornecida por `script.js`. Ela é infraestrutura da aplicação; classificação, contexto e decisão de resposta pertencem ao novo pipeline.

## Responsabilidades

| Diretório | Responsabilidade |
| --- | --- |
| `normalizer/` | Representação canônica da entrada |
| `social/` | Conversa curta sem LLM |
| `brain/` | Intenção e raciocínio local |
| `context/` | Tópico ativo e continuidade da sessão |
| `memory/` | Memória persistente, limitada e expirada |
| `knowledge/` | Documentos locais JSON e busca em cache |
| `skills/` | Capacidades independentes carregadas sob demanda |
| `planner/` | Escolha da resposta e da ação |
| `actions/` | Planejamento, prioridade, risco e confirmação de Smart Actions |
| `contracts/` | Contrato estável de resposta entre cérebro e interfaces |
| `experience/` | Modos e seleção da melhor representação |
| `groq/` | Critérios de escalonamento ao LLM |
| `history/` | Auditoria de origem e desempenho |
| `router/` | Orquestração do pipeline |
| `utils/` | Armazenamento e cache reutilizáveis |

## Nova skill

1. Crie `skills/nome.skill.js` exportando `descriptor` e `execute(payload)`.
2. O descriptor deve declarar `name`, `description`, `whenToUse`, `input`, `output` e `priority`.
3. Registre um loader dinâmico em `SkillRegistry.js`.
4. Relacione a intenção em `SkillEngine.js`.
5. Adicione regras pequenas e testáveis em `IntentEngine.js`.

A skill retorna `{ response, source }` e pode acrescentar `action`, `canvas`, `needsGroq` ou `groqReason`. Ela não acessa a interface diretamente.

## Novo conhecimento

Adicione um JSON com `id`, `title`, `keywords`, `summary` e `practices`, e inclua o id em `KnowledgeEngine.js`. Os arquivos são carregados apenas quando uma consulta local precisa deles e ficam em cache por uma hora.

## Integrações futuras

O objeto `runtime` recebido pelo Router é a porta de integração. Hoje ele fornece `hub.execute`, `webSearch`, `memory`, `signal`, `onProgress` e um resumo de `workspace`. Canvas usa uma Smart Action estruturada. Agentes, plugins, automações, voz, OCR e visão computacional devem seguir o mesmo padrão: um adapter no runtime e uma ação declarativa emitida por uma skill. Assim, as integrações crescem sem alterar o núcleo do pipeline.

## Armazenamento e privacidade

Contexto de conversa fica em `sessionStorage`. Memória e histórico ficam em `localStorage`, têm tamanho máximo e expiração automática. Chaves de API não entram na memória cognitiva. Limpar a conversa reinicia o contexto ativo; o histórico técnico continua disponível para diagnóstico até expirar ou ser removido explicitamente.
