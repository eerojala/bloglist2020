const bcryptjs = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response, next) => {
  try {
    const users = await User.find({})

    response.json(users.map(u => u.toJSON()))
  } catch (exception) {
    next(exception)
  }
})

usersRouter.post('/', async (request, response, next) => {
  const body = request.body
  const password = body.password

  if (!password || password.length < 3) {
    next({ name: 'ValidationError', message: 'No password given or the given password is too short (below 3 characters).' })
  }

  try {
    const saltRounds = 10
    const passwordHash = await bcryptjs.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    })

    const savedUser = await user.save()

    response.json(savedUser)
  } catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter