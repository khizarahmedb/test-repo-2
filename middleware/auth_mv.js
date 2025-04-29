const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;
const { errorJson, Messages } = require('../constants/messages');
const { STATUS_CODES } = require("../constants/status_codes");
const { db } = require('../config/db_config')

exports.validateUser = async (req, res, next) => {
    try {
        const token = req.header('x-token');

        if (!token) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.TokenDecodeFailure));
        }

        const decoded = jwt.verify(token, JWT_SECRET_KEY);

        const user = await db.query("SELECT * FROM users WHERE id::Integer = $1", [decoded.user_id]);
        if (user.rowCount === 0) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson(Messages.UserNotFound));
        }

        const userFromDB = user.rows[0];

        if (!userFromDB.is_verified) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson(Messages.UserIsNotVerified));
        } else if (userFromDB.is_deleted) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson(Messages.UserNotFound));
        }
        req.user = userFromDB; // Attach decoded token info to the request object for later use
        next(); // Continue to `getMyUser` or other handlers
    } catch (e) {

        if (e.name === "TokenExpiredError") {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson(Messages.TokenExpired));
        }
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.TokenDecodeFailure));
    }
};
exports.validateAdmin = async (req, res, next) => {
    try {
        const user = req.user;
        console.log(user);

        if (!user.is_admin) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson("Only admin can access this route"));
        }

        req.user = user;
        next(); // Continue to the next handler
    } catch (e) {
        if (e.name === "TokenExpiredError") {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson(Messages.TokenExpired));
        }
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.TokenDecodeFailure));
    }
};


exports.validateCustomer = async (req, res, next) => {
    try {
        const user = req.user;

        if (user.is_admin) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson("Only customer can access this route"));
        }

        req.user = user;
        next(); // Continue to the next handler
    } catch (e) {
        if (e.name === "TokenExpiredError") {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson(Messages.TokenExpired));
        }
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.TokenDecodeFailure));
    }
};

