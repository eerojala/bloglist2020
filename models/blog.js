const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true
  },
  author: String,
  url: { 
    type:String,
    required: true
  },
  likes: Number
})

blogSchema.set('toJSON', { // this is done so that the id is returned in field 'id' instead of '_id' and field __v is not returned at all
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)