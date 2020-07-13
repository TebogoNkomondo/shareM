const User = require('../models/User')

exports.login = (req, res) => {
  const user = new User(req.body)
  user.login((result) => {
    res.send(result)
  })
}

exports.logout = () => {

}

exports.register = (req, res) => {
  const user = new User(req.body)
  user.register()
  if (user.errors.length > 0) {
    res.send(user.errors)
  } else {
    res.send('congrats')
  }
}

exports.home = (req, res) => {
  res.render('home-guest')
}
