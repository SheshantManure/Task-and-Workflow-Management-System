const express = require('express')
const { authenticate } = require('../middlewares/authMiddleware')
const router = express.Router()

router.post('/create-new-task', authenticate, (req, res)=> {
    
})

module.exports = router