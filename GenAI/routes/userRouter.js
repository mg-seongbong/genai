const express = require('express')
//미 로그인시 home directory로 redirect middleware
const authHandler = require('../middleware/authHandler')

const router = express.Router()
const {
    renderRegister, renderLogin,
    actionLogin, createNewUserRegister, actionLogout
} = require('../controllers/userController')

router.get('/register', renderRegister);
router.post('/register', createNewUserRegister)

router.get('/login', renderLogin)
router.post('/login', actionLogin)

router.get('/logout', authHandler, actionLogout)

module.exports = router