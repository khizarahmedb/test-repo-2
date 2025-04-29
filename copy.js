const { STATUS_CODES } = require('../constants/status_codes')
const { errorJson, successJson, Messages } = require('../constants/messages')
const { db } = require('../config/db_config')
const upload = require('../middleware/multer_mv')

exports.createTicket = async (req, res) => {
    const { order_id, customer_email, description, product_id } = req.body

    const admin_id = req.user.id

    if (!order_id || !customer_email || !description || !product_id) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Order ID, customer email, description, and product_id are required"))
    }
    const productCheckQuery = 'SELECT id, name FROM products WHERE id = $1';

    const { rows } = await db.query(productCheckQuery, [product_id]);

    if (rows.length === 0) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Invalid product-id: Product does not exist"));
    }

    const productName = rows[0].name

    const invoiceCheck = 'SELECT id FROM invoices WHERE id = $1';
    const result = await db.query(invoiceCheck, [order_id])
    if (result.rows.length === 0) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('Invalid order-id: Invoice does not exist'));
    }

    try {
        const createTicket = `
            INSERT INTO tickets (order_id, customer_email, description, product_id, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `

        const values = [order_id, customer_email, description, product_id, admin_id]

        const result = await db.query(createTicket, values)

        return res.status(STATUS_CODES.CREATED).json({
            body: { ...result.rows[0], product_name: productName },
            message: "Ticket created successfully"
        }
        )
    } catch (error) {
        console.log("Ticket cannot be created: ", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))

    }
}

exports.updateTicket = async (req, res) => {
    try {
        const ticketId = req.params.id

        const { order_id, customer_email, description, product_id } = req.body


        const checkTicket = "SELECT * FROM tickets WHERE id = $1"

        const { rows } = await db.query(checkTicket, [ticketId])

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Ticket not found"))
        }

        let updateFields = []
        let values = []
        let index = 1

        if (order_id) {
            updateFields.push(`order_id = $${index++}`);
            values.push(order_id)
        }

        if (customer_email) {
            updateFields.push(`customer_email = $${index++}`);
            values.push(customer_email)
        }
        if (description) {
            updateFields.push(`description = $${index++}`);
            values.push(description)
        }

        if (product_id) {
            updateFields.push(`product_id = $${index++}`);
            values.push(product_id)
        }

        updateFields.push(`updated_at = $${index++}`);
        values.push(new Date())

        const updateQuery = `UPDATE tickets SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`

        values.push(ticketId)

        const updatedTicket = await db.query(updateQuery, values);

        return res.status(STATUS_CODES.SUCCESS).json(successJson(
            updatedTicket.rows[0],
            "Ticket Updated Successfully"
        ))

    } catch (error) {
        console.error("Error creating ticket: ", error)
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }
}


exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isResolved } = req.body;

        if (typeof isResolved !== 'boolean') {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('Invalid input: isResolved must be a boolean (true or false)'));
        }

        const newStatus = isResolved ? 'Resolved' : 'Unresolved';

        const query = `
            UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *;
        `;

        const { rows } = await db.query(query, [newStatus, id]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson('Ticket not found'));
        }

        return res.status(STATUS_CODES.SUCCESS).json({ message: 'Ticket status updated successfully', ticket: rows[0] });
    } catch (error) {
        console.error('Error updating ticket status:', error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }

}

// ---get all by filters
// exports.getAll = async (req, res) => {
//     try {
//         const { order_id, status } = req.query;
//         let query = "SELECT * FROM tickets";
//         const values = [];

//         if (order_id && status) {
//             query += " WHERE order_id = $1 AND status = $2";
//             values.push(order_id, status);
//         } else if (order_id) {
//             query += " WHERE order_id = $1";
//             values.push(order_id);
//         } else if (status) {
//             query += " WHERE status = $1";
//             values.push(status);
//         }

//         query += " ORDER BY created_at DESC;";

//         const { rows } = await db.query(query, values);

//         return res.status(STATUS_CODES.SUCCESS).json({ message: 'Tickets fetched successfully', tickets: rows });
//     } catch (error) {
//         console.error('Error fetching tickets:', error);
//         return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
//     }
// }

exports.getAll = async (req, res) => {
    try {
        const getTickets = `SELECT * from tickets`
        const { rows } = await db.query(getTickets)
        return res.status(STATUS_CODES.SUCCESS).json(successJson(
            rows,
            "Tickets Fetched Successfully"
        ))
    }catch(error){
        console.log("Error fetching tickets: ", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }
}

exports.getTicketByID = async (req, res) => {
    try {
        const { id } = req.params
        const getTicket = `SELECT * from tickets where id = $1`

        const { rows } = await db.query(getTicket, [id])

        if (rows.length === 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Ticket Not Found"))
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(rows, "ticket fetched successfully"))
    } catch (error) {
        console.log("Error fetching the ticket: ", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))

    }
}



exports.replaceProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { product_id } = req.body;

        if (!product_id) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Product ID is required"));
        }


        const productCheck = await db.query('SELECT name FROM products WHERE id = $1', [product_id]);

        if (productCheck.rows.length === 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Invalid product_id: Product does not exist."));
        }

        const productName = productCheck.rows[0].name;

        const updateQuery = `
            UPDATE tickets
            SET product_id = $1, status = 'Resolved' , resolved_at = CURRENT_TIMESTAMP
            WHERE id = $2 
            RETURNING *;
        `;

        const { rows } = await db.query(updateQuery, [product_id, id]);
        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json("Ticket not found");
        }

        return res.status(STATUS_CODES.SUCCESS).json({
            message: 'Ticket updated successfully',
            ticket: { ...rows[0], product_name: productName }
        });

    } catch (error) {
        console.error('Error updating ticket:', error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
}