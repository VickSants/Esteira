const express = require("express");
const { Telegraf } = require("telegraf"); 
const app = express();
app.use(express.static("public"));

const TOKEN_TELEGRAM = "8593888017:AAFMoS4PnzMxyP8XRqcO6eCozIYDWePHD88";
const SEU_CHAT_ID = "8744667308";

const bot = new Telegraf(TOKEN_TELEGRAM);

let esteira = {
    ligada: true,
    velocidade: 80,
    pecas: 0
};

let avisoEnviado = false;

setInterval(() => {
    if (esteira.ligada) {
        esteira.pecas++;
        
                if (esteira.pecas === 15 && !avisoEnviado) {
            bot.telegram.sendMessage(SEU_CHAT_ID, "⚠️ Alerta: A esteira atingiu a marca de 15 peças produzidas!");
            avisoEnviado = true;
        }
    }
}, 2000);

bot.command("status", (ctx) => {
    const texto = `📊 *Status da Esteira*:\n\n` +
                  `🔋 Estado: ${esteira.ligada ? "LIGADA" : "DESLIGADA"}\n` +
                  `⚡ Velocidade: ${esteira.velocidade} RPM\n` +
                  `📦 Peças: ${esteira.pecas}`;
    ctx.replyWithMarkdown(texto);
});

bot.launch().then(() => console.log("Bot do Telegram Ativo!"));

app.get("/dados", (req, res) => {
    res.json(esteira);
});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});