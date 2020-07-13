const User = require('../models/User')

exports.login = (req, res) => {
  const user = new User(req.body)
  user.login().then((result) => {
    req.session.user = { username: user.data.username }
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
    req.session.user = { username: user.data.username }
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
    res.render('home-dashboard', { username: req.session.user.username })
  } else {
    res.render('home-guest', { messages: req.flash('messages'), regErrors: req.flash('regErrors') })
  }
}
