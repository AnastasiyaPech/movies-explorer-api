const Movie = require('../models/movie');

const { ValidationError } = require('../errors/validation-error');
const { ForbiddenError } = require('../errors/forbidden-error');
const { NotFoundError } = require('../errors/notfound-error');

// post /
const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => movie.populate('owner'))
    .then((movie) => {
      res.status(201).send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new ValidationError('Bad request'));
        return;
      }
      next(err);
    });
};

// get /
const findMovie = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.status(200).send(movies))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new ValidationError('Bad request'));
        return;
      }
      next(err);
    });
};

// /_id
const deleteMovieId = (req, res, next) => {
  const { _id } = req.params;
  Movie.findById(_id)
    .orFail(new Error('NoValidId'))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        next(new ForbiddenError('Bad request'));
        return;
      }
      Movie.findByIdAndRemove(_id)
        .then(() => {
          res.status(200).send({ message: 'Movie removed' });
        });
    })
    .catch((err) => {
      if (err.message === 'NoValidId') {
        next(new NotFoundError('Movie not found'));
        return;
      } if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new ValidationError('Bad request'));
        return;
      }
      next(err);
    });
};

module.exports = {
  createMovie,
  findMovie,
  deleteMovieId,
};
