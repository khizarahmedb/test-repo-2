const { db } = require('../config/db_config')

exports.getInventoryFromDBById = async (id) => {
    const query = `
            SELECT 
                i.*, 
                COALESCE(SUM(p.stock), 0)::INTEGER AS products, 
                CASE 
                    WHEN COALESCE(SUM(p.stock), 0)::INTEGER > 0 THEN 'In Stock' 
                    ELSE 'Out of Stock' 
                END AS status
            FROM inventory i
            LEFT JOIN products p ON i.id = p.stock_id
            WHERE i.id = $1
            GROUP BY i.id;
        `
    const result = await db.query(query, [id])

    if (result.rows.length === 0) return undefined;
    return result.rows[0];
}

exports.getAllInventoriesFromDB = async () => {
    const fetchInventories = `
        SELECT 
            i.*, 
            COALESCE(SUM(p.stock), 0)::INTEGER AS products, 
            CASE 
                WHEN COALESCE(SUM(p.stock), 0)::INTEGER > 0::INTEGER THEN 'In Stock' 
                ELSE 'Out of Stock' 
            END AS status
        FROM inventory i
        LEFT JOIN products p ON i.id = p.stock_id
        GROUP BY i.id;
        `
    const { rows } = await db.query(fetchInventories)

    return rows;
}