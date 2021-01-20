// library that loads environment variables from the file .env (NOTE: REMEMBER TO GITIGNORE IT)
// also remember to require dotenv before requiring models, so we can be sure that the database link can be read correctly
require('dotenv').config()

// these variables are read from the environment variables (either the file .env or from herokus settings)
let PORT = process.env.PORT // heroku has a PORT environment variable automatically
let MONGODB_URI = process.env.MONGODB_URI // NEVER save database credientals into code, must be set manually to heroku

if (process.env.NODE_eNV === 'test') { // If running in a test environment
  MONGODB_URI = process.env.TEST_MONGODB_URI // use the test database instead
}

module.exports = {
  MONGODB_URI,
  PORT
}