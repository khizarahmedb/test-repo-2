require('dotenv').config();
const { Client } = require('pg');

const db = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


const dbConnection = () => {
    db.connect((err) => {
        if (err) {
            console.error('Postgres connection failure', err.stack);
            return
        }
        console.log('Connected to PostgreSQL');
    });
};

module.exports = { dbConnection, db };
