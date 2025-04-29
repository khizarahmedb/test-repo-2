const express = require('express')
const router = express.Router()
const {addProduct, editProduct, getAllProducts, getProductById, deleteProduct, sellProduct, getAllProductsOfStock} = require('../controllers/products')
const {validateUser, validateAdmin} = require('../middleware/auth_mv')
const upload = require('../middleware/multer_mv')

// router.post('/product/add-product', validateUser, upload.single("image"),addProduct)

router.post('/product/add', validateUser, validateAdmin, addProduct)
router.post('/product/sell-product', validateUser, validateAdmin, sellProduct)
router.put('/product/:id', validateUser, editProduct)
router.get('/product', validateUser, getAllProducts)
router.get('/product/:id', validateUser, getProductById)
router.get('/product/get-by-stock-id/:stock_id', validateUser, getAllProductsOfStock)
router.delete('/product/:id', validateUser, deleteProduct)

module.exports = router