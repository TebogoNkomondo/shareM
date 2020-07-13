const bycrypt = require('bcryptjs')
const validator = require('validator')
const usersCollection = require('../db').db().collection('users')
const User = function (data) {
  this.data = data
  this.errors = []
}

User.prototype.cleanUp = function () {
  if (typeof (this.data.username) !== 'string') { this.data.username = '' }
  if (typeof (this.data.email) !== 'string') { this.data.email = '' }
  if (typeof (this.data.password) !== 'string') { this.data.password = '' }

  // get rid of invalid properties
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password
  }
}

User.prototype.validate = function () {
  if (this.data.username === '') { this.errors.push('You must provide a username') }
  if (this.data.username !== '' && !validator.isAlphanumeric(this.data.username)) { this.errors.push('Username can only contain letters and numbers') }
  if (!validator.isEmail(this.data.email)) { this.errors.push('You must provide a valid email address') }
  if (this.data.password === '') { this.errors.push('You must provide a password') }
  if (this.data.password.length > 0 && this.data.password < 12) { this.errors.push('password must be at least 12 characters') }
  if (this.data.password.length > 50) { this.errors.push('Password cannot exceed 50 characters') }
  if (this.data.username.length < 3) { this.errors.push('Username must be at least characters') }
  if (this.data.username.length > 30) { this.errors.push('Username cannot exceed 30 characters') }
}

User.prototype.login = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    usersCollection.findOne({ username: this.data.username }).then((attemptedUser) => {
      if (attemptedUser && bycrypt.compareSync(this.data.password, attemptedUser.password)) {
        resolve('successful login')
      } else {
        reject('invalid username/password')
      }
    }).catch(() => {
      reject('Please try again later')
    })
  })
}

User.prototype.register = function () {
// validate user data
  this.cleanUp()
  this.validate()
  // only if there are no validation errors, then save user data into DB
  if (!this.errors.length) {
    const salt = bycrypt.genSaltSync(10)
    this.data.password = bycrypt.hashSync(this.data.password, salt)
    usersCollection.insertOne(this.data)
  }
}

module.exports = User
