const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs.map(blog => blog.toJSON()))
})
  
blogsRouter.post('', async (request, response, next) => {
  const body = request.body

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
  
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes ? body.likes : 0,
      user: user._id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)

    await user.save()

    response.status(201).json(savedBlog.toJSON())
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
  
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = await Blog.findById(request.params.id)
    const user = await User.findById(decodedToken.id)

    if (blog.user.toString() === user._id.toString()) {
      await Blog.findByIdAndRemove(request.params.id)

      response.status(204).end()
    } else {
      return response.status(401).json({ error: 'this blog does not belong to the currently logged in user' })
    }
    
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  try {
    const user = await User.findById(body.user)
    
    if (!user) {
      return response.status(400).json({ error: 'No user found matching id' })
    }

    blog.user = user._id // note: the user id cannot be a string, it needs to be a mongoose id object

    // new: true returns the updated blog
    // new: false returns the original blog before the updates were applied (this is the default behaviour)
    const updatedBlog = 
      await Blog
        .findByIdAndUpdate(request.params.id, blog, { new: true })
        .populate('user', { username: 1, name: 1 })
    
    response.json(updatedBlog.toJSON())
  } catch (exception) {
    next(exception)
  } 
})

module.exports = blogsRouter