const express = require('express');
const bodyParser = require('body-parser');
// const fs = require('fs').promises;
const jsonReader = require('./jsonReader');

const app = express(); // inicia o express
app.use(bodyParser.json()); // middleware para traduzir o body das requisições
app.use(jsonReader); // middleware que faz a leitura do json

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// requisito 1: retornar "status code 200" junto com o json de talkers
app.get('/talker', (req, res) => {
  res.status(200).send(req.talker);
});

// requisito 2: procurar palestrantes via rota dinâmica
app.get('/talker/:id', (req, res) => {
  const { id } = req.params; // busca o parâmetro da rota dinâmica
  const { talker } = req;

  const findTalker = talker.find((t) => t.id === +id); // requisições sempre vem em string

  if (findTalker) {
    return res.status(200).send(findTalker); // retorna para terminar a callback
  }
  
  res.status(404).send({ message: 'Pessoa palestrante não encontrada' });
});

// requisito 3: gerar um token que será passado nas demais requisições
// e confirmar se as credenciais de login estão corretas
// app.get()

app.listen(PORT, () => {
  console.log('Online');
});
