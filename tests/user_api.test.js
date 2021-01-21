const mongoose = require('mongoose')
const supertest = require('supertest')
const bcryptjs = require('bcryptjs')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app) // app.js contains no code for actually starting the application, but supertest is able to start it in an internal port it uses

const User = require('../models/user')

beforeEach(async () => {
  // await User.deleteMany({}) we do not use this because we want to keep user3 and user4 in the the test database for testing the blog api

  const passwordHash1 = await bcryptjs.hash('salasana', 10)
  const passwordHash2 = await bcryptjs.hash('password', 10)
  // const passwordHash3 = await bcryptjs.hash('password1', 10)
  // const passwordHash4 = await bcryptjs.hash('password2', 10)

  const user1 = new User({ username: 'eerojala', name: 'Eero Ojala', passwordHash: passwordHash1 })
  const user2 = new User({ username: 'eeeeeee', name: 'Matti Meikäläinen', passwordHash: passwordHash2 })
  // const user3 = new User({ username: 'user1', name: 'User 1', passwordHash: passwordHash3 })
  // const user4 = new User({ username: 'user2', name: 'User 2', passwordHash: passwordHash4 })

  await User.remove({ username: 'eerojala' })
  await User.remove({ username: 'eeeeeee' })
  await User.remove({ username: 'newusr' })

  await user1.save()
  await user2.save()
  // await user3.save()
  // await user4.save()
})

describe('POST /api/users', () => {
  test('a valid user can be added', async () => {
    const usersBefore = await helper.usersInDb()

    const newUser = {
      username: 'newusr',
      name: 'John Doe',
      password: 'secret'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await helper.usersInDb()

    expect(usersAfter.length).toBe(usersBefore.length + 1)

    const usernames = usersAfter.map(u => u.username)
    const names = usersAfter.map(u => u.name)

    expect(usernames).toContain(newUser.username)
    expect(names).toContain(newUser.name)
  })

  test('a user with non-unique username is not added', async () => {
    const usersBefore = await helper.usersInDb()

    const newUser = {
      username: 'eerojala',
      name: 'Eero Meikäläinen',
      password: 'salaisuus'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('User validation failed: username: Error, expected `username` to be unique. Value: `eerojala')

    const usersAfter = await helper.usersInDb()

    expect(usersAfter).toEqual(usersBefore)
  })

  test('a user with a below 3 character long username is not added', async () => {
    const usersBefore = await helper.usersInDb()
  
    const newUser = {
      username: 'un',
      name: 'Matti Ojala',
      password: 'passwerd'
    }
  
    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    expect(response.body.error).toContain('User validation failed: username: Path `username` (`un`) is shorter than the minimum allowed length (3).')
  
    const usersAfter = await helper.usersInDb()
  
    expect(usersAfter).toEqual(usersBefore)
  })
  
  test('a user with a below 3 character long password is not added', async () => {
    const usersBefore = await helper.usersInDb()

    const newUser = {
      username: 'new user',
      name: 'Eero Doe',
      password: 'pw'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('No password given or the given password is too short (below 3 characters).')

    const usersAfter = await helper.usersInDb()

    expect(usersAfter).toEqual(usersBefore)
  })
})

afterAll(() => {
  mongoose.connection.close() // remember to close the database connection after all tests
  // NOTE: if we run individual tests which do not utilize the database, the mongoose connection may remain open (because apparently in this case jest will not run the code in afterAll())
})