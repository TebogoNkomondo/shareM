const postsCollection = require('../db').db().collection('posts')
const ObjectID = require('mongodb').ObjectID
const user = require('./User')
const User = require('./User')

const Post = function (data, userId) {
  this.data = data
  this.userId = userId
  this.errors = []
}

Post.prototype.cleanUp = function () {
  if (typeof (this.data.title) !== 'string') { this.data.title = '' }
  if (typeof (this.data.body) !== 'string') { this.data.body = '' }
  if (this.data.title === '') { this.errors.push('You must provide a title') }
  if (this.data.body === '') { this.errors.push('You must provide post content') }

  // get rid of invalid properties (such as html elements)
  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    createdDate: new Date(),
    author: ObjectID(this.userId)
  }
}

Post.prototype.validate = function () {

}

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      // save post into db if there are no errors
      postsCollection.insertOne(this.data).then(() => {
        resolve()
      }).catch(() => {
        this.errors.push('Sorry, please try again later')
        reject(this.errors)
      })
    } else {
      reject(this.errors)
    }
  })
}

Post.reusablePostQuery = (uniqueOperations) => {
  return new Promise(async (resolve, reject) => {
    const aggOperations = uniqueOperations.concat([
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorDocument' } },
      {
        $project: {
          title: 1,
          body: 1,
          createdDate: 1,
          author: { $arrayElemAt: ['$authorDocument', 0] }
        }
      }
    ])

    const posts = await postsCollection.aggregate(aggOperations).toArray()
    // clean up author properties in each post object
    posts.map((post) => {
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      }
      return post
    })
    resolve(posts)
  })
}

Post.findSingleById = (id) => {
  return new Promise(async (resolve, reject) => {
    if (typeof (id) !== 'string' || !ObjectID.isValid(id)) {
      reject()
      return
    }

    const posts = await Post.reusablePostQuery([
      { $match: { _id: ObjectID(id) } }
    ])

    if (posts.length) {
      resolve(posts[0])
    } else {
      reject()
    }
  })
}

Post.findByAuthorID = (authorID) => {
  return Post.reusablePostQuery([
    { $match: { author: authorID } },
    { $sort: { createdDate: -1 } }
  ])
}

module.exports = Post
