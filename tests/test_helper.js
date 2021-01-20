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

const blogsInDb = async () => {
  const blogs = await Blog.find({})

  return blogs.map(blog => blog.toJSON())
}

const removeIds = (objects) => {
  const copies = objects.map(o => {
    const copy = {...o} // create a new object with fields copied from 0
    delete copy.id // delete field id from the copy

    return copy 
  })

  // console.log(objects) // the original objects still have their ids
  // console.log(copies) // the copies do not

  // return an array with new objects copied from the original objects array except they do not have the field id (i.e. a deep copy)
  // NOTE: if the object has nested objects, they will not be deep copied but be referenced instead (so if the original nested object is modified, the copy's nested object will be modified as well)
  return copies 
}

module.exports = {
  initialBlogs, blogsInDb, removeIds
}