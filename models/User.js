const bycrypt = require('bcryptjs')
const validator = require('validator')
const md5 = require('md5')
const usersCollection = require('../db').db().collection('users')
const User = function (data, getAvatar) {
  this.data = data
  this.errors = []
  if (getAvatar === undefined) { getAvatar = false }
  if (getAvatar) { this.getAvatar() }
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
  return new Promise(async (resolve, reject) => {
    if (this.data.username === '') { this.errors.push('You must provide a username') }
    if (this.data.username !== '' && !validator.isAlphanumeric(this.data.username)) { this.errors.push('Username can only contain letters and numbers') }
    if (!validator.isEmail(this.data.email)) { this.errors.push('You must provide a valid email address') }
    if (this.data.password === '') { this.errors.push('You must provide a password') }
    if (this.data.password.length > 0 && this.data.password < 12) { this.errors.push('password must be at least 12 characters') }
    if (this.data.password.length > 50) { this.errors.push('Password cannot exceed 50 characters') }
    if (this.data.password.length < 3) { this.errors.push('Password must be at least 3 characters') }
    if (this.data.username.length < 3) { this.errors.push('Username must be at least 3 characters') }
    if (this.data.username.length > 30) { this.errors.push('Username cannot exceed 30 characters') }

    // if username is valid, check if it's taken
    if (this.data.username.length > 3 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
      const userNameExists = await usersCollection.findOne({ username: this.data.username })
      if (userNameExists) { this.errors.push('Username is already taken') }
    }
    // if email is valid, check if it's taken
    if (validator.isEmail(this.data.email)) {
      const emailExists = await usersCollection.findOne({ email: this.data.email })
      if (emailExists) { this.errors.push('Email is already taken') }
    }
    resolve()
  })
}

User.prototype.login = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    usersCollection.findOne({ username: this.data.username }).then((attemptedUser) => {
      if (attemptedUser && bycrypt.compareSync(this.data.password, attemptedUser.password)) {
        this.data = attemptedUser
        this.getAvatar()
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
  return new Promise(async (resolve, reject) => {
    // validate user data
    this.cleanUp()
    await this.validate()
    // only if there are no validation errors, then save user data into DB
    if (!this.errors.length) {
      const salt = bycrypt.genSaltSync(10)
      this.data.password = bycrypt.hashSync(this.data.password, salt)
      await usersCollection.insertOne(this.data)
      this.getAvatar()
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

User.prototype.getAvatar = function () {
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

User.findByUsername = function (username) {
  return new Promise((resolve, reject) => {
    if (typeof (username) !== 'string') {
      reject()
      return
    }
    usersCollection.findOne({ username: username }).then((userDoc) => {
      if (userDoc) {
        userDoc = new User(userDoc, true)
        userDoc = {
          _id: userDoc.data._id,
          username: userDoc.data.username,
          avatar: userDoc.avatar
        }
        resolve(userDoc)
      } else {
        reject()
      }
    }).catch(() => {
      reject()
    })
  })
}

module.exports = User
