const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const followController = require('./controllers/followController')
const postController = require('./controllers/postController')

router.get('/', userController.home)
router.post('/register', userController.register)

module.exports = router
