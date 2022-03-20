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

app.get('/talker', (_req, res) => {
  res.status(200).send(talkers);
});

app.listen(PORT, () => {
  console.log('Online');
});
