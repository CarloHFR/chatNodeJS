// FEITO EM JQUERY 

// Quando o documento estiver sido carregado faça:
$(document).ready(function()
{  
	// Conectando com o socket.io (As paginas são servidas na porta 3000 e o socket na porta 4000)
    var socket = io.connect("http://localhost:4000");
	var ready = false;
	
	// Faz o fade das mesnagens do servidor
	function alertServer(msg)
	{
		$(".alert").fadeIn("slow");
		$(".alert").text(msg);
		$(".alert").fadeOut(10000);
	}

	// Tela inicial de pergunta de nome e que faz o topo da pagina de chat
	$("#submit").submit(function(e)
	{
		e.preventDefault();
		$("#nick").fadeOut();
		$("#chat").fadeIn();
		var name = $("#nickname").val();

		var time = new Date();
		var horario = `${("0" + time.getHours()).slice(-2)}:${("0" + time.getMinutes()).slice(-2)}`;

		$("#name").html(name);
		$("#time").html(horario);

		ready = true;

		socket.emit("join", name);
	});

	// Campo de texto para as mensagens - Formata a mesagem do usuario para ele mesmo e envia ao servidor para o broadcast  
	$("#textarea").keypress(function(e)
	{
		if(e.which == 13)
		{
			var text = $("#textarea").val();
			var name = $("#nickname").val();
        	$("#textarea").val('');
        	var time = new Date();
			var horario = `${("0" + time.getHours()).slice(-2)}:${("0" + time.getMinutes()).slice(-2)}`;
			
			$(".chat").append('<li class="self"><div class="msg"><span>' + name + '<br></span>' + text + '<br><time>' + horario + '</time></div></li>');

			//Esse objeto sera enviado ao server que ira retransmitir aos clientes
			var data = {
				autor: name,
				mensagem: text,
				hora: horario,
			};

			socket.emit("send", data);

			// Faz o scroll down da pagina automaticamente
			document.getElementById('bottom').scrollIntoView();
        }
	});

	// Atualiza a pagina de chat com informações do server (quem entrou ou saiu por exemplo)
	socket.on("update", function(msg)
	{
		if(ready)
		{
			//$('.chat').append('<li class="info">' + msg + '</li>');
			alertServer(msg);

			// Faz o scroll down da pagina automaticamente
			document.getElementById('bottom').scrollIntoView();
			
    	}
    }); 

	// Mostra a mensagem dos outros usuarios
	socket.on("chat", function(data)
	{
		if(ready)
		{
			$(".chat").append('<br><li class="field"><div class="msg"><span>' + data.autor + '</span><p>' + data.mensagem + '</p><time>' + data.hora + '</time></div></li>');	
		}
		
		// Faz o scroll down da pagina automaticamente
		document.getElementById('bottom').scrollIntoView();
	});
	
	// Mostra as mensagens antigas dos outros usuarios
	socket.on("preview", function(mensagens)
	{
		if(ready)
		{
			//Esse for ira percorer todo o array de mensagens antigas e então ira mostar uma por uma.
			for (mensagem of mensagens)
			{
				$(".chat").append('<li class="field"><div class="msg"><span>' + mensagem.autor + '</span><p>' + mensagem.mensagem + '</p><time>' + mensagem.hora + '</time></div></li>');	
			}
    	}
    });
});
