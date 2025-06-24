// index.js (mantido igual)
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = 3000;

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para clima atual
app.get('/clima/:cidade', async (req, res) => {
  try {
    const resposta = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${req.params.cidade}&appid=${process.env.API_KEY}&lang=pt_br&units=metric`
    );
    
    const dados = resposta.data;
    res.json({
      cidade: dados.name,
      pais: dados.sys.country,
      temperatura: dados.main.temp + ' °C',
      descricao: dados.weather[0].description,
      sensacao: dados.main.feels_like + ' °C',
      umidade: dados.main.humidity + '%',
      vento: dados.wind.speed + ' m/s',
      icon: dados.weather[0].icon
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Cidade não encontrada ou erro na API.' });
  }
});

// Rota para previsão horária
app.get('/clima-horario/:cidade', async (req, res) => {
  try {
    const resposta = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${req.params.cidade}&appid=${process.env.API_KEY}&lang=pt_br&units=metric&cnt=8`
    );
    
    const previsoes = resposta.data.list.map(item => ({
      hora: new Date(item.dt * 1000).getHours() + ':00',
      temp: Math.round(item.main.temp),
      icon: item.weather[0].icon,
      descricao: item.weather[0].description
    }));
    
    res.json(previsoes);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao obter previsão horária' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});