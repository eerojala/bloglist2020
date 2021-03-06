const { TestScheduler } = require('jest')
const listHelper = require('../utils/list_helpers')


const blogs = [ 
  { 
    _id: "5a422a851b54a676234d17f7", 
    title: "React patterns", 
    author: "Michael Chan", 
    url: "https://reactpatterns.com/", 
    likes: 7, __v: 0 
  }, 
  { 
    _id: "5a422aa71b54a676234d17f8", 
    title: "Go To Statement Considered Harmful", 
    author: "Edsger W. Dijkstra", 
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html", 
    likes: 5, __v: 0 
  }, 
  { 
    _id: "5a422b3a1b54a676234d17f9", 
    title: "Canonical string reduction", 
    author: "Edsger W. Dijkstra", 
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html", 
    likes: 12, __v: 0 
  }, 
  { 
    _id: "5a422b891b54a676234d17fa", 
    title: "First class tests", 
    author: "Robert C. Martin", 
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll", 
    likes: 10, 
    __v: 0 
  }, 
  { 
    _id: "5a422ba71b54a676234d17fb", 
    title: "TDD harms architecture", 
    author: "Robert C. Martin", 
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html", 
    likes: 0, 
    __v: 0 
  }, 
  { 
    _id: "5a422bc61b54a676234d17fc", 
    title: "Type wars", 
    author: "Robert C. Martin", 
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html", 
    likes: 2, 
    __v: 0 
  }
]

test('dummy returns one', () => {
  const emptyBlogs = []

  const result = listHelper.dummy(emptyBlogs)
  expect(result).toBe(1)
})

describe('totalLikes', () => {
  test('returns', () => {
    const emptyBlogs = []  

    expect(listHelper.totalLikes(emptyBlogs)).toBe(0)
  })

  test('of a single blog is the likes of the blog', () => {
    const singleBlog = [{ likes: 2 }]

    expect(listHelper.totalLikes(singleBlog)).toBe(2)
  })

  test('of a list of blogs is the sum of of the likes of its entries', () => {
    expect(listHelper.totalLikes(blogs)).toBe(36)
  })
})

describe('favouriteBlog', () => {
  test('of an empty list is null', () => {
    const emptyBlogs = []

    expect(listHelper.favouriteBlog(emptyBlogs)).toBeNull()
  })

  test('of a list with one blog is the blog itself', () => {
    const singleBlog = [{ likes: 3 }]

    expect(listHelper.favouriteBlog(singleBlog)).toEqual(singleBlog[0])
  })

  test('is the blog with most likes in a list where there is one blog with undisputedly most likes', () => {
    expect(listHelper.favouriteBlog(blogs)).toEqual(blogs[2])
  })

  test('is the blog that comes up first in a list where the highest like amount is shared by multiple blogs', () => {
    const blogs2 = [ 
      { 
        title: "title1", likes: 1 
      },
      {
        title: "title2", likes: 10
      },
      {
        title: "title3", likes: 10
      } 
    ]

    expect(listHelper.favouriteBlog(blogs2)).toEqual(blogs2[1])
  })
})

describe('mostBlogs', () => {
  test('returns null with an empty list', () => {
    const emptyBlogs = []

    expect(listHelper.mostBlogs(emptyBlogs)).toBeNull()
  })

  test('returns the only author in a list with a single blog', () => {
    const singleBlog = [{ author: 'Eero Ojala' }]

    expect(listHelper.mostBlogs(singleBlog)).toEqual({ author: 'Eero Ojala', blogs: 1 })
  })

  test('returns the author with the most blogs in a list of blogs', () => {
    expect(listHelper.mostBlogs(blogs)).toEqual({ author: "Robert C. Martin", blogs: 3 })
  })

  test('returns the author which is prior in the list when the highest blog amount is shared by multiple authors', () => {
    const blogs2 = [ 
      { author: 'author1' }, { author: 'author2' }, { author: 'author2' } , { author: 'author3' }, { author: 'author3' }   
    ]

    expect(listHelper.mostBlogs(blogs2)).toEqual({ author: 'author2', blogs: 2 })
  })
})