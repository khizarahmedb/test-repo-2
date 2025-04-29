const express = require('express')
const router = express.Router()
const {makePayment} = require('../payment/authorizeNetPayment')
const {validateUser} = require('../middleware/auth_mv')

router.post("/payment/pay", validateUser, makePayment);
  
  // async (req, res) => {
  //   const { products, cardNumber, expiry, cvv, cardholderName} = req.body;
  
  //   await makePayment(req, res);
  //   /*
  //     products, cardNumber, expiry, cvv, cardholderName, (error, result) => {
  //     if (error) {
  //       console.error("Payment Error:", error);
  //       return res.status(400).json(error);
  //     }
  //     console.log("Payment Success:", result);
  //   //   console.log("Authorize.Net Raw Response:", JSON.stringify(response, null, 2));

  //     return res.status(200).json(result);
  //   }
  //   */
  // });


module.exports = router
