const bcrypt = require('bcrypt')
const { db } = require('../config/db_config')
const { STATUS_CODES } = require('../constants/status_codes')
const { errorJson, successJson, Messages } = require('../constants/messages')
const { generateAccessToken } = require('../utils/jwt_service')
const { isValidEmail } = require('../validator/email_validator')


exports.adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Username and password are required"));
        }

        const username_sql = "SELECT * FROM users WHERE username = $1";

        const { rows } = await db.query(username_sql, [username]);

        if (rows.length === 0 || !rows[0].is_admin) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
        }

        const user_password = rows[0].password;
        const passwordsMatch = await bcrypt.compare(password, user_password);

        if (!passwordsMatch) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Incorrect password"));
        }

        const user = rows[0];

        const user_token = await generateAccessToken(user);

        const { password: _, ...userData } = rows[0];
        userData.token = user_token;

        return res.status(STATUS_CODES.SUCCESS).json(successJson(userData, Messages.LoginSuccessful));

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(Messages.SERVER_ERROR));
    }
};

exports.customerLogin = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Identifier and password are required"));
        }

        const username_sql = "SELECT * FROM users WHERE (username = $1 OR email = $1)";

        const { rows } = await db.query(username_sql, [identifier]);

        if (rows.length === 0 || rows[0].is_admin) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
        }

        const user_password = rows[0].password;
        const passwordsMatch = await bcrypt.compare(password, user_password);

        if (!passwordsMatch) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Incorrect password"));
        }

        const user = rows[0];

        const user_token = await generateAccessToken(user);

        const { password: _, ...userData } = rows[0];
        userData.token = user_token;

        return res.status(STATUS_CODES.SUCCESS).json(successJson(userData, Messages.LoginSuccessful));

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(Messages.SERVER_ERROR));
    }
};


exports.adminSignup = async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        const { username, password, store_name } = req.body;

        if (!username || !password || !store_name) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Some of (username, password, email or store name) are empty"));
        }

        const createAdminQuery = `
            INSERT INTO users (
                username, password, store_name, is_admin, is_verified, created_at, updated_at
            ) 
            VALUES ($1, $2, $3, TRUE, TRUE, NOW(), NOW())
            RETURNING *;
        `;

        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);

        // Use async/await instead of callback
        const { rows } = await db.query(createAdminQuery, [username, encryptedPassword, store_name]);

        return res.status(STATUS_CODES.CREATED).json(successJson(rows[0], Messages.CustomerCreatedSuccessfully));

    } catch (error) {
        console.error("Database Error:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(error.toString()));
    }
}

exports.customerSignup = async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        const { username, password, store_name, email } = req.body;

        if (!username || !password || !store_name || !email) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Some of (username, password, email or store name) are empty"));
        }
        if (!isValidEmail(email)) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Invalid Email"));
        }


        const createCustomerQuery = `
            INSERT INTO users (
                username, password, email, store_name, is_admin, is_verified, created_at, updated_at
            ) 
            VALUES ($1, $2, $3, $4, FALSE, TRUE, NOW(), NOW())
            RETURNING *;
        `;

        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);

        // Use async/await instead of callback
        const { rows } = await db.query(createCustomerQuery, [username, encryptedPassword, email, store_name]);

        return res.status(STATUS_CODES.CREATED).json(successJson(rows[0], Messages.UserCreatedSuccessfully));

    } catch (error) {
        console.error("Database Error:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(Messages.SERVER_ERROR));
    }
}

exports.getAdmin = async (req, res) => {
    try {

        const getAdmin = "SELECT * FROM users WHERE is_admin = TRUE"

        db.query(getAdmin, async (err, result) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson('Database query failed'));
            }
            if (result.rows.length === 0) {
                return res.status(STATUS_CODES.NOT_FOUND).json(Messages.UserNotFound)
            }
            return res.status(STATUS_CODES.SUCCESS).json(successJson(result.rows, Messages.AdminFetchedSuccessfully))
        })

    } catch (error) {
        console.error("Error getting all users: ", error)
        res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }
}

exports.getCustomer = async (req, res) => {
    try {

        const getAdmin = "SELECT * FROM users WHERE is_admin = FALSE"

        db.query(getAdmin, async (err, result) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson('Database query failed'));
            }
            if (result.rows.length === 0) {
                return res.status(STATUS_CODES.NOT_FOUND).json(Messages.UserNotFound)
            }
            return res.status(STATUS_CODES.SUCCESS).json(successJson(result.rows, Messages.CustomerFetchedSuccessfully))
        })

    } catch (error) {
        console.error("Error getting all users: ", error)
        res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }
}

