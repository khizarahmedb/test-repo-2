const express = require("express");
const app = express();
const { dbConnection } = require("./config/db_config");
const dotenv = require("dotenv").config();
const admin = require("./routes/admin_routes");
const product = require("./routes/product_routes");
const invoice = require("./routes/invoices_routes");
const coupon = require("./routes/coupon_routes");
const ticket = require("./routes/ticket_routes");
const dashboard = require("./routes/dashboard_route");
const customer = require("./routes/customer_routes");
const inventory = require("./routes/inventory_routes");
const payment = require("./routes/payment_routes");
const paypal = require("./routes/paypal_routes");
const cors = require("cors");
const PORT = process.env.PORT;

dbConnection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = ["http://localhost:9002", "https://front.invader.shop"];

// app.use(
//   cors({
//     origin: "https://front.invader.shop", // Allow frontend origin
//     credentials: true, // Allow cookies if needed
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization", "x-token"],
//   })
// );

app.use("/api", admin);
app.use("/api", product);
app.use("/api", invoice);
app.use("/api", coupon);
app.use("/api", ticket);
app.use("/api", dashboard);
app.use("/api", customer);
app.use("/api", inventory);
app.use("/api", payment);
app.use("/api", paypal);

require("./cron/cleanupPayPalSessions");

app.listen(PORT, () => {
  console.log(`Successfully running on port ${PORT}`);
});
