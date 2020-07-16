const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const markdown = require('marked')
const sanitizeHTML = require('sanitize-html')
const app = express()
const dotenv = require('dotenv')
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

app.use(function (req, res, next) {
  // make markdown function available in ejs templates
  res.locals.filterUserHTML = function (content) {
    return sanitizeHTML(markdown(content), { allowedTags: ['p', 'br', 'li', 'ul', 'strong', 'bold', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'em'], allowedAttributes: [] })
  }
  // make all error and success flash messages available from all templates
  res.locals.errors = req.flash('errors')
  res.locals.success = req.flash('success')

  // make current user id available on the req object
  if (req.session.user) { req.visitorId = req.session.user._id } else { req.visitorId = 0 }

  // make user session data available from within view templates
  res.locals.user = req.session.user
  next()
})

const router = require('./router')
const { SIGCHLD } = require('constants')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

const server = require('http').createServer(app)

const io = require('socket.io')(server)

io.use(function (socket, next) {
  sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection', (socket) => {
  if (socket.request.session.user) {
    const user = socket.request.session.user

    socket.emit('welcome', { username: user.username, avatar: user.avatar })

    socket.on('chatMessageFromBrowser', (data) => {
      socket.broadcast.emit('chatMessageFromServer', { message: data.message, username: user.username, avatar: user.avatar })
    })
  }
})

module.exports = server
