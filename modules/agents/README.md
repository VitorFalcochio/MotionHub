# Motion Agent Runtime

Runtime local dos agentes da Motion Hub.

## Capacidades

- fila persistente de execucoes;
- scheduler por cadencia enquanto o Hub esta aberto;
- execucao manual individual ou coordenada pelo Jarvis;
- habilidades especializadas para Atlas, Scout, Closer e Ledger;
- acoes locais idempotentes para tarefas e notas;
- aprovacoes para agentes supervisionados e acoes sensiveis;
- relatorios, falhas, historico e criterios de parada observaveis;
- API local em `window.motionAgents` para integracao com outros modulos.

## Politica operacional

- `autonomous`: pode executar acoes locais de baixo risco;
- `approval`: executa acoes locais, mas para antes de acoes sensiveis;
- `supervised`: toda mutacao vira uma aprovacao;
- exclusoes, transacoes e comunicacoes externas sempre exigem aprovacao.

O scheduler depende de uma aba aberta porque o estado principal ainda vive no `localStorage`. Para execucao continua com o navegador fechado, o proximo passo arquitetural e mover fila, locks e estado dos agentes para o backend/Supabase.
