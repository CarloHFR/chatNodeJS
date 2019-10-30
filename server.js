// Modulo http - Permite a utilização do protocolo http
const http = require('http');

// Modulo express - Simplifica a criação e configuração do servidor
const express = require("express");

// Modulo Socket.io - Permite a comunicação entre os usuarios por um chat real time (As paginas são servidas na porta 3000 e o socket na porta 4000)
const io = require('socket.io')(http);

// Modulo fs - Permite a leitura das paginas html para envio ao usuario
const fs = require('fs');

// Usando a função express pelo nome "app"
const app = express();

//Permite tornar todos os arquivos dentro da pasta public acessiveis a todo o site
app.use(express.static('public'));

// Lista que contem o nome dos clientes
var clients = {};

// Array que armazenara todas as mensagens enquanto o server estiver rodando.
var mensagens = [];

// -------------------------------- PAGINAS -------------------------------------------------

// Rota principal do site - Atraves dela o usuario pode se cadastrar, logar e utilizar o chat
app.get("/", function(req, res) {
  var index = fs.readFileSync("index.html");    // Lendo a pagina e salvando na variavel
  res.end(index);   // Enviando a variavel para o usuario
});

// ------------------------------------------------------------------------------------------

// --------------------------------- SOCKET -------------------------------------------------

// Se conectado ao cliente:
io.on("connection", function (client)
{  
    // No evento "join": Mostre o nome do usuario no console do server, informe a ele e aos demais usuarios que ele conectou
    client.on("join", function(name)
    {
    	console.log("Novo usuario: " + name);
        clients[client.id] = name;

        // Envia para o cliente que conectou agora as mensagens antigas
        client.emit("preview", mensagens);

        client.emit("update", "Bem vindo a sala de bate-papo");
        client.broadcast.emit("update", name + " entrou na sala");
    });

    // No evento "send": Mostre no console de server e envie a todos os usuarios a mensagem recebida
    client.on("send", function(data)
    {
        // Adicionando a mensagem no array.
        mensagens.push(data);

        // Mostrando no console do server a mensagem
        console.log(data);

        // Enviando aos usuarios a mensagem recebida
        client.broadcast.emit("chat", data);
    });

    // No evente "disconnect": Informe aos demsis que o usuario saiu da sala
    client.on("disconnect", function()
    {
        // Mostrando no console do server o usuario que saiu
        console.log(clients[client.id]  + " saiu da sala.");
        
        // Informando aos demais usuarios sobre o cliente que saiu
        io.emit("update", clients[client.id] + " saiu da sala");

        // Retirando o usuario da lista de clientes
        delete clients[client.id];
    });
});

// ------------------------------------------------------------------------------------------

// Iniciando servidor
http.createServer(app).listen(3000, () => console.log("Servidor iniciado localmente na porta 3000"));
