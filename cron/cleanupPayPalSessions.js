const cron = require("node-cron");
const { db } = require('../config/db_config')


cron.schedule("0 * * * *", async () => {
  console.log("Running PayPal session cleanup job...");

  const deleteQuery = `
    DELETE FROM paypal_sessions
    WHERE created_at < NOW() - INTERVAL '1 hour'
  `;

  try {
    const result = await db.query(deleteQuery);
    console.log(`Cleaned up ${result.rowCount} expired PayPal sessions.`);
  } catch (error) {
    console.error("Error cleaning up PayPal sessions:", error.message);
  }
});
