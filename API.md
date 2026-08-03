# Motion Hub API

API para o seu Jarvis controlar o Motion Hub sem depender do painel aberto no navegador.

## Rodar

1. Crie um arquivo `.env` com base no `.env.example`.
2. Preencha:
   - `HUB_API_TOKEN`: um token grande e secreto para o Jarvis usar.
   - `HUB_EMAIL` e `HUB_PASSWORD`: o login do Supabase que você usa no Hub.
3. Rode:

```bash
npm run api
```

A API sobe em `http://localhost:3333` por padrão.

## Rodar na Vercel

Na Vercel, configure estas Environment Variables no projeto:

```env
HUB_API_TOKEN=troque-por-um-token-grande-e-secreto
HUB_EMAIL=seu@email.com
HUB_PASSWORD=sua-senha
SUPABASE_URL=https://zwqcbwiegcndwvqprcdt.supabase.co
SUPABASE_KEY=sb_publishable_DQg6Q79FXornM4XKlKGkJw_OQjUGEvz
```

Depois faca redeploy. A URL do Jarvis passa a ser a URL publica da Vercel:

```env
HUB_API_URL=https://seu-projeto.vercel.app
HUB_API_TOKEN=o-mesmo-token-configurado-na-vercel
```

As rotas ficam iguais:

```http
GET https://seu-projeto.vercel.app/api/schema
POST https://seu-projeto.vercel.app/api/tools/create_task
```

## Autenticação

Todas as rotas `/api/*` usam:

```http
Authorization: Bearer <HUB_API_TOKEN>
```

## Descobrir ferramentas

```http
GET /api/schema
```

## Chamar ferramenta

```http
POST /api/tools/create_task
Authorization: Bearer <HUB_API_TOKEN>
Content-Type: application/json

{
  "title": "Enviar proposta para cliente",
  "project": "Cotai",
  "priority": "Alta",
  "due": "2026-05-21",
  "col": "today"
}
```

## Ferramentas disponíveis

- `get_summary`
- `list_tasks`
- `create_task`
- `update_task`
- `delete_task`
- `list_recurring_events`
- `create_recurring_event`
- `update_recurring_event`
- `delete_recurring_event`
- `list_projects`
- `create_project`
- `list_habits`
- `check_habit`
- `list_goals`
- `create_idea`
- `list_contacts`
- `add_transaction`
- `list_transactions`
- `update_transaction`
- `delete_transaction`
- `get_financial_forecast`
- `list_notes`
- `search_notes`
- `read_note`
- `create_note`

### Exemplo: reunião recorrente

```http
POST /api/tools/create_recurring_event
Authorization: Bearer <HUB_API_TOKEN>
Content-Type: application/json

{
  "title": "Reunião semanal",
  "start_date": "2026-08-03",
  "time": "10:00",
  "duration": 60,
  "frequency": "weekly",
  "weekdays": [1],
  "end_type": "never"
}
```

Em `weekdays`, use `0` para domingo, `1` para segunda-feira e assim por diante até `6` para sábado.

### Exemplo: despesa financeira recorrente

```http
POST /api/tools/add_transaction
Authorization: Bearer <HUB_API_TOKEN>
Content-Type: application/json

{
  "type": "Despesa",
  "desc": "Hospedagem mensal",
  "value": 180,
  "project": "Motion Hub",
  "date": "2026-08-10",
  "recurring": true,
  "frequency": "monthly",
  "interval": 1,
  "end_type": "never"
}
```

Para consultar a projeção que considera os lançamentos recorrentes, use `POST /api/tools/get_financial_forecast` com `{ "months": 6 }`.

Também existe `GET /api/data` para ler o estado bruto do Hub.
