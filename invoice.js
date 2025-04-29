const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Import PostgreSQL connection

// 1. Create an Invoice
router.post("/invoices", async (req, res) => {
    try {
        const { transaction_id, customer_name, customer_email, product_id, payment_gateway, payment_status } = req.body;

        const query = `
            INSERT INTO invoices (transaction_id, customer_name, customer_email, product_id, payment_gateway, payment_status)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;

        const values = [transaction_id, customer_name, customer_email, product_id, payment_gateway, payment_status];
        const result = await pool.query(query, values);

        res.status(201).json({ success: true, invoice: result.rows[0] });
    } catch (error) {
        console.error("Error creating invoice:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 2. Get All Invoices (with Product Name & Price)
router.get("/invoices", async (req, res) => {
    try {
        const query = `
            SELECT i.id, i.transaction_id, i.customer_name, i.customer_email, 
                   p.name AS product_name, p.price AS amount, 
                   i.payment_gateway, i.payment_status, i.created_at
            FROM invoices i
            JOIN products p ON i.product_id = p.id
            ORDER BY i.created_at DESC;
        `;

        const result = await pool.query(query);
        res.status(200).json({ success: true, invoices: result.rows });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 3. Get a Single Invoice by ID
router.get("/invoices/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT i.id, i.transaction_id, i.customer_name, i.customer_email, 
                   p.name AS product_name, p.price AS amount, 
                   i.payment_gateway, i.payment_status, i.created_at
            FROM invoices i
            JOIN products p ON i.product_id = p.id
            WHERE i.id = $1;
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        res.status(200).json({ success: true, invoice: result.rows[0] });
    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 4. Update Payment Status
router.put("/invoices/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        const query = `UPDATE invoices SET payment_status = $1 WHERE id = $2 RETURNING *;`;
        const result = await pool.query(query, [payment_status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        res.status(200).json({ success: true, message: "Payment status updated", invoice: result.rows[0] });
    } catch (error) {
        console.error("Error updating payment status:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 5. Delete an Invoice
router.delete("/invoices/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const query = `DELETE FROM invoices WHERE id = $1 RETURNING *;`;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        res.status(200).json({ success: true, message: "Invoice deleted" });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
