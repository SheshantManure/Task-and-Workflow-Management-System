const express = require('express')
const { SignUp, SignIn } = require('../controllers/userController')
const { authenticate } = require('../middlewares/authMiddleware')
const router = express.Router()

router.post('/signup', SignUp)
router.post('/signin', SignIn)
router.get('/authtest', authenticate, (req, res) => res.send('Secured route'))

module.exports = router