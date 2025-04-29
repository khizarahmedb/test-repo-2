const express = require('express')
const router = express.Router()
const { dashboard} = require('../controllers/dashboard')
const {validateUser} = require('../middleware/auth_mv')

router.get('/dashboard-data', validateUser, dashboard)

module.exports = router