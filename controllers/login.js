const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response, next) => {
  const body = request.body

  try {
    const user = await User.findOne({ username: body.username })
    const passwordCorrect = user === null 
      ? false
      : await bcryptjs.compare(body.password, user.passwordHash) // password is not stored directly (instead a hash is saved), so we need to test if the given password returns the same hash

    if (!(user && passwordCorrect)) {
      return response.status(401).json({ // 401: Unauthorized
        error: 'Invalid username or password'
      })
    }
    
    const userForToken = {
      username: user.username,
      id: user._id
    }

    const token = jwt.sign(userForToken, process.env.SECRET) // create a token which contains the username and the user's id in a digitally signed format

    response
      .status(200)
      .send({ token, username: user.username, name: user.name })

  } catch (exception) {
    next(exception)
  }
})

module.exports = loginRouter