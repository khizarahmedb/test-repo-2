const express = require('express')
const router = express.Router()
const {postInvoice, getAllInvoices, getInvoiceByID, deleteInvoiceByID, updatePaymentStatus} = require('../controllers/invoices')
const {validateUser} = require('../middleware/auth_mv')

router.post('/invoice/post', validateUser, postInvoice)
router.get('/invoice', validateUser, getAllInvoices)
router.get('/invoice/:id', validateUser, getInvoiceByID)
router.delete('/invoice/:id', validateUser, deleteInvoiceByID)
router.patch('/invoice/update-status/:id', validateUser, updatePaymentStatus)

module.exports = router
