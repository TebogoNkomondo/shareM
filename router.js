const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const followController = require('./controllers/followController')

router.get('/', userController.home)

module.exports = router
