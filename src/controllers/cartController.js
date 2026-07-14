const db = require('../config/db');

const createCart = async(req,res) => {
    try {
        const { user_id } = req.body;
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }
        const queryText = `
            INSERT INTO carts (user_id) 
            VALUES ($1) 
            ON CONFLICT (user_id) 
            DO UPDATE SET user_id = EXCLUDED.user_id 
            RETURNING *;
            `;
        const result = await db.query(queryText, [user_id]);
        const cart = result.rows[0];
        return res.status(200).json({ 
            success: true, 
            message: 'Cart initialized successfully', 
            data: cart 
          });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error initializing cart' });
        
    }
}

// 2. POST /api/cart/:cartId (Add/update item in cart)
const addItemToCart = async (req, res) => {
    try {
      const { cartId } = req.params;
      const { product_id, quantity } = req.body;

      if (!product_id || !quantity) {
        return res.status(400).json({ error: 'product_id and quantity are required' });
      }

      const queryText = `
        INSERT INTO cart_items (cart_id, product_id, quantity) 
        VALUES ($1, $2, $3)
        ON CONFLICT (cart_id, product_id) 
        DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
        RETURNING *;
      `;
      const result = await db.query(queryText,[cartId, product_id, quantity]);
      const cartItem = result.rows[0];
      return res.status(200).json({ 
        success: true, 
        message: 'Cart updated successfully', 
        data: cartItem 
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error adding item to cart' });
    }
  };
  
  // 3. GET /api/cart/:cartId (Get all items in the cart with product details)
  const getCartItems = async (req, res) => {
    try {
      const { cartId } = req.params;
      const queryText = 'select product_id,name,price,quantity from cart_items inner join products on cart_items.product_id = products.id WHERE cart_items.cart_id = $1'
      const result = await db.query(queryText, [cartId]);
      return res.status(200).json({ 
        success: true, 
        message: 'Cart updated successfully', 
        data: result.rows 
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error retrieving cart items' });
    }
  };

  const checkoutCart = async (req, res) => {
    try {
      const { cartId } = req.params;
      const { paymentInfo } = req.body; // Expecting payment card details
  
      // 1. VALIDATION: Check if cart has items and calculate total price
      const cartItemsQuery = `
        SELECT ci.product_id, ci.quantity, p.price, c.user_id 
        FROM cart_items ci
        INNER JOIN carts c ON ci.cart_id = c.id
        INNER JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
      `;
      const cartItemsResult = await db.query(cartItemsQuery, [cartId]);
  
      if (cartItemsResult.rows.length === 0) {
        return res.status(400).json({ error: 'Cart is empty or does not exist' });
      }
  
      const cartItems = cartItemsResult.rows;
      const userId = cartItems[0].user_id;
  
      // Calculate total order cost
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
      // 2. SIMULATE PAYMENT PROCESS
      if (!paymentInfo || !paymentInfo.cardNumber || !paymentInfo.expiry) {
        return res.status(400).json({ error: 'Payment processing failed: Missing payment details' });
      }
      
      // Simulate card validation (e.g., rejecting an invalid dummy number)
      if (paymentInfo.cardNumber === '0000000000000000') {
        return res.status(402).json({ error: 'Payment declined: Insufficient funds or invalid card' });
      }
  
      // 3. CREATE THE ORDER (Insert into orders)
      const createOrderQuery = `
        INSERT INTO orders (user_id, total_price, status)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const orderResult = await db.query(createOrderQuery, [userId, totalAmount, 'Paid']);
      const newOrder = orderResult.rows[0];
  
      // 4. TRANSFER ITEMS (Insert into order_items)
      for (const item of cartItems) {
        const createOrderItemQuery = `
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4);
        `;
        await db.query(createOrderItemQuery, [newOrder.id, item.product_id, item.quantity, item.price]);
      }
  
      // 5. CLEAR THE CART ITEMS (Emptying the user's cart after successful checkout)
      await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
  
      return res.status(201).json({
        success: true,
        message: 'Checkout successful! Order created.',
        order: {
          orderId: newOrder.id,
          totalAmount: totalAmount,
          status: newOrder.status,
          items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_checkout: item.price
          }))
        }
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error during checkout process' });
    }
  };
  
  module.exports = {
    createCart,
    addItemToCart,
    getCartItems,
    checkoutCart
  };