const testingRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

// router for resetting the database for testing
testingRouter.post('/reset', async (request, response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

module.exports = testingRouter