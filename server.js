const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const lojas = [
  {
    id: 1,
    nome: 'Hamburgueria Central',
    slug: 'hamburgueria-central',
    whatsapp: '+55 11 90000-0001',
    itens: [
      { id: 'h1', nome: 'X-Burger', preco: 22.9 },
      { id: 'h2', nome: 'Batata Frita', preco: 14.5 },
      { id: 'h3', nome: 'Refrigerante Lata', preco: 6.0 }
    ]
  },
  {
    id: 2,
    nome: 'Pizza da Praça',
    slug: 'pizza-da-praca',
    whatsapp: '+55 11 90000-0002',
    itens: [
      { id: 'p1', nome: 'Pizza Calabresa', preco: 49.9 },
      { id: 'p2', nome: 'Pizza Frango c/ Catupiry', preco: 54.9 },
      { id: 'p3', nome: 'Guaraná 2L', preco: 12.0 }
    ]
  }
];

const pedidos = [];

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

function renderLayout(title, body) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body {font-family: Arial, sans-serif; margin:0; background:#f6f7fb; color:#222}
    header{background:#1f2937; color:#fff; padding:18px}
    main{max-width:900px; margin:24px auto; background:#fff; padding:20px; border-radius:8px; box-shadow:0 4px 16px rgba(0,0,0,0.08)}
    h1,h2,h3{margin-top:0}
    .grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px}
    .card{border:1px solid #ddd; border-radius:8px; padding:14px; background:#fff}
    .badge{display:inline-block; background:#e5f3ff; color:#004085; padding:4px 8px; border-radius:999px; font-size:12px}
    table{width:100%; border-collapse:collapse}
    th,td{border-bottom:1px solid #eee; text-align:left; padding:10px 8px}
    .total{font-size:20px; font-weight:bold}
    .btn{background:#22c55e; color:white; border:none; padding:10px 14px; border-radius:6px; cursor:pointer}
    @media print {
      .no-print{display:none}
      body{background:#fff}
      main{box-shadow:none; margin:0; max-width:none}
    }
  </style>
</head>
<body>
  <header><strong>Delivery City</strong></header>
  <main>${body}</main>
</body>
</html>`;
}

app.get('/', (req, res) => {
  const links = lojas
    .map(
      (loja) => `<div class="card">
        <h3>${loja.nome}</h3>
        <div class="badge">WhatsApp: ${loja.whatsapp}</div>
        <p><a href="/loja/${loja.slug}">Ver cardápio exclusivo</a></p>
      </div>`
    )
    .join('');

  res.send(
    renderLayout(
      'Lojas',
      `<h1>Lojas cadastradas</h1>
      <p>Cada loja possui seu próprio link de cardápio e automação de WhatsApp.</p>
      <div class="grid">${links}</div>`
    )
  );
});

app.get('/loja/:slug', (req, res) => {
  const loja = lojas.find((l) => l.slug === req.params.slug);
  if (!loja) return res.status(404).send(renderLayout('Loja não encontrada', '<h2>Loja não encontrada.</h2>'));

  const itens = loja.itens
    .map(
      (item) => `<tr>
        <td>${item.nome}</td>
        <td>${formatCurrency(item.preco)}</td>
      </tr>`
    )
    .join('');

  res.send(
    renderLayout(
      `Cardápio - ${loja.nome}`,
      `<h1>${loja.nome}</h1>
      <p><strong>Link da loja:</strong> /loja/${loja.slug}</p>
      <p><strong>WhatsApp automático:</strong> ${loja.whatsapp}</p>
      <h2>Cardápio</h2>
      <table><thead><tr><th>Item</th><th>Preço</th></tr></thead><tbody>${itens}</tbody></table>
      <p>Para simular pedido via API use <code>POST /api/pedidos</code>.</p>`
    )
  );
});

app.post('/api/pedidos', (req, res) => {
  const { lojaSlug, cliente, itens } = req.body;
  const loja = lojas.find((l) => l.slug === lojaSlug);

  if (!loja || !cliente || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      error: 'Dados inválidos. Envie lojaSlug, cliente e itens.'
    });
  }

  const itensDetalhados = itens
    .map((id) => loja.itens.find((item) => item.id === id))
    .filter(Boolean);

  if (itensDetalhados.length === 0) {
    return res.status(400).json({ error: 'Nenhum item válido informado.' });
  }

  const total = itensDetalhados.reduce((acc, item) => acc + item.preco, 0);

  const pedido = {
    id: pedidos.length + 1,
    data: new Date().toISOString(),
    loja: { nome: loja.nome, slug: loja.slug, whatsapp: loja.whatsapp },
    cliente,
    itens: itensDetalhados,
    total
  };

  pedidos.push(pedido);

  const whatsappMessage = [
    'Novo pedido recebido!',
    `Loja: ${pedido.loja.nome}`,
    `Cliente: ${pedido.cliente}`,
    `Itens: ${pedido.itens.map((item) => item.nome).join(', ')}`,
    `Total: ${formatCurrency(pedido.total)}`
  ].join(' | ');

  console.log(`[WHATSAPP-AUTO] Envio para ${pedido.loja.whatsapp}: ${whatsappMessage}`);

  res.status(201).json({
    pedidoId: pedido.id,
    printUrl: `/pedido/${pedido.id}/imprimir`,
    whatsappStatus: 'mensagem_enfileirada'
  });
});

app.get('/pedido/:id/imprimir', (req, res) => {
  const pedido = pedidos.find((p) => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).send(renderLayout('Pedido não encontrado', '<h2>Pedido não encontrado.</h2>'));

  const itens = pedido.itens.map((item) => `<li>${item.nome} - ${formatCurrency(item.preco)}</li>`).join('');

  res.send(
    renderLayout(
      `Impressão pedido #${pedido.id}`,
      `<h1>Pedido #${pedido.id}</h1>
      <p><strong>Data:</strong> ${new Date(pedido.data).toLocaleString('pt-BR')}</p>
      <p><strong>Loja:</strong> ${pedido.loja.nome}</p>
      <p><strong>Cliente:</strong> ${pedido.cliente}</p>
      <h3>Itens</h3>
      <ul>${itens}</ul>
      <p class="total">Total: ${formatCurrency(pedido.total)}</p>
      <button class="btn no-print" onclick="window.print()">Imprimir pedido</button>`
    )
  );
});

app.listen(port, () => {
  console.log(`Delivery City rodando em http://localhost:${port}`);
});
