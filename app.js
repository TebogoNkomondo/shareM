const express = require('express')
const session = require('express-session')
const app = express()
const router = require('./router')
const dotenv = require('dotenv')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')

dotenv.config()

const sessionOptions = session({
  secret: process.env.SECRET,
  store: new MongoStore({ client: require('./db') }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
})

app.use(sessionOptions)
app.use(flash())

app.use((req, res, next) => {
  // make current user ID available on the request element
  if (req.session.user) {
    req.visitorID = req.session.user._id
  } else {
    req.visitorID = 0
  }

  // make user session data available from within view templates
  res.locals.user = req.session.user
  next()
})

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

module.exports = app
