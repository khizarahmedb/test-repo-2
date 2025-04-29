const paypal = require("paypal-rest-sdk");
const { db } = require('../config/db_config')
const { STATUS_CODES } = require('../constants/status_codes');
const { errorJson, successJson, Messages } = require('../constants/messages');

const { PAYPAL_MODE, PAYPAL_CLIENT_KEY, PAYPAL_SECRET_KEY } = process.env;

paypal.configure({
  mode: PAYPAL_MODE, //sandbox or live
  client_id: PAYPAL_CLIENT_KEY,
  client_secret: PAYPAL_SECRET_KEY,
});

//---------------------------------------------------------
// exports.renderBuyPage = async(req,res)=>{

//     try {

//         res.render('index');

//     } catch (error) {
//         console.log(error.message);
//     }

// }
//--------------------------------------------------

// exports.payProduct = async(req,res)=>{

//     try {

//         const create_payment_json = {
//             "intent": "sale",
//             "payer": {
//                 "payment_method": "paypal"
//             },
//             "redirect_urls": {
//                 "return_url": "http://localhost:3000/success",
//                 "cancel_url": "http://localhost:3000/cancel"
//             },
//             "transactions": [{
//                 "item_list": {
//                     "items": [{
//                         "name": "Book",
//                         "sku": "001",
//                         "price": "25.00",
//                         "currency": "USD",
//                         "quantity": 1
//                     }]
//                 },
//                 "amount": {
//                     "currency": "USD",
//                     "total": "25.00"
//                 },
//                 "description": "Hat for the best team ever"
//             }]
//         };

//         paypal.payment.create(create_payment_json, function (error, payment) {
//             if (error) {
//                 throw error;
//             } else {
//                 for(let i = 0;i < payment.links.length;i++){
//                   if(payment.links[i].rel === 'approval_url'){
//                     res.redirect(payment.links[i].href);
//                   }
//                 }
//             }
//           });

//     } catch (error) {
//         console.log(error.message);
//     }

// }

// exports.successPage = async(req,res)=>{

//     try {

//         const payerId = req.query.PayerID;
//         const paymentId = req.query.paymentId;

//         const execute_payment_json = {
//             "payer_id": payerId,
//             "transactions": [{
//                 "amount": {
//                     "currency": "USD",
//                     "total": "25.00"
//                 }
//             }]
//         };

//         paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
//             if (error) {
//                 console.log(error.response);
//                 throw error;
//             } else {
//                 console.log(JSON.stringify(payment));
//                 res.render('success');
//             }
//         });

//     } catch (error) {
//         console.log(error.message);
//     }

// }
//---------------------------------------------
// exports.payProduct = (req, res) => {
//     const create_payment_json = {
//         intent: "sale",
//         payer: {
//             payment_method: "paypal"
//         },
//         redirect_urls: {
//             return_url: "http://localhost:5000/success",
//             cancel_url: "http://localhost:5000/cancel"
//         },
//         transactions: [{
//             item_list: {
//                 items: [{
//                     name: "Product Name",
//                     sku: "001",
//                     price: "25.00",
//                     currency: "USD",
//                     quantity: 1
//                 }]
//             },
//             amount: {
//                 currency: "USD",
//                 total: "25.00"
//             },
//             description: "Product description."
//         }]
//     };

//     paypal.payment.create(create_payment_json, (error, payment) => {
//         if (error) {
//             console.error(error);
//             return res.status(500).json({ error: "Payment creation failed" });
//         } else {
//             const approvalUrl = payment.links.find(link => link.rel === "approval_url").href;
//             return res.status(200).json({ approvalUrl });
//         }
//     });
// };

// exports.successPage = async (req, res) => {
//     try {
//         const payerId = req.query.PayerID;
//         const paymentId = req.query.paymentId;

//         const execute_payment_json = {
//             "payer_id": payerId,
//             "transactions": [{
//                 "amount": {
//                     "currency": "USD",
//                     "total": "25.00"
//                 }
//             }]
//         };

//         paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
//             if (error) {
//                 console.error("Payment execution error:", error.response);
//                 return res.status(500).json({ error: "Payment execution failed", details: error.response });
//             } else {
//                 console.log("Payment success:", JSON.stringify(payment));
//                 return res.status(200).json({
//                     message: "Payment completed successfully",
//                     payment
//                 });
//             }
//         });

//     } catch (error) {
//         console.error("Catch block error:", error.message);
//         return res.status(500).json({ error: "Something went wrong" });
//     }
// };

// exports.cancelPage = async(req,res)=>{

//     try {

//         res.render('cancel');

//     } catch (error) {
//         console.log(error.message);
//     }

// }
//-------------------------------------------------------------

//dynamic

