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
  
  module.exports = {
    createCart,
    addItemToCart,
    getCartItems
  };