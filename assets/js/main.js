/* Lista de produtos e carrinho. Usa CONFIG e PRODUTOS (assets/data) e é usado por pedido.js. */

const brl = n => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = n => n.toLocaleString("pt-BR");
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const arred = n => Math.round(n * 100) / 100;

const todos = PRODUTOS.flatMap(c => c.itens);
const qtd = {};
const MAX = 20; // limite por produto
const passo = p => p.un === "kg" ? 0.5 : 1;
const CHAVE = "feira-carrinho";

/* O carrinho fica guardado só enquanto a aba estiver aberta (sessionStorage), para não perder
   o pedido se o celular recarregar a página ao voltar do WhatsApp. */
function salvar() { try { sessionStorage.setItem(CHAVE, JSON.stringify(qtd)); } catch (e) { } }
function restaurar() {
    try {
        const s = JSON.parse(sessionStorage.getItem(CHAVE) || "{}");
        todos.forEach(p => {
            const q = Math.round(Number(s[p.id]) / passo(p)) * passo(p);
            if (Number.isFinite(q) && q > 0 && q <= MAX) qtd[p.id] = q;
        });
    } catch (e) { }
}

document.title = CONFIG.loja;
$("loja").textContent = CONFIG.loja;
$("info").innerHTML = CONFIG.info.map(t => `<li>${esc(t)}</li>`).join("");

/* Foto que não existe: troca pelo emoji do produto */
$("lista").addEventListener("error", e => {
    const img = e.target;
    if (img.tagName === "IMG") img.parentNode.textContent = img.dataset.e || "";
}, true);

$("lista").innerHTML = PRODUTOS.map(c => `
  <section>
    <div class="cat"><h2>${esc(c.cat)}</h2></div>
    ${c.itens.map(p => `
      <div class="row" id="row-${esc(p.id)}">
        <div class="foto" aria-hidden="true"><img src="${esc(p.img || "imagens/" + p.id + ".jpg")}" alt="" loading="lazy" data-e="${esc(p.e || "")}"></div>
        <div><span class="nome">${esc(p.nome)}</span><span class="un">preço por ${esc(p.un)}</span></div>
        <span class="price">${brl(p.preco)}</span>
        <div class="step">
          <button type="button" data-id="${esc(p.id)}" data-d="-1" aria-label="Diminuir ${esc(p.nome)}" disabled>−</button>
          <output id="q-${esc(p.id)}" aria-live="polite">0</output>
          <button type="button" data-id="${esc(p.id)}" data-d="1" aria-label="Aumentar ${esc(p.nome)}">+</button>
        </div>
      </div>`).join("")}
  </section>`).join("") + `<p class="note">${esc(CONFIG.aviso)}</p>`;

$("lista").addEventListener("click", e => {
    const b = e.target.closest("button[data-id]");
    if (!b) return;
    const p = todos.find(x => x.id === b.dataset.id);
    if (!p) return;
    const novo = Math.min(MAX, Math.max(0, (qtd[p.id] || 0) + Number(b.dataset.d) * passo(p)));
    if (novo) qtd[p.id] = novo; else delete qtd[p.id];
    atualizarLinha(p);
    atualizarBarra();
    salvar();
});

function atualizarLinha(p) {
    const q = qtd[p.id] || 0;
    $("q-" + p.id).textContent = q ? `${num(q)} ${p.un}` : "0";
    $("row-" + p.id).classList.toggle("on", q > 0);
    $("row-" + p.id).querySelector('[data-d="-1"]').disabled = q === 0;
    $("row-" + p.id).querySelector('[data-d="1"]').disabled = q >= MAX;
}

const itensPedido = () => todos.filter(p => qtd[p.id]).map(p => ({ p, q: qtd[p.id], sub: arred(qtd[p.id] * p.preco) }));
const subtotal = () => arred(itensPedido().reduce((s, i) => s + i.sub, 0));

function atualizarBarra() {
    const n = itensPedido().length, s = subtotal();
    $("resumo").innerHTML = n
        ? `${n} ${n === 1 ? "produto" : "produtos"}<b>${brl(s)}</b>`
        : `Seu pedido está vazio<b>${brl(0)}</b>`;
    $("revisar").disabled = n === 0;
}

restaurar();
todos.forEach(atualizarLinha);
atualizarBarra();

/* abrir e fechar o resumo do pedido */
const dlg = $("dlg");
$("revisar").addEventListener("click", () => { montarPedido(); dlg.showModal(); });
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });