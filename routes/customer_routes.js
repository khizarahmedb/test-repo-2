const express = require('express')
const router = express.Router()
const {customerLogin, customerSignup, updateCustomer, getCustomers, getCustomerById, deleteCustomer} = require('../controllers/customer')
const { validateCustomer } = require("../middleware/auth_mv");

//authentication routes

router.post('/customer/signup', customerSignup)
router.post('/customer/login', customerLogin)
router.get('/customer/get-all', getCustomers)
router.get('/customer/get-by-id/:id', getCustomerById)
router.put('/customer/edit/:id', updateCustomer)
router.delete('/customer/delete/:id', deleteCustomer)



module.exports = router