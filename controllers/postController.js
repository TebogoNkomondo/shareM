const Post = require('../models/Post')

exports.viewCreateScreen = (req, res) => {
  res.render('create-post')
}

exports.create = (req, res) => {
  const post = new Post(req.body, req.session.user._id)
  post.create().then(function () {
    res.send('new post created')
  }).catch(function (errors) {
    res.send(errors)
  })
}

exports.viewSingle = async (req, res) => {
  try {
    const post = await Post.findSingleById(req.params.id)
    res.render('single-post-screen', { post: post })
  } catch {
    res.send('404')
  }
}
