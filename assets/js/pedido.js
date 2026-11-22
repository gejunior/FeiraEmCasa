/* Resumo do pedido, validação e envio ao Formspree. Usa o que main.js define. */

const FORMSPREE_OK = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/;
let enviando = false;

function montarPedido() {
    const itens = itensPedido(), s = subtotal(), taxa = CONFIG.taxaEntrega, total = arred(s + taxa);
    const falta = arred(CONFIG.pedidoMinimo - s);
    $("dlgConteudo").innerHTML = `
    <h2 id="dlgTitulo">Seu pedido</h2>
    <ul class="linhas">${itens.map(i => `<li><span>${num(i.q)} ${esc(i.p.un)} de ${esc(i.p.nome)}</span><span>${brl(i.sub)}</span></li>`).join("")}</ul>
    <div class="tot"><span>Produtos</span><span>${brl(s)}</span></div>
    <div class="tot"><span>Entrega</span><span>${taxa ? brl(taxa) : "Grátis"}</span></div>
    <div class="tot final"><span>Total</span><span>${brl(total)}</span></div>
    ${falta > 0 ? `<p class="erro">O pedido mínimo é ${brl(CONFIG.pedidoMinimo)}. Faltam ${brl(falta)}.</p>` : ""}
    <form id="form" novalidate>
      <label>Seu nome<input name="nome" required maxlength="80" autocomplete="name" autocapitalize="words"></label>
      <label>WhatsApp com DDD<input name="whatsapp" type="tel" inputmode="tel" required maxlength="20" autocomplete="tel" placeholder="(18) 99999-9999"></label>
      <label>Bairro<select name="bairro" required><option value="">Escolha seu bairro</option>${CONFIG.bairros.map(b => `<option>${esc(b)}</option>`).join("")}</select></label>
      <label>Endereço (rua, número e complemento)<input name="endereco" required maxlength="160" autocomplete="street-address"></label>
      <label>Forma de pagamento<select name="pagamento" required><option value="">Escolha</option><option>Pix</option><option>Dinheiro na entrega</option><option>Cartão na entrega</option></select></label>
      <label>Observações (opcional)<textarea name="observacoes" maxlength="300" placeholder="Ex.: tomate mais verde, deixar com o porteiro"></textarea></label>
      <div class="hp" aria-hidden="true"><label>Não preencha<input name="_gotcha" tabindex="-1" autocomplete="off"></label></div>
      <p class="erro" id="erro" role="alert" hidden></p>
      <div class="acoes">
        <button type="button" class="btn sec" id="voltar">Voltar e editar</button>
        <button type="submit" class="btn" id="enviar" ${falta > 0 ? "disabled" : ""}>Enviar pedido</button>
      </div>
    </form>`;
    $("voltar").onclick = () => dlg.close();
    $("form").onsubmit = enviar;
}

function mostrarErro(msg, campo) {
    const erro = $("erro");
    erro.textContent = msg; erro.hidden = false;
    if (campo) campo.focus();
}

async function enviar(e) {
    e.preventDefault();
    if (enviando) return;
    const f = e.target, btn = $("enviar");
    $("erro").hidden = true;
    if (f._gotcha.value) return; // robô preencheu o campo escondido

    const vazio = ["nome", "whatsapp", "bairro", "endereco", "pagamento"].find(n => !f[n].value.trim());
    if (vazio) return mostrarErro("Preencha todos os campos obrigatórios.", f[vazio]);
    if (f.whatsapp.value.replace(/\D/g, "").length < 10) return mostrarErro("Confira o número de WhatsApp: ele precisa ter o DDD.", f.whatsapp);
    if (!FORMSPREE_OK.test(CONFIG.formspree)) return mostrarErro("O formulário ainda não foi configurado. Avise o responsável pela loja.");

    const itens = itensPedido(), total = arred(subtotal() + CONFIG.taxaEntrega);
    if (!itens.length || subtotal() < CONFIG.pedidoMinimo) return mostrarErro("Seu pedido não atingiu o mínimo.");

    const dados = {
        _subject: `Novo pedido de ${f.nome.value.trim()} – ${brl(total)}`,
        nome: f.nome.value.trim(),
        whatsapp: f.whatsapp.value.trim(),
        bairro: f.bairro.value,
        endereco: f.endereco.value.trim(),
        pagamento: f.pagamento.value,
        observacoes: f.observacoes.value.trim() || "—",
        pedido: itens.map(i => `${num(i.q)} ${i.p.un} de ${i.p.nome} (${brl(i.sub)})`).join("\n"),
        entrega: CONFIG.taxaEntrega ? brl(CONFIG.taxaEntrega) : "Grátis",
        total: brl(total)
    };

    enviando = true; btn.disabled = true; btn.textContent = "Enviando…";
    const ctrl = new AbortController();
    const tempo = setTimeout(() => ctrl.abort(), 20000); // internet móvel ruim não deixa travado
    try {
        const r = await fetch(CONFIG.formspree, {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(dados),
            signal: ctrl.signal
        });
        if (!r.ok) throw new Error(r.status);
        sucesso(dados.nome);
    } catch (err) {
        mostrarErro("Não foi possível enviar o pedido. Confira sua internet e tente de novo. Seu carrinho foi mantido.");
        btn.disabled = false; btn.textContent = "Enviar pedido";
    } finally {
        clearTimeout(tempo); enviando = false;
    }
}

function sucesso(nome) {
    $("dlgConteudo").innerHTML = `<div class="ok"><h2 id="dlgTitulo">Pedido enviado!</h2>
    <p id="msg"></p>
    <p>Vamos conferir a disponibilidade e te chamar no WhatsApp para confirmar o valor final e o horário da entrega.</p>
    <div class="acoes"><button class="btn" id="fechar">Fazer outro pedido</button></div></div>`;
    $("msg").textContent = `Obrigado, ${nome}.`;
    $("fechar").onclick = () => dlg.close();
    Object.keys(qtd).forEach(k => delete qtd[k]);
    salvar();
    todos.forEach(atualizarLinha);
    atualizarBarra();
}