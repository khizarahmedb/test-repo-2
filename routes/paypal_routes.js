const express = require('express')
const router = express.Router()
const { payProduct, successPage } = require('../payment/paypal')
const {validateUser} = require('../middleware/auth_mv')


// router.get('/', renderBuyPage);
router.post('/pay', payProduct);
router.get('/success', successPage);
// router.get('/cancel', cancelPage);

module.exports = router