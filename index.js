
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Página principal com autocomplete de cidades
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<title>Previsão do Tempo + IBGE</title>
<style>
  body { font-family: Arial; padding: 20px; }
  input { padding: 10px; width: 300px; }
  button { padding: 10px 20px; margin-top: 10px; }
  .suggestions {
    border: 1px solid #ccc;
    max-height: 150px;
    overflow-y: auto;
    width: 300px;
    background: white;
    position: absolute;
  }
  .suggestions div {
    padding: 8px;
    cursor: pointer;
  }
  .suggestions div:hover {
    background-color: #eee;
  }
  #resultado {
    margin-top: 20px;
  }
</style>
</head>
<body>
<h2>Previsão do Tempo</h2>
<label>Digite a cidade:</label><br>
<input type="text" id="cidade" placeholder="Ex: Niterói">
<div class="suggestions" id="suggestions"></div><br><br>
<button onclick="buscarClima()">Buscar Clima</button>

<div id="resultado"></div>

<script>
let cidades = [];

fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
  .then(res => res.json())
  .then(data => {
    cidades = data.map(c => c.nome);
  });

const input = document.getElementById('cidade');
const suggestions = document.getElementById('suggestions');

input.addEventListener('input', () => {
  const texto = input.value.toLowerCase();
  suggestions.innerHTML = '';

  if (!texto) return;

  const filtradas = cidades.filter(cidade => cidade.toLowerCase().includes(texto));

  filtradas.slice(0, 8).forEach(cidade => {
    const div = document.createElement('div');
    div.textContent = cidade;
    div.onclick = () => {
      input.value = cidade;
      suggestions.innerHTML = '';
    };
    suggestions.appendChild(div);
  });
});

document.addEventListener('click', e => {
  if (e.target !== input) {
    suggestions.innerHTML = '';
  }
});

function buscarClima() {
  const cidade = input.value;
  if (!cidade) {
    alert('Digite uma cidade válida!');
    return;
  }

  fetch('/clima/' + encodeURIComponent(cidade))
    .then(res => res.json())
    .then(data => {
      if (data.erro) {
        document.getElementById('resultado').innerHTML = '<p>' + data.erro + '</p>';
      } else {
        document.getElementById('resultado').innerHTML = 
          '<h3>Clima em ' + data.cidade + ', ' + data.pais + '</h3>' +
          '<p>🌡️ Temperatura: ' + data.temperatura + '</p>' +
          '<p>📜 Descrição: ' + data.descricao + '</p>' +
          '<p>🤗 Sensação Térmica: ' + data.sensacao + '</p>' +
          '<p>💧 Umidade: ' + data.umidade + '</p>' +
          '<p>🌬️ Vento: ' + data.vento + '</p>';
      }
    });
}
</script>

</body>
</html>`);
});

// Rota da API que retorna o clima
app.get('/clima/:cidade', async (req, res) => {
  const cidade = req.params.cidade;
  const apiKey = process.env.API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&lang=pt_br&units=metric`;

  try {
    const resposta = await axios.get(url);
    const dados = resposta.data;

    const resultado = {
      cidade: dados.name,
      pais: dados.sys.country,
      temperatura: dados.main.temp + ' °C',
      descricao: dados.weather[0].description,
      sensacao: dados.main.feels_like + ' °C',
      umidade: dados.main.humidity + '%',
      vento: dados.wind.speed + ' m/s',
    };

    res.json(resultado);
  } catch (erro) {
    res.status(500).json({ erro: 'Cidade não encontrada ou erro na API.' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
