const resposta = await fetch("/dados");
const dados = await resposta.json();
document.getElementById("pecas").innerText =
    dados.pecas;
setInterval(atualizar, 1000);
