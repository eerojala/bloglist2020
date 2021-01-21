const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app) // app.js contains no code for actually starting the application, but supertest is able to start it in an internal port it uses

const Blog = require('../models/blog')

const initialBlogs = helper.initialBlogs

beforeEach(async () => {
  await Blog.deleteMany({})

  // // This does not work, since the awaits are considered to be in a separate function than beforeEach, so beforeEach will not wait for all the awaits
  // initialBlogs.forEach(async (blog) => {
  //   let blogObject = new Blog(blog)

  //   await blogObject.save()
  // })

  // // This works, but Promise.all runs all the inputed promises simultaneously. This can be a problem if you want to run the promises in a specifed order
  // const blogObjects = initialBlogs.map(blog => new Blog(blog))
  // const promiseArray = blogObjets.map(blog => blog.save())
  // await Promise.all(promiseArray)

  // // If you want to save in a specific order, then this works (since it is considered to be inside the beforeEach function instead of a separate one)
  // for (let blog of initialBlogs) {
  //   let blogObject = new Blog(blog)

  //   await blogObject.save()
  // }

  // This is the simplest way to save the initial blogs
  await Blog.insertMany(initialBlogs)
})

describe('GET /api/blogs', () => {
  test('retuns blogs as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('returns all blogs', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(initialBlogs.length)
  })
  
  test('returns blog that have field id instead of _id', async () => {
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
})

describe('PUT /api/blogs/:id', () => {
  test('updates the blog matching the id with the given fields', async () => {
    const blogsBefore = await helper.blogsInDb()

    const blogToUpdate = blogsBefore[1]

    const updates = {
      title: 'Updated Title',
      author: 'Updated Author',
      url: 'updated.url',
      likes: 100
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updates)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await helper.blogsInDb()

    expect(blogsAfter).not.toEqual(blogsBefore)
    expect(blogsAfter.length).toBe(blogsBefore.length)

    const updatedBlog = await helper.getBlogFromDb(blogToUpdate.id)

    expect(updatedBlog).not.toEqual(blogToUpdate)
    expect(updatedBlog.title).toBe(updates.title)
    expect(updatedBlog.author).toBe(updates.author)
    expect(updatedBlog.url).toBe(updates.url)
    expect(updatedBlog.likes).toBe(updates.likes)
  })
})

describe('When the user is logged in', async () => {
  let token

  beforeAll(async () => {
    const user = { username: 'user1', password: 'password1' }

    const response = await api
      .post('/api/login')
      .send(user)

    token = response.body.token
  })

  describe('POST /api/blogs', () => {
    test('a valid blog can be added', async () => {
      const newBlog = {
        title: 'newTitle',
        author: 'newAuthor',
        url: 'newUrl',
        likes: 7
      }
    
      await api
        .post('/api/blogs')
        .set('Authorization', `bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
      const blogsAtEnd = await helper.blogsInDb()
    
      const blogsWithoutIds = helper.removeIds(blogsAtEnd)
      const blogsWithoutIdsAndUsers = helper.removeUsers(blogsWithoutIds)
  
      expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)
      expect(blogsWithoutIdsAndUsers).toContainEqual(newBlog)
    })
    
    test('if no likes are provided then a new blog is created with likes: 0', async () => {
      const newBlog = {
        title: 'no likes',
        author: 'author no one likes',
        url: 'url no one liked'
      }
    
      const response = await api
        .post('/api/blogs')
        .set('Authorization', `bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
      const savedNote = await helper.getBlogFromDb(response.body.id)
    
      expect(savedNote).toBeDefined
      expect(savedNote.likes).toBeDefined
      expect(savedNote.likes).toBe(0)
    })
    
    test('if no tile is provided then no new blog is created and the server returns status code 400', async () => {
      const newBlog = {
        author: 'No Title',
        url: 'notitle.com'
      }
    
      const blogsBefore = await helper.blogsInDb();
    
      const response = await api
        .post('/api/blogs')
        .set('Authorization', `bearer ${token}`)
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    
      expect(response.body.error).toBe('Blog validation failed: title: Path `title` is required.')  
      
      const blogsAfter = await helper.blogsInDb();
    
      expect(blogsAfter).toEqual(blogsBefore)
    })
    
    test('if no url is provided then no new blog is created and the server returns status code 400', async () => {
      const newBlog = {
        title: 'No URL!',
        author: 'No Url'
      }
    
      const blogsBefore = await helper.blogsInDb();
    
      const response = await api
        .post('/api/blogs')
        .set('Authorization', `bearer ${token}`)
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    
        expect(response.body.error).toBe('Blog validation failed: url: Path `url` is required.')
    
        const blogsAfter = await helper.blogsInDb()
    
        expect(blogsAfter).toEqual(blogsBefore)
    })
  })

  describe('DELETE /api/blogs/:id', () => {
    test('removes the blog matching the id from the database', async () => {
      const blogToRemove = new Blog({
        title: 'Soon this blog will not exist anymore',
        author: 'Ghost',
        url: 'www.com',
        likes: 1,
        user: '6009af7f24aa9a2c18628c35' // id of user1 (the user who is logged in during these tests)
      })

      await blogToRemove.save()

      const blogsBefore = await helper.blogsInDb()
  
      await api
        .delete(`/api/blogs/${blogToRemove.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(204)
  
      const blogsAfter = await helper.blogsInDb()
  
      expect(blogsAfter).not.toEqual(blogsBefore)
      expect(blogsAfter.length).toBe(blogsBefore.length - 1)
      expect(blogsAfter).not.toContainEqual(blogToRemove)
    })
  })
})

describe('When the user is NOT logged in', () => {
  describe('POST /api/blog/:id', () => {
    test('a valid blog cannot be added', async () => {
      const blogsBefore = await helper.blogsInDb()

      const newBlog = {
        title: 'newTitle',
        author: 'newAuthor',
        url: 'newUrl',
        likes: 7
      }
    
      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      expect(response.body.error).toBe('invalid token')
    
      const blogsAfter = await helper.blogsInDb()

      expect(blogsBefore).toEqual(blogsAfter)
    })
  })
})

afterAll(() => {
  mongoose.connection.close() // remember to close the database connection after all tests
  // NOTE: if we run individual tests which do not utilize the database, the mongoose connection may remain open (because apparently in this case jest will not run the code in afterAll())
})