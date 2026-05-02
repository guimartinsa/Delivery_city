# Delivery_city
Sistema web de delivery focado em cidades do interior.

## Recursos implementados
- **Cardápio por link único de loja**: cada loja tem seu link próprio em `/loja/:slug`.
- **Automação WhatsApp por loja**: ao criar pedido via API, o sistema simula o disparo da mensagem para o WhatsApp da loja.
- **Impressão de pedidos**: cada pedido gera URL de impressão em `/pedido/:id/imprimir`.

## Como executar
```bash
npm install
npm start
```

A aplicação sobe em `http://localhost:3000`.

## Fluxo básico
1. Acesse `/` para ver as lojas.
2. Abra o link da loja para visualizar o cardápio.
3. Crie um pedido com:
```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "lojaSlug": "hamburgueria-central",
    "cliente": "João",
    "itens": ["h1", "h2"]
  }'
```
4. Abra a URL `printUrl` retornada para imprimir o pedido.
