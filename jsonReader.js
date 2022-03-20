const fs = require('fs').promises;

// atribuição assíncrona dos palestrantes
const jsonReader = async (req, _res, next) => {
  try {
    const data = await fs.readFile('talker.json', 'utf8');
    req.talker = JSON.parse(data);
    
    next();
  } catch (error) {
    console.log(error.messages);
  }
};

module.exports = jsonReader;