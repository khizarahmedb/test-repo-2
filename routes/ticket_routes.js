const express = require('express')
const router = express.Router()
const {createTicket, updateTicket, updateTicketStatus, getAll, getTicketByID, replaceProduct} = require('../controllers/tickets')
const {validateUser} = require('../middleware/auth_mv')


router.post('/ticket/create', validateUser, createTicket)
router.put('/ticket/:id', validateUser, updateTicket)
router.put('/ticket/update-status/:id', validateUser, updateTicketStatus)
router.get('/ticket', validateUser, getAll)
router.get('/ticket/:id', validateUser, getTicketByID)
router.put('/ticket/replace/:id', validateUser, replaceProduct)

module.exports = router