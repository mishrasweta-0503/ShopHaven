const express = require('express');

const ordersController = require('../controllers/ordersController');

const router = express.Router();

router.get('/', ordersController.getUserOrders); //get all orders for a particular user
router.get('/:orderId', ordersController.getOrderDetails); //get details of a particular order

module.exports = router;