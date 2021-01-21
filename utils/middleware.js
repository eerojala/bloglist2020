const logger = require('./logger')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    // given id does not match the format of a MongoDB id
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') { 
    return response.status(401).json({ error: 'invalidToken' })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  request.token = (authorization && authorization.toLowerCase().startsWith('bearer ')) 
    ? authorization.substring(7)
    : null

  next()
}

module.exports = {
  unknownEndpoint, 
  errorHandler,
  tokenExtractor
}