// require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const cors = require('cors');
const routes = require('./routes/users');
const routesMovie = require('./routes/movies');
const { createUser, login } = require('./controllers/users');
const { auth } = require('./middlewares/auth');
const { errorHandler } = require('./middlewares/error-handler');
const { validationCreateUser, validationLogin } = require('./utils/celebrate');
const { NotFoundError } = require('./errors/notfound-error');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();
app.use(cors());

const { PORT = 3001 } = process.env;

mongoose.connect('mongodb://127.0.0.1:27017/bitfilmsdb', {
  useNewUrlParser: true,
  autoCreate: true,
  autoIndex: true,
});

app.use(bodyParser.json());

app.use(requestLogger);

app.post('/signup', validationCreateUser, createUser);
app.post('/signin', validationLogin, login);
app.use(auth);
app.use('/users', routes);
app.use('/movies', routesMovie);
app.use('*', (req, res, next) => {
  next(new NotFoundError('Not found'));
});

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT);
