const { TestScheduler } = require('jest')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app) // app.js contains no code for actually starting the application, but supertest is able to start it in an internal port it uses

const Blog = require('../models/blog')

const initialBlogs = helper.initialBlogs

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[2])
  await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(initialBlogs.length)
})

test('all returned blog have field id instead of _id', async () => {
  const response = await api.get('/api/blogs')

  const ids = response.body.map(b => b.id)
  const _ids = response.body.map(b => b._id)

  expect(ids).toHaveLength(3)
  expect(ids[0]).toBeDefined()
  expect(ids[1]).toBeDefined()
  expect(ids[2]).toBeDefined()

  expect(_ids).toHaveLength(3)
  expect(_ids[0]).toBeUndefined()
  expect(_ids[1]).toBeUndefined()
  expect(_ids[2]).toBeUndefined()
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'newTitle',
    author: 'newAuthor',
    url: 'newUrl',
    likes: 7
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()

  const blogsWithoutIds = helper.removeIds(blogsAtEnd)
  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)
  expect(blogsWithoutIds).toContainEqual(newBlog)
})

test('if no likes are provided then a new blog is created with likes: 0', async () => {
  const newBlog = {
    title: 'no likes',
    author: 'author no one likes',
    url: 'url no one liked'
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const savedNote = await helper.getBlogFromDb(response.body.id)

  expect(savedNote).toBeDefined
  expect(savedNote.likes).toBeDefined
  expect(savedNote.likes).toBe(0)
})

afterAll(() => {
  mongoose.connection.close() // remember to close the database connection after all tests
  // NOTE: if we run individual tests which do not utilize the database, the mongoose connection may remain open (because apparently in this case jest will not run the code in afterAll())
})