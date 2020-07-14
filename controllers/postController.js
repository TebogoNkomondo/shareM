const Post = require('../models/Post')

exports.viewCreateScreen = (req, res) => {
  res.render('create-post')
}

exports.create = (req, res) => {
  const post = new Post(req.body)
  post.create().then(function () {
    res.send('new post created')
  }).catch(function (errors) {
    res.send(errors)
  })
}
