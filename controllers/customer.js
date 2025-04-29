const bcrypt = require('bcrypt');
const { db } = require('../config/db_config');
const { STATUS_CODES } = require('../constants/status_codes');
const { errorJson, successJson, Messages } = require('../constants/messages');
const { generateAccessToken } = require('../utils/jwt_service');

exports.customerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Email and password are required"));
        }

        const query = "SELECT * FROM customers WHERE email = $1";
        const { rows } = await db.query(query, [email]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
        }

        const user = rows[0];
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Incorrect password"));
        }

        const token = await generateAccessToken(user);
        const { password: _, ...userData } = user;
        userData.token = token;

        return res.status(STATUS_CODES.SUCCESS).json(successJson(userData, Messages.LoginSuccessful));
    } catch (error) {
        console.error("Customer Login Error:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(Messages.SERVER_ERROR));
    }
};

exports.customerSignup = async (req, res) => {
    try {
        const { email, username, storename, password} = req.body;

        if (!email || !username || !storename || !password) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Invalid email, username, storename, or password"));
        }

        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO customers (email, username, storename, password, is_verified, created_at, updated_at)
            VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW())
            RETURNING *;
        `;

        const { rows } = await db.query(query, [email, username, storename, encryptedPassword]);

        return res.status(STATUS_CODES.CREATED).json(successJson(rows[0], "Customer Created Successfully"));
    } catch (error) {
        console.error("Customer Signup Error:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(Messages.SERVER_ERROR));
    }
};

exports.getCustomers = async (req, res) => {
    try {
        const query = "SELECT * FROM customers";
        const { rows } = await db.query(query);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("No customers found"));
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(rows, "Customers fetched successfully"));
    } catch (error) {
        console.error("Error fetching customers:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(Messages.SERVER_ERROR));
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const customerId = req.params.id;
        const query = "SELECT * FROM customers WHERE id = $1";
        const { rows } = await db.query(query, [customerId]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Customer not found"));
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(rows[0], "Customer fetched successfully"));
    } catch (error) {
        console.error("Error fetching customer by ID:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(Messages.SERVER_ERROR));
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const customerId = req.params.id;
        const { email, username, storename, password } = req.body;

        const checkQuery = "SELECT * FROM customers WHERE id = $1";
        const { rows } = await db.query(checkQuery, [customerId]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Customer not found"));
        }

        let updateFields = [];
        let values = [];
        let index = 1;

        if (email) {
            updateFields.push(`email = $${index++}`);
            values.push(email);
        }
        if (username) {
            updateFields.push(`username = $${index++}`);
            values.push(username);
        }
        if (storename) {
            updateFields.push(`storename = $${index++}`);
            values.push(storename);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push(`password = $${index++}`);
            values.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("No fields provided for update"));
        }

        updateFields.push(`updated_at = $${index++}`);
        values.push(new Date());

        const updateQuery = `UPDATE customers SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`;
        values.push(customerId);

        const updatedCustomer = await db.query(updateQuery, values);

        return res.status(STATUS_CODES.SUCCESS).json(successJson(updatedCustomer.rows[0], "Customer updated successfully"));
    } catch (error) {
        console.error("Error updating customer:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(Messages.SERVER_ERROR));
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const customerId = req.params.id;
        const checkQuery = "SELECT * FROM customers WHERE id = $1";
        const { rows } = await db.query(checkQuery, [customerId]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Customer not found"));
        }

        const deleteQuery = "DELETE FROM customers WHERE id = $1";
        await db.query(deleteQuery, [customerId]);

        return res.status(STATUS_CODES.SUCCESS).json(successJson("Customer deleted successfully"));
    } catch (error) {
        console.error("Error deleting customer:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(Messages.SERVER_ERROR));
    }
};
