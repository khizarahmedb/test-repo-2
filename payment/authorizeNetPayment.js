require("dotenv").config();
const { APIContracts, APIControllers } = require("authorizenet");
const { db } = require('../config/db_config')
const { STATUS_CODES } = require('../constants/status_codes');
const { errorJson, successJson, Messages } = require('../constants/messages');

const { API_LOGIN_ID, TRANSACTION_KEY, ENVIRONMENT } = process.env;

// exports.makePayment = (cardNumber, expiry, cvv, cardholderName, amount, callback) => {
//   try {
//     if (!cardNumber || !expiry || !cvv || !cardholderName || !amount) {
//       return callback({ success: false, message: "Missing required fields" });
//     }

//     const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
//     merchantAuthenticationType.setName(API_LOGIN_ID);
//     merchantAuthenticationType.setTransactionKey(TRANSACTION_KEY);

//     const creditCard = new APIContracts.CreditCardType();
//     creditCard.setCardNumber(cardNumber);
//     creditCard.setExpirationDate(expiry);
//     creditCard.setCardCode(cvv);

//     const paymentType = new APIContracts.PaymentType();
//     paymentType.setCreditCard(creditCard);

//     const orderDetails = new APIContracts.OrderType();
//     orderDetails.setInvoiceNumber("INV-12345");
//     orderDetails.setDescription("Payment for Order #12345");

//     const transactionRequestType = new APIContracts.TransactionRequestType();
//     transactionRequestType.setTransactionType(
//       APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
//     );
//     transactionRequestType.setPayment(paymentType);
//     transactionRequestType.setAmount(amount);
//     transactionRequestType.setOrder(orderDetails);

//     const createRequest = new APIContracts.CreateTransactionRequest();
//     createRequest.setMerchantAuthentication(merchantAuthenticationType);
//     createRequest.setTransactionRequest(transactionRequestType);

//     const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());

//     ctrl.execute(() => {
//       try {
//         const apiResponse = ctrl.getResponse();
//         const response = new APIContracts.CreateTransactionResponse(apiResponse);


//         if (
//           response !== null &&
//           response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK
//         ) {
//           const transactionResponse = response.getTransactionResponse();
//           if (
//             transactionResponse !== null &&
//             transactionResponse.getMessages() !== null
//           ) {
//             return callback(null, {
//               success: true,
//               transactionId: transactionResponse.getTransId(),
//               message: transactionResponse.getMessages().getMessage()[0].getDescription(),
//             });
//           } else {
//             return callback({
//               success: false,
//               message: "Transaction failed",
//               error:
//                 transactionResponse && transactionResponse.getErrors()
//                   ? transactionResponse.getErrors().getError()[0].getErrorText()
//                   : "Unknown error",
//             });
//           }
//         } else {
//           return callback({
//             success: false,
//             message: "Transaction failed",
//             error: response.getMessages().getMessage()[0].getText() || "Unknown error",
//           });
//         }
//       } catch (error) {
//         return callback({ success: false, message: "Error processing transaction", error: error.message });
//       }
//     });
//   } catch (error) {
//     return callback({ success: false, message: "Unexpected error occurred", error: error.message });
//   }
// };

// module.exports = { makePayment };


// exports.makePayment = (cardNumber, expiry, cvv, cardholderName, amount, callback) => {
//   try {
//     if (!cardNumber || !expiry || !cvv || !cardholderName || !amount) {
//       return callback({ success: false, message: "Missing required fields" });
//     }

//     const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
//     merchantAuthenticationType.setName(API_LOGIN_ID);
//     merchantAuthenticationType.setTransactionKey(TRANSACTION_KEY);

//     const creditCard = new APIContracts.CreditCardType();
//     creditCard.setCardNumber(cardNumber);
//     creditCard.setExpirationDate(expiry);
//     creditCard.setCardCode(cvv);

//     const paymentType = new APIContracts.PaymentType();
//     paymentType.setCreditCard(creditCard);

//     const orderDetails = new APIContracts.OrderType();
//     orderDetails.setInvoiceNumber(`INV-${Date.now()}`);
//     orderDetails.setDescription("Payment for Order #12345");

//     const transactionRequestType = new APIContracts.TransactionRequestType();
//     transactionRequestType.setTransactionType(
//       APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
//     );
//     transactionRequestType.setPayment(paymentType);
//     transactionRequestType.setAmount(amount);
//     transactionRequestType.setOrder(orderDetails);

//     const createRequest = new APIContracts.CreateTransactionRequest();
//     createRequest.setMerchantAuthentication(merchantAuthenticationType);
//     createRequest.setTransactionRequest(transactionRequestType);

//     const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());

//     ctrl.execute(() => {
//       try {
//         const apiResponse = ctrl.getResponse();
//         const response = new APIContracts.CreateTransactionResponse(apiResponse);
//         console.log("Authorize.Net Full Response:", JSON.stringify(response, null, 2));

//         if (
//           response !== null &&
//           response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK
//         ) {
//           const transactionResponse = response.getTransactionResponse();
//           if (
//             transactionResponse !== null &&
//             transactionResponse.getMessages() !== null
//           ) {
//             const transactionId = transactionResponse.getTransId();
//             const paymentStatus = "Successful"; 

//             const insertQuery = `
//               INSERT INTO invoices (id, customer_name, inv_amount, inv_currency, 
//                                     payment_gateway, payment_status, created_at)
//               VALUES ($1, $2, $3, $4, $5, $6, NOW())
//               RETURNING id;
//             `;

//             const values = [
//               transactionId,
//               cardholderName, // as customer name
//               amount,
//               "USD",
//               "Card",
//               paymentStatus
//             ];

//             db.query(insertQuery, values)
//               .then(() => {
//                 return callback(null, {
//                   success: true,
//                   transactionId,
//                   message: transactionResponse.getMessages().getMessage()[0].getDescription(),
//                 });
//               })
//               .catch((dbError) => {
//                 console.error("Database Error:", dbError);
//                 return callback({
//                   success: false,
//                   message: "Payment successful but failed to save invoice",
//                   error: dbError.message,
//                 });
//               });
//           } else {
//             return callback({
//               success: false,
//               message: "Transaction failed",
//               error:
//                 transactionResponse && transactionResponse.getErrors()
//                   ? transactionResponse.getErrors().getError()[0].getErrorText()
//                   : "Unknown error",
//             });
//           }
//         } else {
//           return callback({
//             success: false,
//             message: "Transaction failed",
//             error: response.getMessages().getMessage()[0].getText() || "Unknown error",
//           });
//         }
//       } catch (error) {
//         return callback({ success: false, message: "Error processing transaction", error: error.message });
//       }
//     });
//   } catch (error) {
//     return callback({ success: false, message: "Unexpected error occurred", error: error.message });
//   }
// };


