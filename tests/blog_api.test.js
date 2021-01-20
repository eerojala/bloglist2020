const { TestScheduler } = require('jest')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app) // app.js contains no code for actually starting the application, but supertest is able to start it in an internal port it uses
const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: "title1",
    author: "author1",
    url: "url1",
    likes: 0
  },
  {
    title: "title2",
    author: "author2",
    url: "url2",
    likes: 5
  },
  {
    title: "title3",
    author: "author3",
    url: "url3",
    likes: 10
  },
]

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

afterAll(() => {
  mongoose.connection.close() // remember to close the database connection after all tests
  // NOTE: if we run individual tests which do not utilize the database, the mongoose connection may remain open (because apparently in this case jest will not run the code in afterAll())
})