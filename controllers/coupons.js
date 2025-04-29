const { STATUS_CODES } = require('../constants/status_codes')
const { errorJson, successJson, Messages } = require('../constants/messages')
const { db } = require('../config/db_config')
const upload = require('../middleware/multer_mv')
const { isValidDate } = require('../validator/date_validator')

exports.addCoupon = async (req, res) => {
    const { coupon_name, coupon_code, discount_percent, max_limit, expiry_date } = req.body

    const admin_id = req.user.id

    if (!coupon_name || !coupon_code || !discount_percent || !max_limit || !expiry_date) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Coupon Name, Coupon Code, usage_limit, expiry_date and Discount Percent fields are required"))
    } else if (expiry_date && !isValidDate(expiry_date)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Date format is invalid"));
    }
    const exp = new Date(expiry_date);
    const now = Date.now()

    if (exp <= now) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Expiry date cannot be before the current date"));
    }

    if (discount_percent < 0 || discount_percent > 100) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Discount percentage must be between 0 and 100"));
    }



    try {

        const insertCoupon = `
            INSERT INTO coupons (coupon_name, coupon_code, discount_percent, created_by, max_limit, expiry_date) VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `

        const values = [coupon_name, coupon_code, discount_percent, admin_id, max_limit, expiry_date]

        const result = await db.query(insertCoupon, values)

        return res.status(STATUS_CODES.CREATED).json({
            message: "Coupon Added Successfully",
            coupon: result.rows[0]
        })

    } catch (error) {
        console.error("Error creating coupon: ", error)
        if (error.code === '23505') {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Coupon code must be unique or already exists"));
        }
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))

    }
}

exports.editCoupon = async (req, res) => {

    try {
        const couponId = req.params.id

        const { coupon_name, coupon_code, discount_percent, max_limit, expiry_date } = req.body


        const checkCoupon = "SELECT * FROM coupons WHERE id = $1"

        const { rows } = await db.query(checkCoupon, [couponId])

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Coupon not found"))
        }

        let updateFields = []
        let values = []
        let index = 1

        if (coupon_name) {
            updateFields.push(`coupon_name = $${index++}`);
            values.push(coupon_name)
        }

        if (coupon_code) {
            updateFields.push(`coupon_code = $${index++}`);
            values.push(coupon_code)
        }

        if (discount_percent) {
            updateFields.push(`discount_percent = $${index++}`);
            values.push(discount_percent)
        }
        if (max_limit) {
            updateFields.push(`max_limit = $${index++}`);
            values.push(max_limit)
        }
        if (expiry_date) {
            updateFields.push(`expiry_date = $${index++}`);
            values.push(expiry_date)
        }

        if (updateFields.length === 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("No fields provided for update"))
        }

        if (expiry_date && !isValidDate(expiry_date)) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Date format is invalid"));
        }

        const exp = new Date(expiry_date);
        const now = Date.now()

        if (exp <= now) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Expiry date cannot be before the current date"));
        }

        if (discount_percent < 0 || discount_percent > 100) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Discount percentage must be between 0 and 100"));
        }

        updateFields.push(`updated_at = $${index++}`);
        values.push(new Date())

        const updateQuery = `UPDATE coupons SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`

        values.push(couponId)

        const updatedCoupon = await db.query(updateQuery, values);

        return res.status(STATUS_CODES.SUCCESS).json(successJson(
            updatedCoupon.rows[0],
            "Coupon Updated Successfully"
        ))

    } catch (error) {
        console.error("Error creating coupon: ", error)
        if (error.code === '23505') {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Coupon code must be unique or already exists"));
        }
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }
}

exports.getAllCoupon = async (req, res) => {
    try {
        const getCoupons = `SELECT * FROM coupons ORDER BY created_at DESC`

        const { rows } = await db.query(getCoupons);

        return res.status(STATUS_CODES.SUCCESS).json(successJson(
            rows,
            "Coupons fetched successfully"
        ));


    } catch (error) {
        console.error("Unable to fetch coupons: ", error)
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }
}

exports.getByID = async (req, res) => {
    try {
        couponID = req.params.id

        const getCouponById = `SELECT * FROM coupons WHERE id = $1`
        const { rows } = await db.query(getCouponById, [couponID])

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Coupon not found"));
        }

        return res.status(STATUS_CODES.SUCCESS).json({
            message: "Coupon fetched successfully",
            product: rows[0]
        });


    } catch (error) {
        console.error("Unable to fetch coupon by ID: ", error)
        return res.status(STATUS_CODES.SERVER_ERROR).json("Internal Server Error")
    }
}

exports.validateCoupon = async (req, res) => {
    try {
        // const { coupon_code } = req.params;
        const coupon = req.coupon

        return res.status(STATUS_CODES.SUCCESS).json(successJson(
            coupon,
            "Coupon is valid"
        ));

    } catch (error) {
        console.error("Error validating coupon:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.incrementCouponUsage = async (req, res) => {
    try {
        const {coupon_code} = req.params
        const coupon = req.coupon

        const query = `
            UPDATE coupons
                SET usage_limit = $1
            WHERE coupon_code = $2 RETURNING *;

        `
        const updatedCounter = coupon.usage_limit+1
        

        const values = [updatedCounter, coupon_code]

        const updateUsage = await db.query(query, values)



        return res.status(STATUS_CODES.SUCCESS).json(successJson(
            updateUsage.rows[0],
            "Counter Updated Successfully"
        ));

    } catch (error) {
        console.error("Error validating coupon:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}



exports.deleteCoupon = async (req, res) => {
    try {
        const couponId = req.params.id

        const checkCoupon = `SELECT * from coupons WHERE id = $1`

        const { rows } = await db.query(checkCoupon, [couponId])
        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Coupon not found"))
        }

        const deleteQuery = "DELETE FROM coupons WHERE id = $1";
        await db.query(deleteQuery, [couponId]);

        return res.status(STATUS_CODES.SUCCESS).json({
            message: "Coupon deleted successfully"
        });


    } catch (error) {
        console.error('Error Deleting Coupon: ', error)
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }
}