exports.payProduct = async (req, res) => {
  try {
    // const { products, cardholderName } = req.body;
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson("Invalid or missing products array"));
    }

    const quantityMap = Object.fromEntries(
      products.map((item) => [item.id, item.quantity])
    );
    const productIds = Object.keys(quantityMap);

    const query = `SELECT id, name, price, stock FROM products WHERE id = ANY($1)`;
    const { rows: productData } = await db.query(query, [productIds]);

    const negativeStock = productData.filter((p) => p.stock < 0);
    if (negativeStock.length > 0) {
      const names = negativeStock.map((p) => p.name).join(", ");
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson(`Invalid or negative stock for: ${names}`));
    }

    const outOfStock = productData.filter((p) => quantityMap[p.id] > p.stock);
    if (outOfStock.length > 0) {
      const names = outOfStock.map((p) => p.name).join(", ");
      return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(`Out of stock: ${names}`));
    }

    if (productData.length !== productIds.length) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("One or more products not found"));
    }

    const items = productData.map((product) => ({
      name: product.name,
      sku: product.id.toString(),
      price: Number(product.price).toFixed(2),
      currency: "USD",
      quantity: quantityMap[product.id],
    }));

    const totalAmount = productData
      .reduce(
        (sum, product) => sum + product.price * quantityMap[product.id],
        0
      )
      .toFixed(2);

    const unitPrices = productData.map((product) => product.price);


    const create_payment_json = {
      intent: "sale",
      payer: { payment_method: "paypal" },
      redirect_urls: {
        return_url: "http://localhost:5001/success",
        cancel_url: "http://localhost:5001/cancel",
      },
      transactions: [
        {
          item_list: { items },
          amount: {
            currency: "USD",
            total: totalAmount,
          },
          description: "Purchase from Invader Store",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, payment) => {
      if (error) {
        console.error("PayPal create error:", error.response);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Payment creation failed", error.response));
      }

      const paymentId = payment.id;
      const approvalUrl = payment.links.find(
        (link) => link.rel === "approval_url"
      )?.href;

      // Save the session in DB
      const insertSession = `
          INSERT INTO paypal_sessions (payment_id, total_amount, currency, product_ids, product_quantities, unit_prices)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;

      await db.query(insertSession, [
        paymentId,
        totalAmount,
        "USD",
        // cardholderName || "PayPal User",
        `{${productIds.join(",")}}`,
        `{${Object.values(quantityMap).join(",")}}`,
        `{${unitPrices.join(",")}}`,
      ]);

      return res.status(STATUS_CODES.SUCCESS).json({ approvalUrl });
    });
  } catch (err) {
    console.error("Server error:", err.message);
    return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
  }
};

exports.successPage = async (req, res) => {
  try {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    // Fetch session data from DB
    const { rows } = await db.query(
      `SELECT * FROM paypal_sessions WHERE payment_id = $1`,
      [paymentId]
    );

    if (rows.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Payment session not found"));
    }

    const session = rows[0];
    const totalAmount = Number(session.total_amount).toFixed(2);

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: session.currency,
            total: totalAmount,
          },
        },
      ],
    };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      async (error, payment) => {
        const payerInfo = payment.payer.payer_info;
        const customerName = `${payerInfo.first_name} ${payerInfo.last_name}`;
        const customerEmail = payerInfo.email;
        const customerId = payerInfo.payer_id; // This is PayPal's customer ID

        if (error) {
          console.error("Execution error:", error.response);
          return res
            .status(STATUS_CODES.SERVER_ERROR)
            .json({
              error: "Payment execution failed",
              details: error.response,
            });
        }

        // const insertQuery = `
        //   WITH inserted_invoice AS (
        //     INSERT INTO invoices (id, customer_name, inv_amount, inv_currency, payment_gateway, payment_status, created_at)
        //     VALUES ($1, $2, $3, $4, $5, $6, NOW())
        //     RETURNING id
        //   )
        //   UPDATE products
        //   SET stock = stock - u.quantity
        //   FROM (SELECT UNNEST($7::int[]) AS id, UNNEST($8::int[]) AS quantity) AS u
        //   WHERE products.id = u.id;
        // `;
        const insertQuery = `
          WITH inserted_invoice AS (
            INSERT INTO invoices (id, customer_name, customer_email, customer_id, inv_amount, inv_currency, payment_gateway, payment_status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING id
          ), product_data AS (
            SELECT
              UNNEST($9::int[]) AS product_id,
              UNNEST($10::int[]) AS quantity,
              UNNEST($11::numeric[]) AS unit_price,
              UNNEST(ARRAY_FILL($6::varchar, ARRAY[ARRAY_LENGTH($9::int[], 1)])) AS currency
          ), inserted_products AS (
            INSERT INTO invoices_products (invoice_id, product_id, quantity, unit_price, currency)
            SELECT $1, product_id, quantity, unit_price, currency FROM product_data
          )
          UPDATE products
          SET stock = stock - product_data.quantity
          FROM product_data
          WHERE products.id = product_data.product_id;

        `;

        const values = [
          paymentId,
          // session.cardholder_name,
          customerName,
          customerEmail,
          customerId,
          session.total_amount,
          session.currency,
          "PayPal",
          "Successful",
          session.product_ids,
          session.product_quantities,
          session.unit_prices
        ];

        await db.query(insertQuery, values);

        return res.status(STATUS_CODES.SUCCESS).json({
          message: "Payment completed and invoice saved",
          payment,
        });
      }
    );
  } catch (error) {
    console.error("Error in success handler:", error.message);
    return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson("Internal Server Error"));
  }
};
