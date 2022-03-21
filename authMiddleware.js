const authMiddleware = (req, res, next) => {
  const { email, password } = req.headers;

  if (!email) return res.status(400).send({ message: 'O campo "email" é obrigatório' });
  if (email.match(/^[^@]+@[^@]{2,}\.[^@]{2,}$/)) {
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

  res.status(200).send({ token: '7mqaVRXJSp886CGr' });
};

module.exports = authMiddleware;