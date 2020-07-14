const User = require('../models/User')

exports.mustBeLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    req.flash('messages', 'You must be logged in to create posts')
    req.session.save(() => {
      res.redirect('/')
    })
  }
}

exports.login = (req, res) => {
  const user = new User(req.body)
  user.login().then((result) => {
    req.session.user = { username: user.data.username, avatar: user.avatar }
    req.session.save(() => {
      res.redirect('/')
    })
  }).catch((e) => {
    req.flash('messages', e)
    req.session.save(function () {
      res.redirect('/')
    })
  })
}

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
}

exports.register = (req, res) => {
  const user = new User(req.body)
  user.register().then(() => {
    req.session.user = { username: user.data.username, avatar: user.avatar }
    req.session.save(() => {
      res.redirect('/')
    })
  }).catch((regErrors) => {
    regErrors.forEach((error) => {
      req.flash('regErrors', error)
    })
    req.session.save(() => {
      res.redirect('/')
    })
  })
}

exports.home = (req, res) => {
  if (req.session.user) {
    res.render('home-dashboard')
  } else {
    res.render('home-guest', { messages: req.flash('messages'), regErrors: req.flash('regErrors') })
  }
}
