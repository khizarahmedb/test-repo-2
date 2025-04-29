const express = require('express')
const router = express.Router()
const {addCoupon, editCoupon, deleteCoupon, getAllCoupon, getByID, validateCoupon, incrementCouponUsage} = require('../controllers/coupons')
const {validateUser} = require('../middleware/auth_mv')
const {validateCouponExpiry} = require('../middleware/coupon_mv')

router.post('/coupon/add', validateUser, addCoupon)
router.put('/coupon/:id', validateUser, editCoupon)
router.get('/coupon', validateUser, getAllCoupon)
router.get('/coupon/:id', validateUser, getByID)
router.post('/coupon/validate/:coupon_code', validateUser, validateCouponExpiry, validateCoupon)
router.put('/coupon/increment/:coupon_code', validateUser, validateCouponExpiry, incrementCouponUsage)
router.delete('/coupon/:id', validateUser, deleteCoupon)

module.exports = router