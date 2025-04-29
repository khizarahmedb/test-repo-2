const { STATUS_CODES } = require('../constants/status_codes')
const { errorJson, successJson, Messages } = require('../constants/messages')
const { db } = require('../config/db_config')
const upload = require('../middleware/multer_mv')

// const {Pool} = require('pg')

exports.addProduct = async (req, res) => {
    const { name, description, price, currency, variation, availability, stock_id, image_url, delivery_time, stock_delimiter, low_stock_alert, out_of_stock, stock } = req.body;

    const admin_id = req.user.id;

    if (!name || !description || !price || !currency || !variation || !availability || !stock_id || !image_url || !delivery_time || !stock_delimiter || !low_stock_alert || !out_of_stock || !stock) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("All fields are required"));
    }

    if( price <= 0){
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Price cannot be 0 or less than 0"));
    }

    if( stock < 0 || low_stock_alert < 0 || out_of_stock < 0){
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Stock, low_stock_alert, or out_of_stock cannot be less than 0"));
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
            INSERT INTO products 
                    (name, description, price, currency, variation, availability, stock_id, image_url, delivery_time, stock_delimiter, low_stock_alert, out_of_stock, created_by, stock) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
            RETURNING *, 
            (SELECT stock_name FROM inventory WHERE inventory.id = products.stock_id)
        `;

        const values = [name, description, price, currency, variation, availability, stock_id, image_url, delivery_time, stock_delimiter, low_stock_alert, out_of_stock, admin_id, stock];

        const result = await db.query(productQuery, values);

        res.status(STATUS_CODES.CREATED).json({
            message: "Product Added Successfully",
            product: result.rows[0]
        });
    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};

exports.sellProduct = async (req, res) => {
    const { product_id, quantity_sold } = req.body;

    if (!product_id || !quantity_sold || quantity_sold <= 0) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Valid product_id and quantity_sold are required"));
    }

    try {
        // Fetch the product details along with the stock_id
        const productQuery = `
            SELECT id, stock_id, stock 
            FROM products 
            WHERE id = $1
        `;
        const productResult = await db.query(productQuery, [product_id]);

        if (productResult.rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Product not found"));
        }

        const { stock_id, stock } = productResult.rows[0];

        // Ensure sufficient stock is available
        if (stock < quantity_sold) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Insufficient stock available"));
        }

        // Reduce the stock in the `products` table
        const updateProductStockQuery = `
            UPDATE products 
            SET stock = stock - $1 
            WHERE id = $2
            RETURNING stock, name;
        `;
        const updatedProduct = await db.query(updateProductStockQuery, [quantity_sold, product_id]);
        console.log(updatedProduct);
        
        res.status(STATUS_CODES.SUCCESS).json({
            message: "Product sold successfully",
            remainingStock: updatedProduct.rows[0],
            // productName: updatedProduct.rows[0].name,
            // updatedInventory: updatedInventory.rows[0]
        });

    } catch (error) {
        console.error("Error selling product:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};


exports.editProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const { name, description, price, currency, variation, availability, stock, image_url, delivery_time, low_stock_alert, out_of_stock, stock_delimiter } = req.body;

        // Check if product exists
        const checkProductQuery = "SELECT * FROM products WHERE id = $1";
        const { rows } = await db.query(checkProductQuery, [productId]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Product not found"));
        }

        const existingProduct = rows[0]; // Existing product details
        const previousStock = existingProduct.stock; // Previous stock quantity
        const stock_id = existingProduct.stock_id; // Stock ID linked to inventory

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
            if( price <= 0){
                return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Price cannot be 0 or less than 0"));
            }
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

        if (stock) {
            if(stock<0){
                return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Stock cannot be less than 0"));
            }
            updateFields.push(`stock = $${index++}`);
            values.push(stock);
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
            if(low_stock_alert < 0){
                return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("low_stock_alert cannot be less than 0"));
            }
            updateFields.push(`low_stock_alert = $${index++}`);
            values.push(low_stock_alert);
        }

        if (out_of_stock) {
            if(out_of_stock < 0){
                return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("out_of_stock cannot be less than 0"));
            }
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

        // Update product details
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

exports.getAllProducts = async (req, res) => {
    try {
        const productQuery = "SELECT * FROM products ORDER BY created_at DESC";
        const { rows } = await db.query(productQuery);

        return res.status(STATUS_CODES.SUCCESS).json({
            message: "Products fetched successfully",
            products: rows
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};

exports.getAllProductsOfStock = async (req, res) => {
    try {
        const {stock_id} = req.params;
        const productQuery = `
            SELECT * 
                FROM products
            WHERE stock_id = $1
            ORDER BY created_at DESC`;
        const { rows } = await db.query(productQuery, [stock_id]);

        return res.status(STATUS_CODES.SUCCESS).json({
            message: "Products fetched successfully",
            products: rows
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};

exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const productQuery = "SELECT * FROM products WHERE id = $1";
        const { rows } = await db.query(productQuery, [productId]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Product not found"));
        }

        return res.status(STATUS_CODES.SUCCESS).json({
            message: "Product fetched successfully",
            product: rows[0]
        });
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // Step 1: Get the product's stock and inventory ID before deletion
        const productQuery = "SELECT stock, stock_id FROM products WHERE id = $1";
        const { rows } = await db.query(productQuery, [productId]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Product not found"));
        }

        const { stock, stock_id } = rows[0];

        // Step 2: Delete the product
        const deleteQuery = "DELETE FROM products WHERE id = $1 RETURNING *";
        await db.query(deleteQuery, [productId]);

        return res.status(STATUS_CODES.SUCCESS).json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};
