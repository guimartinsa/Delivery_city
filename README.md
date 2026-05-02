# Delivery City

Vamos evoluir o projeto para uma arquitetura moderna com:

- **Backend:** Django + Django REST Framework
- **Frontend:** React (Vite)
- **Banco e storage de imagens:** Supabase (Postgres + Storage)

## Estrutura proposta

```text
Delivery_city/
  backend/          # API Django
  frontend/         # App React
  infra/            # scripts e configuração de ambiente
```

## 1) Backend (Django)

### Criar ambiente

```bash
python -m venv .venv
source .venv/bin/activate
pip install django djangorestframework django-cors-headers supabase python-dotenv
```

### Inicializar projeto

```bash
mkdir -p backend
cd backend
django-admin startproject core .
python manage.py startapp orders
```

### Dependências principais

- `djangorestframework`: construção da API.
- `django-cors-headers`: permitir chamadas do frontend.
- `supabase`: upload e leitura de imagens via Supabase Storage.

### Variáveis de ambiente (`backend/.env`)

```env
DEBUG=True
SECRET_KEY=trocar-essa-chave
ALLOWED_HOSTS=localhost,127.0.0.1

SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_KEY=SUA_SERVICE_ROLE_OU_ANON_KEY
SUPABASE_BUCKET=product-images
```

## 2) Frontend (React)

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install @supabase/supabase-js axios react-router-dom
```

### Variáveis de ambiente (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
VITE_SUPABASE_BUCKET=product-images
```

## 3) Supabase

No Supabase você usará:

- **Postgres** para dados transacionais.
- **Storage bucket** para imagens de produtos e lojas.

Passos:

1. Criar projeto no Supabase.
2. Criar bucket `product-images`.
3. Definir políticas de acesso (RLS e Storage policies).
4. Salvar URL pública (ou caminho) da imagem no banco.

## 4) Fluxo de upload de imagens

1. Usuário seleciona arquivo no React.
2. Frontend envia `multipart/form-data` para endpoint Django.
3. Django valida arquivo e faz upload no Supabase Storage.
4. Django salva URL/path no banco e retorna ao frontend.
5. Frontend exibe preview da imagem salva.

## 5) Próximos passos de implementação

- [ ] Criar models: `Store`, `MenuItem`, `Order`, `OrderItem`.
- [ ] Expor endpoints REST com DRF.
- [ ] Implementar endpoint de upload em `orders/services/supabase_storage.py`.
- [ ] Criar telas React: lista de lojas, cardápio e checkout.
- [ ] Integrar envio para WhatsApp como worker assíncrono.

## Observação

A versão atual em `server.js` (Express) pode ser mantida temporariamente apenas como referência durante a migração.
