const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const SALT_ROUNDS = 10;
const { JWT_SECRET = 'some-secret-key' } = process.env;
const { ConflictnameError } = require('../errors/conflictname-error');
const { ValidationError } = require('../errors/validation-error');
const { UnauthorizedError } = require('../errors/unauthorized-error');
const { NotFoundError } = require('../errors/notfound-error');

// /signup
const createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => {
      User.create({
        name,
        email,
        password: hash,
      })
        .then((data) => {
          const userResponse = data.toObject();
          delete userResponse.password;
          res.status(201).send(userResponse);
        })
        .catch((err) => {
          if (err.code === 11000) {
            next(new ConflictnameError('Conflict'));
          } else if (err.name === 'ValidationError') {
            next(new ValidationError('Bad request'));
            return;
          }
          next(err);
        });
    });
};

// /signin
const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Unauthorized'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return next(new UnauthorizedError('Unauthorized'));
          }
          const token = jwt.sign({ _id: user._id }, process.env.NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', { expiresIn: '7d' });
          return res.status(200).send({ token });
        });
    })
    .catch((err) => {
      if (err.message === 'NoValidId') {
        next(new NotFoundError('User not found'));
      } else if (err.name === 'ValidationError') {
        next(new ValidationError('Bad request'));
        return;
      }
      next(err);
    });
};

// /me возвращает информацию о пользователе
const currentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail(new Error('NoValidId'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'NoValidId') {
        next(new NotFoundError('User not found'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new ValidationError('Bad request'));
        return;
      }
      next(err);
    });
};

// /me  обновляет информацию о пользователе
const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: 'true', runValidators: true })
    .orFail(new Error('NoValidId'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'NoValidId') {
        next(new NotFoundError('User not found'));
      } else if (err.name === 'ValidationError') {
        next(new ValidationError('Bad request'));
        return;
      }
      next(err);
    });
};

module.exports = {
  createUser,
  updateUser,
  login,
  currentUser,
};
