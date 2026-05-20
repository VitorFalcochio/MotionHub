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
- `list_projects`
- `create_project`
- `list_habits`
- `check_habit`
- `list_goals`
- `create_idea`
- `list_contacts`
- `add_transaction`
- `list_notes`
- `search_notes`
- `read_note`
- `create_note`

Também existe `GET /api/data` para ler o estado bruto do Hub.
