const { STATUS_CODES } = require('../constants/status_codes')
const { errorJson, successJson, Messages } = require('../constants/messages')
const { db } = require('../config/db_config')
const upload = require('../middleware/multer_mv')

// const {Pool} = require('pg')

exports.addProduct = async (req, res) => {
    const { name, description, price, currency, variation, availability, stock, image_url, delivery_time, stock_delimiter, low_stock_alert, out_of_stock} = req.body

    const admin_id = req.user.id

    if (!name || !description || !price || !currency || !variation || !availability || !stock || !image_url || !delivery_time || !admin_id || !stock_delimiter || !low_stock_alert || !out_of_stock) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Product name, desciption, price, currency, variation, availability, stock, image_url, stock delimiter, low stock limit, out of stock limit, and delivery time fields are required"))
    }

    try {

        const productQuery = `
            INSERT INTO products (name, description, price, currency, variation, availability, stock, image_url, delivery_time, stock_delimiter, low_stock_alert, out_of_stock, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
            RETURNING *
        `;

        const values = [name, description, price, currency, variation, availability, stock, image_url, delivery_time, stock_delimiter, low_stock_alert, out_of_stock, admin_id]

        const result = await db.query(productQuery, values)

        res.status(STATUS_CODES.CREATED).json({
            message: "Product Added Successfully",
            product: result.rows[0]
        })


    } catch (error) {
        console.error("Product cannot be created: ", error)
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }

}


exports.editProduct = async (req,res) => {
    try {
            const productId = req.params.id
    
            const { name, description, price, currency, variation, availability, stock, image_url, delivery_time, low_stock_alert, out_of_stock, stock_delimiter } = req.body
    
    
            const checkProductQuery = "SELECT * FROM products WHERE id = $1"
    
            const { rows } = await db.query(checkProductQuery, [productId])
    
            if (rows.length === 0) {
                return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Product not found"))
            }
    
            let updateFields = []
            let values = []
            let index = 1
    
            if (name) {
                updateFields.push(`name = $${index++}`);
                values.push(name)
            }

            if (description) {
                updateFields.push(`description = $${index++}`);
                values.push(description)
            }

            if(price){
                updateFields.push(`price = $${index++}`);
                values.push(price)
            }
            
            if(currency){
                updateFields.push(`currency = $${index++}`);
                values.push(currency)
            }

            if(variation){
                updateFields.push(`variation = $${index++}`);
                values.push(variation)
            }
            
            if(availability){
                updateFields.push(`availability = $${index++}`);
                values.push(availability)
            }

            if(stock){
                updateFields.push(`stock = $${index++}`);
                values.push(stock)
            }

            if(image_url){
                updateFields.push(`image_url = $${index++}`);
                values.push(image_url)
            }

            if(delivery_time){
                updateFields.push(`delivery_time = $${index++}`);
                values.push(delivery_time)
            }

            if(low_stock_alert){
                updateFields.push(`low_stock_alert = $${index++}`);
                values.push(low_stock_alert)
            }

            if(out_of_stock){
                updateFields.push(`out_of_stock = $${index++}`);
                values.push(out_of_stock)
            }

            if(stock_delimiter){
                updateFields.push(`stock_delimiter = $${index++}`);
                values.push(stock_delimiter)
            }
    
            if (updateFields.length === 0) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("No fields provided for update"))
            }
    
            updateFields.push(`updated_at = $${index++}`);
            values.push(new Date())
    
            const updateQuery = `UPDATE products SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`
    
            values.push(productId)
    
            const updatedProduct = await db.query(updateQuery, values);
    
            return res.status(STATUS_CODES.SUCCESS).json({
                message: "Admin updated successfully",
                user: updatedProduct.rows[0]
            })
    
        } catch (error) {
            console.error("Error updating admin:", error);
            return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
        }

}

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

        // Check if product exists
        const checkProductQuery = "SELECT * FROM products WHERE id = $1";
        const { rows } = await db.query(checkProductQuery, [productId]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Product not found"));
        }

        // Delete product
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
