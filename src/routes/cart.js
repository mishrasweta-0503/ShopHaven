const express = require('express');

const cartController = require('../controllers/cartController');

const router = express.Router();

router.post('/', cartController.createCart);
router.post('/:cartId', cartController.addItemToCart);
router.get('/:cartId', cartController.getCartItems);
router.post('/:cartId/checkout', cartController.checkoutCart);

module.exports = router;