const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para clima atual
app.get('/clima/:cidade', async (req, res) => {
  try {
    if (!process.env.API_KEY) {
      throw new Error('Chave API não configurada');
    }

    const resposta = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(req.params.cidade)}&appid=${process.env.API_KEY}&lang=pt_br&units=metric`
    );
    
    const dados = resposta.data;
    res.json({
      cidade: dados.name,
      pais: dados.sys.country,
      temperatura: `${Math.round(dados.main.temp)} °C`,
      descricao: dados.weather[0].description,
      sensacao: `${Math.round(dados.main.feels_like)} °C`,
      umidade: `${dados.main.humidity}%`,
      vento: `${(dados.wind.speed * 3.6).toFixed(1)} km/h`, // Convertendo m/s para km/h
      icon: dados.weather[0].icon
    });
  } catch (erro) {
    console.error('Erro na rota /clima:', erro.message);
    res.status(500).json({ 
      erro: erro.response?.data?.message || 'Cidade não encontrada ou erro na API' 
    });
  }
});

// Rota para previsão horária
app.get('/clima-horario/:cidade', async (req, res) => {
  try {
    if (!process.env.API_KEY) {
      throw new Error('Chave API não configurada');
    }

    const resposta = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(req.params.cidade)}&appid=${process.env.API_KEY}&lang=pt_br&units=metric&cnt=8`
    );
    
    const previsoes = resposta.data.list.map(item => ({
      hora: new Date(item.dt * 1000).getHours() + ':00',
      temp: Math.round(item.main.temp),
      icon: item.weather[0].icon,
      descricao: item.weather[0].description
    }));
    
    res.json(previsoes);
  } catch (erro) {
    console.error('Erro na rota /clima-horario:', erro.message);
    res.status(500).json({ 
      erro: erro.response?.data?.message || 'Erro ao obter previsão horária' 
    });
  }
});

// Rota de fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Exporte o app para o Vercel
module.exports = app;

// Inicia o servidor apenas localmente
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}
