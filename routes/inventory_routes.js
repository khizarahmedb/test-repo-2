const express = require('express')
const router = express.Router()
const {addInventory, editInventory, getAllInventory, getByID, deleteInventory} = require('../controllers/inventory')
const {validateUser, validateAdmin} = require('../middleware/auth_mv')

router.post('/inventory/add', validateUser, validateAdmin, addInventory)
router.put('/inventory/:id', validateUser, validateAdmin, editInventory)
router.get('/inventory', validateUser, validateAdmin, getAllInventory)
router.get('/inventory/:id', validateUser, validateAdmin, getByID)
router.delete('/inventory/:id', validateUser, validateAdmin, deleteInventory)

module.exports = router
