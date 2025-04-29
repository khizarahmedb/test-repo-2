const { STATUS_CODES } = require('../constants/status_codes')
const { errorJson, successJson } = require('../constants/messages')
const { db } = require('../config/db_config')

// Add Product with Stock Selection
exports.addProduct = async (req, res) => {
    const { name, description, price, currency, variation, availability, stock_id, image_url, delivery_time, stock_delimiter, low_stock_alert, out_of_stock, stock } = req.body;

    const admin_id = req.user.id;

    if (!name || !description || !price || !currency || !variation || !availability || !stock_id || !image_url || !delivery_time || !admin_id || !stock_delimiter || !low_stock_alert || !out_of_stock || !stock) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("All fields are required"));
    }

    try {
        // Check if stock exists
        const stockCheckQuery = "SELECT * FROM inventory WHERE id = $1";
        const stockResult = await db.query(stockCheckQuery, [stock_id]);

        if (stockResult.rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Stock not found"));
        }

        // Insert new product
        const productQuery = `
            INSERT INTO products (name, description, price, currency, variation, availability, stock_id, image_url, delivery_time, stock_delimiter, low_stock_alert, out_of_stock, created_by, stock) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
            RETURNING *
        `;

        const values = [name, description, price, currency, variation, availability, stock_id, image_url, delivery_time, stock_delimiter, low_stock_alert, out_of_stock, admin_id, stock];

        const result = await db.query(productQuery, values);

        // Update inventory stock count
        const updateStockQuery = `
            UPDATE inventory 
            SET products = products + $1, 
                status = CASE WHEN (products + $1) > 0 THEN 'In Stock' ELSE 'Out of Stock' END
            WHERE id = $2
            RETURNING *
        `;

        await db.query(updateStockQuery, [stock, stock_id]);

        res.status(STATUS_CODES.CREATED).json({
            message: "Product Added Successfully",
            product: result.rows[0]
        });
    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};

// Edit Product with Stock Update
exports.editProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, description, price, currency, variation, availability, stock_id, image_url, delivery_time, low_stock_alert, out_of_stock, stock_delimiter } = req.body;

        const checkProductQuery = "SELECT * FROM products WHERE id = $1";
        const { rows } = await db.query(checkProductQuery, [productId]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Product not found"));
        }

        let updateFields = [];
        let values = [];
        let index = 1;

        if (name) {
            updateFields.push(`name = $${index++}`);
            values.push(name);
        }
        if (description) {
            updateFields.push(`description = $${index++}`);
            values.push(description);
        }
        if (price) {
            updateFields.push(`price = $${index++}`);
            values.push(price);
        }
        if (currency) {
            updateFields.push(`currency = $${index++}`);
            values.push(currency);
        }
        if (variation) {
            updateFields.push(`variation = $${index++}`);
            values.push(variation);
        }
        if (availability) {
            updateFields.push(`availability = $${index++}`);
            values.push(availability);
        }
        if (stock_id) {
            // Check if the stock exists
            const stockCheckQuery = "SELECT * FROM inventory WHERE id = $1";
            const stockResult = await db.query(stockCheckQuery, [stock_id]);

            if (stockResult.rows.length === 0) {
                return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Stock not found"));
            }

            updateFields.push(`stock_id = $${index++}`);
            values.push(stock_id);
        }
        if (image_url) {
            updateFields.push(`image_url = $${index++}`);
            values.push(image_url);
        }
        if (delivery_time) {
            updateFields.push(`delivery_time = $${index++}`);
            values.push(delivery_time);
        }
        if (low_stock_alert) {
            updateFields.push(`low_stock_alert = $${index++}`);
            values.push(low_stock_alert);
        }
        if (out_of_stock) {
            updateFields.push(`out_of_stock = $${index++}`);
            values.push(out_of_stock);
        }
        if (stock_delimiter) {
            updateFields.push(`stock_delimiter = $${index++}`);
            values.push(stock_delimiter);
        }

        if (updateFields.length === 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("No fields provided for update"));
        }

        updateFields.push(`updated_at = $${index++}`);
        values.push(new Date());

        const updateQuery = `UPDATE products SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`;

        values.push(productId);

        const updatedProduct = await db.query(updateQuery, values);

        return res.status(STATUS_CODES.SUCCESS).json({
            message: "Product updated successfully",
            product: updatedProduct.rows[0]
        });

    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};

// Sell Product API - Reduce stock
exports.sellProduct = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;

        if (!product_id || !quantity || quantity <= 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Product ID and valid quantity are required"));
        }

        // Get product and stock details
        const productQuery = "SELECT p.stock_id, i.available_quantity FROM products p JOIN inventory i ON p.stock_id = i.id WHERE p.id = $1";
        const { rows } = await db.query(productQuery, [product_id]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Product not found"));
        }

        const { stock_id, available_quantity } = rows[0];

        if (available_quantity < quantity) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Not enough stock available"));
        }

        // Reduce stock quantity
        const updateStockQuery = "UPDATE inventory SET available_quantity = available_quantity - $1 WHERE id = $2 RETURNING available_quantity";
        const updatedStock = await db.query(updateStockQuery, [quantity, stock_id]);

        return res.status(STATUS_CODES.SUCCESS).json({
            message: "Product sold successfully",
            remaining_stock: updatedStock.rows[0].available_quantity
        });
    } catch (error) {
        console.error("Error selling product:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};

// Delete Product API
exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // Check if product exists
        const checkProductQuery = "SELECT * FROM products WHERE id = $1";
        const { rows } = await db.query(checkProductQuery, [productId]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Product not found"));
        }

        // Delete product (keeping stock if shared)
        const deleteQuery = "DELETE FROM products WHERE id = $1";
        await db.query(deleteQuery, [productId]);

        return res.status(STATUS_CODES.SUCCESS).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};
