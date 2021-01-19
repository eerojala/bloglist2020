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

module.exports = { dummy, totalLikes, favouriteBlog }