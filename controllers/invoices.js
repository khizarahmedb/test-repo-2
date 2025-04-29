const { STATUS_CODES } = require('../constants/status_codes')
const { errorJson, successJson, Messages } = require('../constants/messages')
const { db } = require('../config/db_config')

// exports.postInvoice = async (req, res) => {
//     try {
//         const { transaction_id, customer_name, customer_email, product_id, payment_gateway, payment_status, amount, currency } = req.body;

//         const checkProduct = `SELECT FROM products WHERE id = $1`

//         const { rows } = await db.query(checkProduct, [product_id])

//         if (rows.length === 0) {
//             return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(`Product of product id ${product_id} does not exist`))
//         }

//         const query = `
//             INSERT INTO invoices (transaction_id, customer_name, customer_email, product_id, payment_gateway, payment_status, amount, currency)
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
//         `;

//         const values = [transaction_id, customer_name, customer_email, product_id, payment_gateway, payment_status, amount, currency];
//         const result = await db.query(query, values);

//         res.status(STATUS_CODES.CREATED).json({ success: true, invoice: result.rows[0] });

//     } catch (error) {
//         console.error("Error creating invoice:", error);
//         res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
//     }

// }

exports.postInvoice = async (req, res) => {
    try {
        const {customer_name, customer_email, product_id, amount, currency, payment_gateway } = req.body;
        const admin = req.user.id

        const checkProduct = `SELECT FROM products WHERE id = $1`;

        const { rows } = await db.query(checkProduct, [product_id]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(`Product with product_id ${product_id} does not exist`));
        }

        const query = `
            INSERT INTO invoices (customer_name, customer_email, product_id, payment_gateway, payment_status, inv_amount, inv_currency, customer_id)
            VALUES ($1, $2, $3, $4, 'Unsuccessful', $5, $6, $7) RETURNING *;
        `;

        const values = [customer_name, customer_email, product_id, payment_gateway, amount, currency, admin];
        const result = await db.query(query, values);

        res.status(STATUS_CODES.CREATED).json({ success: true, invoice: result.rows[0] });

    } catch (error) {
        console.error("Error creating invoice:", error);
        res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};


exports.getAllInvoices = async (req, res) => {
    try {
        const query = `
            SELECT i.id, i.customer_name, i.customer_email, i.inv_amount, i.inv_currency,
                   p.name AS product_name, p.price AS amount, 
                   i.payment_gateway, i.payment_status, i.created_at
            FROM invoices i
            JOIN products p ON i.product_id = p.id
            ORDER BY i.created_at DESC;
        `;

        const result = await db.query(query);
        res.status(STATUS_CODES.SUCCESS).json({ success: true, invoices: result.rows });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
}

exports.getInvoiceByID = async (req,res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT i.id, i.customer_name, i.customer_email, i.inv_amount, i.inv_currency,
                   p.name AS product_name, p.price AS amount, 
                   i.payment_gateway, i.payment_status, i.created_at
            FROM invoices i
            JOIN products p ON i.product_id = p.id
            WHERE i.id = $1;
        `;

        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Invoice not found"));
        }

        res.status(STATUS_CODES.SUCCESS).json({ success: true, invoice: result.rows[0] });
    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
}

exports.deleteInvoiceByID = async (req,res) => {
    try {
        const { id } = req.params;
        const query = `DELETE FROM invoices WHERE id = $1 RETURNING *;`;
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Invoice Not Found"));
        }

        res.status(STATUS_CODES.SUCCESS).json(successJson("Invoice deleted successfully"));
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
    
}

// exports.updatePaymentStatus = async(req,res) => {
//     try {
//         const { id } = req.params;
//         const { payment_status } = req.body;

//         const query = `UPDATE invoices SET payment_status = $1 WHERE id = $2 RETURNING *;`;
//         const result = await db.query(query, [payment_status, id]);

//         if (result.rows.length === 0) {
//             return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Invoice Not Found"));
//         }

//         res.status(STATUS_CODES.SUCCESS).json({ success: true, message: "Payment status updated", invoice: result.rows[0] });
//     } catch (error) {
//         console.error("Error updating payment status:", error);
//         res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
//     }
// }

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isSuccess } = req.body;

        const payment_status = isSuccess ? "Successful" : "Unsuccessful";

        const query = `UPDATE invoices SET payment_status = $1, status_updated_at = NOW() WHERE id = $2 RETURNING *;`;
        const result = await db.query(query, [payment_status, id]);

        if (result.rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Invoice Not Found"));
        }

        res.status(STATUS_CODES.SUCCESS).json({ success: true, message: "Payment status updated", invoice: result.rows[0] });
    } catch (error) {
        console.error("Error updating payment status:", error);
        res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};
