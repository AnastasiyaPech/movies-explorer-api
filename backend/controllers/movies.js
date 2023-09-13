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
  Movie.find({})
    // .populate(['owner', 'likes'])
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
  const { movieId } = req.params;
  Movie.findById(movieId)
    // .populate(['owner', 'likes'])
    .orFail(new Error('NoValidId'))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        next(new ForbiddenError('Bad request'));
        return;
      }
      Movie.findByIdAndRemove(movieId)
        .then(() => {
          res.status(200).send({ message: 'Movie removed' });
        });
    })
    .catch((err) => {
      if (err.message === 'NoValidId') {
        next(new NotFoundError('Movie not found'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
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
