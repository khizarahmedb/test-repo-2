const { STATUS_CODES } = require('../constants/status_codes')
const { errorJson, successJson, Messages } = require('../constants/messages')
const { db } = require('../config/db_config')

//   (SELECT COUNT(*) FROM sales) AS total_sales,
//   (SELECT SUM(amount) FROM sales) AS total_revenue,
// (SELECT COUNT(*) FROM orders WHERE status = 'Completed') AS completed_orders,
// (SELECT COUNT(*) FROM orders WHERE status = 'Pending') AS pending_orders

exports.dashboard = async (req, res) => {
    try {
        //     const query = `
        //     SELECT 
        //       (SELECT COUNT(*) FROM products) AS total_products,
        //       (SELECT COUNT(*) FROM invoices WHERE payment_status = 'Successful') AS successful_transactions,


        //   `;
        const query = `
        SELECT 
        (SELECT COUNT(*) FROM products) AS total_products,
        (SELECT COUNT(*) FROM invoices WHERE payment_status = 'Successful') AS successful_transactions,
        invoice_data.invoice_date,
            invoice_data.total_invoices
        FROM (
            SELECT 
                DATE(created_at) AS invoice_date, 
                COUNT(*) AS total_invoices
            FROM invoices
            GROUP BY DATE(created_at)   
            ORDER BY invoice_date DESC
        ) AS invoice_data;

      `;

        // const invoicePerDay = `
        //     SELECT 
        //         DATE(created_at) AS invoice_date, 
        //         COUNT(*) AS total_invoices
        //     FROM invoices
        //     GROUP BY DATE(created_at)
        //     ORDER BY invoice_date DESC;
        // `;
        // const invoicePerDay = `
        //     SELECT * FROM invoices WHERE DATE(created_at) = '2025-03-13';
        // `;

        // const invoiceResult = await db.query(invoicePerDay);
        // res.status(STATUS_CODES.SUCCESS).json(successJson(invoiceResult.rows));


        const result = await db.query(query);
        res.status(STATUS_CODES.SUCCESS).json(successJson(result.rows[0]));

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};