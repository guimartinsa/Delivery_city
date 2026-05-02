const stores = [
  {
    id: 1,
    name: 'Hamburgueria Central',
    slug: 'hamburgueria-central',
    whatsapp: '+55 11 90000-0001',
    menu: [
      { id: 'h1', name: 'X-Burger', price: 22.9 },
      { id: 'h2', name: 'Batata Frita', price: 14.5 },
      { id: 'h3', name: 'Refrigerante Lata', price: 6 }
    ]
  },
  {
    id: 2,
    name: 'Pizza da Praça',
    slug: 'pizza-da-praca',
    whatsapp: '+55 11 90000-0002',
    menu: [
      { id: 'p1', name: 'Pizza Calabresa', price: 49.9 },
      { id: 'p2', name: 'Pizza Frango c/ Catupiry', price: 54.9 },
      { id: 'p3', name: 'Guaraná 2L', price: 12 }
    ]
  }
];

let selectedStore = stores[0];
const cart = [];
const orders = [];

const money = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function renderStores() {
  const el = document.getElementById('stores');
  el.innerHTML = stores.map((s) => `
    <article class="card">
      <h4>${s.name}</h4>
      <p>${s.whatsapp}</p>
      <button onclick="selectStore('${s.slug}')">Ver cardápio</button>
    </article>
  `).join('');
}

function selectStore(slug) {
  selectedStore = stores.find((s) => s.slug === slug) || stores[0];
  renderMenu();
}
window.selectStore = selectStore;

function addToCart(itemId) {
  const item = selectedStore.menu.find((i) => i.id === itemId);
  if (!item) return;
  cart.push({ ...item, store: selectedStore.name });
  renderCart();
}
window.addToCart = addToCart;

function renderMenu() {
  const el = document.getElementById('menu');
  el.innerHTML = selectedStore.menu.map((item) => `
    <article class="card">
      <small>${selectedStore.name}</small>
      <h4>${item.name}</h4>
      <p>${money(item.price)}</p>
      <button onclick="addToCart('${item.id}')">Adicionar</button>
    </article>
  `).join('');
}

function renderCart() {
  const ul = document.getElementById('cartItems');
  ul.innerHTML = cart.length ? cart.map((i, idx) => `<li>${i.name} - ${money(i.price)} <button onclick="removeItem(${idx})">x</button></li>`).join('') : '<li>Carrinho vazio</li>';
  const total = cart.reduce((a, i) => a + i.price, 0);
  document.getElementById('total').textContent = money(total);
}

function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}
window.removeItem = removeItem;

function checkout() {
  const customer = document.getElementById('customerName').value.trim();
  if (!customer) return alert('Informe seu nome.');
  if (!cart.length) return alert('Adicione itens no carrinho.');

  const total = cart.reduce((a, i) => a + i.price, 0);
  const order = {
    id: orders.length + 1,
    date: new Date().toLocaleString('pt-BR'),
    customer,
    store: selectedStore.name,
    items: cart.map((i) => i.name),
    total,
    whatsappStatus: 'mensagem_enfileirada (mock)'
  };

  orders.unshift(order);
  cart.length = 0;
  document.getElementById('customerName').value = '';
  renderCart();
  renderOrders();
  alert(`Pedido #${order.id} criado com sucesso!`);
}

function renderOrders() {
  const el = document.getElementById('orders');
  el.innerHTML = orders.length ? orders.map((o) => `
    <div class="order-item">
      <strong>Pedido #${o.id}</strong> · ${o.date}<br/>
      Cliente: ${o.customer} · Loja: ${o.store}<br/>
      Itens: ${o.items.join(', ')}<br/>
      Total: ${money(o.total)} · WhatsApp: ${o.whatsappStatus}
    </div>
  `).join('') : '<p>Nenhum pedido ainda.</p>';
}

document.getElementById('checkoutBtn').addEventListener('click', checkout);
renderStores();
renderMenu();
renderCart();
renderOrders();
