const { STATUS_CODES } = require('../constants/status_codes')
const { errorJson, successJson, Messages } = require('../constants/messages')
const { db } = require('../config/db_config')


exports.validateCouponExpiry = async (req, res, next) => {
    try {
        const { coupon_code } = req.params;

        //if coupon exists
        const result = await db.query(
            "SELECT * FROM coupons WHERE coupon_code = $1",
            [coupon_code]
        );

        if (result.rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Invalid coupon code or does not exist"));
        }

        const coupon = result.rows[0]
        // console.log(coupon);

        const exp = new Date(coupon.expiry_date);
        const now = Date.now()

        if (now > exp) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Coupon has been expired"));
        } else if (coupon.usage_limit >= coupon.max_limit) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Coupon limit has been exceeded"));
        }

        req.coupon = coupon
        next()

    } catch (error) {
        console.error("Error validating coupon:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}