require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const cookies = require('cookie-parser');
const helmet = require('helmet');

const router = require('./routes');
const errorHandler = require('./widdlewares/error');
const { requestLogger, errorLogger } = require('./widdlewares/logger');

// const bodyParser = require('body-parser');
const app = express();

// подключаемся к серверу mongo

const { NODE_ENV, PORT = 3000, DATA_BASE } = process.env;
app.use(helmet());

// for local host
// app.use(cors());

// for server
app.use(cors({
  origin: [
    'https://dip.nomoredomainsrocks.ru',
    'http://dip.nomoredomainsrocks.ru',
    'http://localhost:3000',
  ],
  credentials: true,
}));

mongoose.connect(NODE_ENV === 'production' ? DATA_BASE : 'mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(express.json());
app.use(cookies());

app.use(requestLogger); // подключаем логгер запросов

app.use(router);

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors()); // for celebrate

app.use(errorHandler);

app.listen(PORT, () => {
  console.log('listen port 3000');
});
