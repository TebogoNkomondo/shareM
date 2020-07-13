const User = require('../models/User')

exports.login = (req, res) => {
  const user = new User(req.body)
  user.login().then((result) => {
    res.send(result)
  }).catch((e) => {
    res.send(e)
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
