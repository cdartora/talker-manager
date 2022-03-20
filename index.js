const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

// atribuição assíncrona dos palestrantes
let talkers; // undefined
fs.readFile('data.json', 'utf8')
  .then((data) => { talkers = JSON.parse(data); }) // com os valores de data
  .catch((error) => console.log(error.message));

const app = express(); // inicia o express
app.use(bodyParser.json()); // middleware para traduzir o body das requisições

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// requisito 1: retornar "status code 200" junto com o json de talkers
app.get('/talker', (_req, res) => {
  res.status(200).send(talkers);
});

// requisito 2: procurar palestrantes via rota dinâmica
app.get('/talker/:id', (req, res) => {
  const { id } = req.params; // busca o parâmetro da rota dinâmica

  const talker = talkers.find((t) => t.id === +id); // requisições sempre vem em string

  if (talker) {
    return res.status(200).send(talker); // retorna para terminar a callback
  }
  
  res.status(404).send({ message: 'Pessoa palestrante não encontrada' });
});

app.listen(PORT, () => {
  console.log('Online');
});
