# Esteira com CLP, banco de dados, API e painel web

Projeto de automação que liga um CLP simulado (OpenPLC) a um painel web em tempo real.
A lógica da esteira roda em ladder no CLP. Um serviço em Node.js lê o CLP por Modbus TCP,
grava tudo em SQLite e uma API Express entrega os dados para o painel.

## Demonstração

| Esteira em operação | Alarme de limite de peças |
| --- | --- |
| ![Painel com a esteira em operação](docs/painel-operacao.png) | ![Painel com alarme ativo](docs/painel-alarme.png) |

## Fluxo

```mermaid
flowchart LR
  A[Botões e sensor simulados] --> B[CLP OpenPLC<br/>lógica em ladder]
  B -->|Modbus TCP| C[leitor.js<br/>Node.js]
  C --> D[(SQLite)]
  D --> E[API Express<br/>server.js]
  E --> F[Painel web]
```

## O que o sistema faz

- **Start** liga o motor, e um contato de selo mantém o motor ligado.
- **Stop** desliga o motor e zera o contador de peças.
- **Sensor de peça** acende o sinalizador enquanto detecta uma peça.
- O **contador** soma uma peça a cada pulso do sensor, com o motor ligado, até o limite de 10 peças.
- Ao chegar no limite, o CLP ativa o **alarme**. O leitor registra o alarme no banco com data e hora.
- O painel mostra o estado em tempo real e a tabela de alarmes, com o botão **Reconhecer**.

## Lógica do CLP (ladder)

| Degrau | Lógica |
| --- | --- |
| 1 | `START0` com selo `MOTOR0`, contato `STOP0` normalmente fechado, bobina `MOTOR0` |
| 2 | `SENSOR_DE_PECA0` liga a bobina `SINALIZADOR0` |
| 3 | Contador `CTU1`: `CU` = `SENSOR_DE_PECA0` e `MOTOR0`, `R` = `STOP0`, `PV` = `PRESET_CONTADOR`, `Q` na bobina `LIMITE_ATINGIDO0` |
| 4 | `LIMITE_ATINGIDO0` liga a bobina `ALARME0` |

### Endereços Modbus usados

| Variável | Endereço no CLP | Modbus |
| --- | --- | --- |
| `START0`, `STOP0`, `SENSOR_DE_PECA0` | `%IX0.0` a `%IX0.2` | Discrete Inputs 0 a 2 |
| `MOTOR0`, `SINALIZADOR0`, `LIMITE_ATINGIDO0`, `ALARME0` | `%QX0.0` a `%QX0.3` | Coils 0 a 3 |
| `PRESET_CONTADOR` | `%MW0` | Holding Register 1024 |

## Tecnologias

- OpenPLC Editor e Runtime (ladder, servidor Modbus na porta 502)
- Node.js e `modbus-serial`
- SQLite com `better-sqlite3`
- Express (API REST)
- HTML, CSS e JavaScript puro no painel

## Estrutura

```
.
├── leitor.js    Lê o CLP a cada segundo e grava no banco
├── db.js        Tabelas e consultas do SQLite
├── server.js    API Express e servidor do painel
├── public/      Painel web (index.html)
└── docs/        Prints do painel
```

## Como rodar

Requisitos: Node.js 20 ou mais novo e o OpenPLC (Editor e Runtime).

1. No OpenPLC Editor, habilite um **Server (Modbus)** na porta 502, faça o Upload e deixe o estado em `RUNNING`.
2. Instale as dependências:
   ```
   npm install
   ```
3. Abra dois terminais na pasta do projeto.

   Terminal 1 (leitor):
   ```
   node leitor.js
   ```
   Terminal 2 (API e painel):
   ```
   node server.js
   ```
4. Abra `http://localhost:3000`.

O leitor grava o preset de 10 peças no CLP sempre que ele estiver zerado (por exemplo, depois de reiniciar o PLC).

## API

| Método e rota | O que faz |
| --- | --- |
| `GET /status` | Última leitura do CLP |
| `GET /alarmes?limite=10` | Últimos alarmes |
| `GET /leituras?limite=50` | Histórico de leituras |
| `POST /alarmes/:id/reconhecer` | Marca um alarme como reconhecido |

## Problemas que resolvi no caminho

- **Modbus no OpenPLC Runtime v4:** o servidor só sobe depois de criar um *Server (Modbus)* no projeto do Editor. Mexer só no `plugins.conf` não adianta, porque cada upload reescreve o arquivo.
- **Estado `ERROR` depois do upload:** o upload gera o `ethercat.json` vazio e o plugin falha. Gravar `{"version":1,"masters":[]}` nos dois arquivos `ethercat.json` e reiniciar o PLC resolve.
- **Contador sempre ligado:** o `PV` ficava vazio e o preset valia 0. Ligar o `PV` a uma variável corrigiu.
- **Reconexão:** o leitor reconecta sozinho quando o CLP reinicia.

## Próximos passos

- Mostrar a contagem atual de peças no painel.
- Parar o motor automaticamente quando o limite for atingido.
- Gráfico do histórico de leituras.

## Autora

Vitória, engenheira de computação. Projeto criado para praticar automação e integração de sistemas.
