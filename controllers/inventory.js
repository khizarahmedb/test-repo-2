const { STATUS_CODES } = require('../constants/status_codes')
const { errorJson, successJson, Messages } = require('../constants/messages')
const { db } = require('../config/db_config')
const inventoryService = require('../db_service/inventory_service')

exports.addInventory = async (req, res) => {
    const { stock_name, delimiter, items } = req.body;
    const admin_id = req.user.id

    if (!stock_name || !delimiter || !items) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Stock name, delimiter, and items are required"));
    }

    const stockNameArray = stock_name.split(delimiter).map(name => name.trim());
    const itemsArray = items.split(delimiter).map(item => item.trim());

    if (stockNameArray.length === 0 || itemsArray.length === 0) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("No valid stock names or items provided"));
    }

    try {
        // const values = stockNameArray.map(name => `('${name}', ${products}, NOW())`).join(",");
        // const values = stockNameArray.map(name => `('${name}', 0, NOW()), ${admin_id}`).join(",");

        // const query = `
        //         INSERT INTO inventory (stock_name, products, last_updated, created_by) 
        //         VALUES ${values} 
        //         RETURNING *;
        //     `;

        const values = [];
        const placeholders = stockNameArray.map((name, index) => {
            const baseIndex = index * 3;
            values.push(name, new Date(), admin_id);
            return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`;
        }).join(",");

        const query = `
            INSERT INTO inventory (stock_name, last_updated, created_by) 
            VALUES ${placeholders} 
            RETURNING *;
        `;

        const result = await db.query(query, values);
        const addedStocks = result.rows;
        const itemValues = [];
        const itemPlaceholders = [];
        let paramIndex = 1;

        for (let i = 0; i < addedStocks.length; i++) {
            const stockId = addedStocks[i].id;

            for (let j = 0; j < itemsArray.length; j++) {
                itemValues.push(itemsArray[j], stockId);
                itemPlaceholders.push(`($${paramIndex}, $${paramIndex + 1})`);
                paramIndex += 2;
            }
        }

        if (itemValues.length > 0) {
            const itemQuery = `
                INSERT INTO inventory_items (item_name, stock_id)
                VALUES ${itemPlaceholders.join(", ")};
            `;
            await db.query(itemQuery, itemValues);
        }

        for (let stock of addedStocks) {
            const itemsResult = await db.query(
                "SELECT item_name FROM inventory_items WHERE stock_id = $1",
                [stock.id]
            );
            stock.items = itemsResult.rows.map(row => row.item_name);
        }

        res.status(STATUS_CODES.CREATED).json({
            message: "Stock and items added successfully",
            addedStocks: addedStocks
        });
    } catch (error) {
        console.error("Inventory cannot be added: ", error)
        res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }

}

exports.editInventory = async (req, res) => {
    try {
        const inventoryId = req.params.id

        const { stock_name } = req.body


        const checkInventory = "SELECT * FROM inventory WHERE id = $1"

        const { rows } = await db.query(checkInventory, [inventoryId])

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Coupon not found"))
        }

        let updateFields = []
        let values = []
        let index = 1

        if (stock_name) {
            updateFields.push(`stock_name = $${index++}`);
            values.push(stock_name)
        }

        updateFields.push(`last_updated = $${index++}`);
        values.push(new Date())

        const updateQuery = `UPDATE inventory SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`

        values.push(inventoryId)

        const updatedInventory = await db.query(updateQuery, values);

        return res.status(STATUS_CODES.SUCCESS).json(successJson(
            updatedInventory.rows[0],
            "Inventory Updated Successfully"
        ))

    } catch (error) {
        console.error("Error updating Inventory ", error)

        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }
}

exports.getAllInventory = async (req, res) => {
    try {
        const inventories = await inventoryService.getAllInventoriesFromDB();

        return res.status(STATUS_CODES.SUCCESS).json(successJson(
            inventories,
            'Inventories fetched successfully'
        ))
    } catch (error) {
        console.error("Error fetching inventories: ", error)
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }
}

exports.getByID = async (req, res) => {
    try {
        const inventoryId = req.params.id
        const inventory = await inventoryService.getInventoryFromDBById(inventoryId);

        if (!inventory ) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Inventory not found"))
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(
            inventory,
            'Inventory Fetched Successfully'
        ))
    } catch (error) {
        console.error("Error Fetching Inventory By ID: ", error)
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"))
    }
}

exports.deleteInventory = async (req, res) => {
    try {
        const inventoryId = req.params.id;

        // Check if the inventory exists
        const checkQuery = "SELECT * FROM inventory WHERE id = $1";
        const { rows } = await db.query(checkQuery, [inventoryId]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Inventory not found"));
        }

        // Delete associated products first
        const deleteProductsQuery = "DELETE FROM products WHERE stock_id = $1";
        await db.query(deleteProductsQuery, [inventoryId]);

        // Delete the inventory
        const deleteInventoryQuery = "DELETE FROM inventory WHERE id = $1 RETURNING *";
        const deletedInventory = await db.query(deleteInventoryQuery, [inventoryId]);

        return res.status(STATUS_CODES.SUCCESS).json(successJson(
            deletedInventory.rows[0],
            "Inventory and associated products deleted successfully"
        ));

    } catch (error) {
        console.error("Error deleting inventory:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};


exports.getInventoryItems = async (req, res) => {
    try {
        const query = "SELECT * FROM inventory_items";
        const { rows } = await db.query(query);

        return res.status(STATUS_CODES.SUCCESS).json(successJson(
            rows,
            "Inventory items fetched successfully"
        ));
    } catch (error) {
        console.error("Error fetching inventory items:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};

exports.getInventoryItemsByInventoryId = async (req, res) => {
    try {
        const inventoryId = req.params.id;
        const query = "SELECT * FROM inventory_items WHERE stock_id = $1";
        const { rows } = await db.query(query, [inventoryId]);

        return res.status(STATUS_CODES.SUCCESS).json(successJson(
            rows,
            "Inventory items fetched successfully"
        ));
    } catch (error) {
        console.error("Error fetching inventory items by inventory ID:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};

exports.editInventoryItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const { item_name, customer_email } = req.body;

        const checkQuery = "SELECT * FROM inventory_items WHERE id = $1";
        const { rows } = await db.query(checkQuery, [itemId]);

        if (rows.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Inventory item not found"));
        }

        let updateFields = [];
        let values = [];
        let index = 1;

        if (item_name) {
            updateFields.push(`item_name = $${index++}`);
            values.push(item_name);
        }
        if (customer_email) {
            updateFields.push(`customer_email = $${index++}`);
            values.push(customer_email);
        }

        const updateQuery = `UPDATE inventory_items SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`;
        values.push(itemId);

        const updatedItem = await db.query(updateQuery, values);

        return res.status(STATUS_CODES.SUCCESS).json(successJson(
            updatedItem.rows[0],
            "Inventory item updated successfully"
        ));
    } catch (error) {
        console.error("Error updating inventory item:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
    }
};
