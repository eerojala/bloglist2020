const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favouriteBlog = (blogs) => {
  if (!blogs || blogs.length < 1) {
    return null
  } else {
    return blogs.reduce((max, blog) => (blog.likes > max.likes ? blog : max), blogs[0])
  }
}

const mostBlogs = (blogs) => {
  if (!blogs || blogs.length < 1) {
    return null
  }

  let authors = new Map()
  let authorWithMostBlogs = blogs[0].author
  let mostBlogAmount = 1

  blogs.forEach(blog => {
    const author = blog.author
    const authorsBlogAmount = authors.get(author)

    if (authorsBlogAmount) {
      const newBlogAmount = authorsBlogAmount + 1

      if (newBlogAmount > mostBlogAmount) {
        authorWithMostBlogs = author
        mostBlogAmount = newBlogAmount
      }

      authors = authors.set(author, newBlogAmount)
    } else {
      authors = authors.set(author, 1)
    }
  })

  return { author: authorWithMostBlogs, blogs: mostBlogAmount }
}

module.exports = { dummy, totalLikes, favouriteBlog, mostBlogs }