exports.getAdminById = async (req, res) => {
    try {
        const user_id = req.params.id

        const getById = 'SELECT * FROM users where id = $1'

        db.query(getById, [user_id], async (err, result) => {
            if (err) {
                console.error("Database query error: ", err)
                return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Database query failed"))
            }

            const rows = result.rows;

            if (rows.length === 0 || !rows[0].is_admin) {
                return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
            }
            return res.status(STATUS_CODES.SUCCESS).json(successJson(result.rows[0], "Admin successfully fetched"))
        })

    } catch (error) {
        console.error("Error getting admin by id: ", error)
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson('Internal Server Error'))
    }
}

exports.getCustomerById = async (req, res) => {
    try {
        const user_id = req.params.id

        const getById = 'SELECT * FROM users where id = $1'

        db.query(getById, [user_id], async (err, result) => {
            if (err) {
                console.error("Database query error: ", err)
                return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Database query failed"))
            }

            const rows = result.rows;

            if (rows.length === 0 || rows[0].is_admin) {
                return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
            }
            return res.status(STATUS_CODES.SUCCESS).json(successJson(result.rows[0], "Admin successfully fetched"))
        })

    } catch (error) {
        console.error("Error getting admin by id: ", error)
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson('Internal Server Error'))
    }
}

exports.updateAdmin = async (req, res) => {

    try {
        const userId = req.params.id

        const { username, password, store_name } = req.body


        const checkUserQuery = "SELECT * FROM users WHERE id = $1"

        const { rows } = await db.query(checkUserQuery, [userId])

        if (rows.length === 0 || !rows[0].is_admin) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
        }

        let updateFields = []
        let values = []
        let index = 1

        if (username) {
            updateFields.push(`username = $${index++}`);
            values.push(username)
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push(`password = $${index++}`);
            values.push(hashedPassword)
        }
        if (store_name) {
            updateFields.push(`store_name = $${index++}`);
            values.push(store_name)
        }

        if (rows.length === 0 || !rows[0].is_admin) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
        }

        updateFields.push(`updated_at = $${index++}`);
        values.push(new Date())

        const updateQuery = `UPDATE users SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`

        values.push(userId)

        const updatedAdmin = await db.query(updateQuery, values);

        return res.status(STATUS_CODES.SUCCESS).json({
            message: "Admin updated successfully",
            user: updatedAdmin.rows[0]
        })

    } catch (error) {
        console.error("Error updating admin:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }

}

exports.updateCustomer = async (req, res) => {

    try {
        const userId = req.params.id

        const { username, password, store_name, email } = req.body;
        
        if (email && !isValidEmail(email)) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Invalid Email"));
        }


        const checkUserQuery = "SELECT * FROM users WHERE id = $1"

        const { rows } = await db.query(checkUserQuery, [userId])

        if (rows.length === 0 || rows[0].is_admin) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
        }

        let updateFields = []
        let values = []
        let index = 1

        if (username) {
            updateFields.push(`username = $${index++}`);
            values.push(username)
        }
        if (email) {
            updateFields.push(`email = $${index++}`);
            values.push(email)
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push(`password = $${index++}`);
            values.push(hashedPassword)
        }
        if (store_name) {
            updateFields.push(`store_name = $${index++}`);
            values.push(store_name)
        }

        if (rows.length === 0 || rows[0].is_admin) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
        }

        updateFields.push(`updated_at = $${index++}`);
        values.push(new Date())

        const updateQuery = `UPDATE users SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`

        values.push(userId)

        const updatedAdmin = await db.query(updateQuery, values);

        return res.status(STATUS_CODES.SUCCESS).json({
            message: "Customer updated successfully",
            user: updatedAdmin.rows[0]
        })

    } catch (error) {
        console.error("Error updating admin:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }

}


exports.deleteAdmin = async (req, res) => {
    try {
        const userId = req.params.id

        const admin = "SELECT * FROM users where id = $1"

        const { rows } = await db.query(admin, [userId])

        if (rows.length === 0 || !rows[0].is_admin) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
        }

        const deleteUser = "DELETE FROM users WHERE id = $1"
        await db.query(deleteUser, [userId])

        return res.status(STATUS_CODES.SUCCESS).json(successJson("Admin deleted successfully"));

    } catch (error) {
        console.error("Admin deletion failed: ", error)
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }
}

exports.deleteCustomer = async (req, res) => {
    try {
        const userId = req.params.id

        const admin = "SELECT * FROM users where id = $1"

        const { rows } = await db.query(admin, [userId])

        if (rows.length === 0 || rows[0].is_admin) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
        }

        const deleteUser = "DELETE FROM users WHERE id = $1"
        await db.query(deleteUser, [userId])

        return res.status(STATUS_CODES.SUCCESS).json(successJson("Admin deleted successfully"));

    } catch (error) {
        console.error("Admin deletion failed: ", error)
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }
}

