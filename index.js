const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');
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

// middleware de autorização do token
const validateToken = (req, res, next) => {
  const { authorization } = req.headers;

  if (authorization === undefined) return res.status(401).send({ message: 'Token não encontrado' });
  if (authorization.length < 16) return res.status(401).send({ message: 'Token inválido' });

  next();
};

app.get('/talker/search', validateToken, (req, res) => {
  const { q } = req.query;
  console.log(req.query);

  const filteredTalkers = req.talker.filter((t) => t.name.includes(q));

  if (filteredTalkers.length === 0) {
    return res.status(200).send(req.talker);
  }

  res.status(200).send(filteredTalkers);
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
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).send({ message: 'O campo "email" é obrigatório' });
  if (!email.includes('@')) {
    return res.status(400).send({
      message: 'O "email" deve ter o formato "email@email.com"',
    });
  }
  if (!password) return res.status(400).send({ message: 'O campo "password" é obrigatório' });
  if (password.length < 6) {
    return res.status(400).send({
      message: 'O "password" deve ter pelo menos 6 caracteres',
    });
  }
  crypto.randomBytes(8, (_err, buffer) => { // módulo retirado do stack overflow
    const token = buffer.toString('hex');
    res.status(200).send({ token });
  });
});

// middleware de validação das informações do palestrante
const validateTalker = (req, res, next) => {
  const { name, age } = req.body;

  if (!name) return res.status(400).send({ message: 'O campo "name" é obrigatório' });
  if (name.length < 3) {
    return res.status(400).send({
      message: 'O "name" deve ter pelo menos 3 caracteres',
    });
  }

  if (!age) return res.status(400).send({ message: 'O campo "age" é obrigatório' });
  if (+age < 18) {
    return res.status(400).send({
      message: 'A pessoa palestrante deve ser maior de idade',
    });
  }

  next();
};

// middleware que lida com a validação da palestra
const validateTalk = (req, res, next) => {
  const { talk } = req.body;

  if (!talk || !talk.watchedAt || talk.rate === undefined) {
    return res.status(400).send({
      message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios',
    });
  }

  next();
};

// middleware que valida data e avaliação
const validateTalkInfo = (req, res, next) => {
  const { rate, watchedAt } = req.body.talk;

  if (parseInt(rate, 10) < 1 || parseInt(rate, 10) > 5) {
    return res.status(400).send({
      message: 'O campo "rate" deve ser um inteiro de 1 à 5',
    });
  }
  const date = watchedAt.split('/');

  if (date.length !== 3) {
    console.log('entrou na condicional');
    return res.status(400).send({
      message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
    });
  }

  next();
};

app.post('/talker', validateToken, validateTalker, validateTalk, validateTalkInfo, (req, res) => {
  const newTalker = { ...req.body, id: req.talker.length + 1 };
  const newTalkers = [...req.talker, newTalker];

  fs.writeFile('talker.json', JSON.stringify(newTalkers))
    .then(() => {
      res.status(201).send(newTalker);
    });
});

app.put('/talker/:id', validateToken, validateTalker, validateTalk, validateTalkInfo,
  ((req, res) => {
    const { id } = req.params;

    const newTalker = req.body;
    newTalker.id = +id;
    const talkerFind = req.talker.find((t) => t.id === +id);

    const index = req.talker.indexOf(talkerFind);
    req.talker.splice(index, 1, newTalker);

    fs.writeFile('talker.json', JSON.stringify(req.talker))
      .then(() => {
        res.status(200).send(newTalker);
      });
  }));

app.delete('/talker/:id', validateToken, (req, res) => {
  const { id } = req.params;

  const talkerFind = req.talker.find((t) => t.id === +id);

  const index = req.talker.indexOf(talkerFind);

  req.talker.splice(index, 1);

  fs.writeFile('talker.json', JSON.stringify(req.talker))
    .then(() => {
      res.status(204).end();
    });
});

app.listen(PORT, () => {
  console.log('Online');
});