exports.makePayment = async (req, res) => {
  try {
    const { products, cardNumber, expiry, cvv, cardholderName } = req.body;

    if (!products || !cardNumber || !expiry || !cvv || !cardholderName) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Missing required fields"))
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Invalid or missing products array"))
    }

    const quantityMap = Object.fromEntries(products.map(item => [item.id, item.quantity]));
    const productIds = Object.keys(quantityMap);
    

    const checkProduct = `SELECT id, name, price, stock FROM products WHERE id = ANY($1)`
    const { rows: productData } = await db.query(checkProduct, [productIds])

    const outOfStockProducts = productData.filter(product => {
      const selectedQuantity = quantityMap[product.id];
      return selectedQuantity > product.stock;
    });

    // If any product exceeds stock, return an error
    if (outOfStockProducts.length > 0) {
      const productNames = outOfStockProducts.map(p => p.name).join(", ");
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorJson(`The following products exceed stock: ${productNames}`),
      );
    }


    if (productData.length !== productIds.length) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorJson(`One or more products not found`),
      );
    }

    const totalAmount = productData.reduce((sum, product, index) => {
      return sum + product.price * quantityMap[product.id];
    }, 0);

    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(API_LOGIN_ID);
    merchantAuthenticationType.setTransactionKey(TRANSACTION_KEY);

    const creditCard = new APIContracts.CreditCardType();
    creditCard.setCardNumber(cardNumber);
    creditCard.setExpirationDate(expiry);
    creditCard.setCardCode(cvv);

    const paymentType = new APIContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    const orderDetails = new APIContracts.OrderType();
    orderDetails.setInvoiceNumber(`INV-${Date.now()}`);
    orderDetails.setDescription("Payment for Order #12345");

    const transactionRequestType = new APIContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(
      APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
    );
    transactionRequestType.setPayment(paymentType);
    transactionRequestType.setAmount(totalAmount);
    transactionRequestType.setOrder(orderDetails);

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());

    ctrl.execute(() => {
      try {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.CreateTransactionResponse(apiResponse);
        console.log("Authorize.Net Full Response:", JSON.stringify(response, null, 2));

        if (
          response !== null &&
          response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK
        ) {
          const transactionResponse = response.getTransactionResponse();
          if (
            transactionResponse !== null &&
            transactionResponse.getMessages() !== null
          ) {
            const transactionId = transactionResponse.getTransId();
            const paymentStatus = "Successful";

            // const insertQuery = `
            //   INSERT INTO invoices (id, customer_name, inv_amount, inv_currency, 
            //                         payment_gateway, payment_status, created_at)
            //   VALUES ($1, $2, $3, $4, $5, $6, NOW())
            //   RETURNING id;
            // `;
            const insertQuery = `
                WITH inserted_invoice AS (
                    INSERT INTO invoices (id, customer_name, inv_amount, inv_currency, 
                                        payment_gateway, payment_status, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW())
                    RETURNING id
                )
                UPDATE products
                SET stock = stock - u.quantity
                FROM (SELECT UNNEST($7::int[]) AS id, UNNEST($8::int[]) AS quantity) AS u
                WHERE products.id = u.id;
                `;

            const values = [
              transactionId,
              cardholderName,
              totalAmount,
              "USD",
              "Card",
              paymentStatus,
              `{${productIds.join(',')}}`, // Convert array to PostgreSQL format
              `{${Object.values(quantityMap).join(',')}}`
            ];


            // const values = [
            //   transactionId,
            //   cardholderName, // as customer name
            //   amount,
            //   "USD",
            //   "Card",
            //   paymentStatus
            // ];

            db.query(insertQuery, values)
              .then(() => {
                return res.status(STATUS_CODES.SUCCESS).json(
                  successJson(
                    transactionResponse,
                    transactionResponse.getMessages().getMessage()[0].getDescription(),
                  ),
                );
                // return callback(null, {
                //   success: true,
                //   transactionId,
                //   message: transactionResponse.getMessages().getMessage()[0].getDescription(),
                // });
              })
              .catch((dbError) => {
                console.error("Database Error:", dbError);
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                  errorJson(
                    dbError.message,
                    // "Payment successful but failed to save invoice",
                  ),
                );

                // return callback({
                //   success: false,
                //   message: "Payment successful but failed to save invoice",
                //   error: dbError.message,
                // });
              });
          } else {
            return res.status(STATUS_CODES.BAD_REQUEST).json(
              errorJson(
                transactionResponse && transactionResponse.getErrors()
                  ? transactionResponse.getErrors().getError()[0].getErrorText()
                  : "Unknown error",
              ),
            );
            // return callback({
            //   success: false,
            //   message: "Transaction failed",
            //   error:
            //     transactionResponse && transactionResponse.getErrors()
            //       ? transactionResponse.getErrors().getError()[0].getErrorText()
            //       : "Unknown error",
            // });
          }
        } else {
          return res.status(STATUS_CODES.BAD_REQUEST).json(
            errorJson(
              response.getMessages().getMessage()[0].getText() || "Unknown error"
            ),
          );
          // return callback({
          //   success: false,
          //   message: "Transaction failed",
          //   error: response.getMessages().getMessage()[0].getText() || "Unknown error",
          // });
        }
      } catch (error) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(
          errorJson(
            error.message,
            // "Error processing transaction"
          ),
        );

        // return res.status(STATUS_CODES.BAD_REQUEST).json(
        //   errorJson(
        //     "Error processing transaction"
        //   ),
        // );
        // return callback({ success: false, message: "Error processing transaction", error: error.message });
      }
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(error.message));
  }
};
