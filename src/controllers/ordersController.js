const db = require('../config/db');

const getUserOrders = async(req,res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }
        const queryText = 'SELECT id, total_price, status, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC'
        const result = await db.query(queryText, [user_id]);
        const orders = result.rows;
        return res.status(200).json({ 
            success: true, 
            message: 'Cart initialized successfully', 
            data: orders 
          });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Orders could not be fetched' });
    }
}

const getOrderDetails = async(req,res) => {
    try {
        const {orderId} = req.params;
        const result = await db.query('SELECT oi.product_id, p.name, oi.quantity, oi.price FROM order_items oi INNER JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1',[orderId])
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order does not exist' });
        }
        const ordersDetails = result.rows[0];
        return res.status(200).json({success:true, message : 'Order with the particular id fetched',data:ordersDetails});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Orders could not be fetched' });
    }
}

module.exports = {getUserOrders,getOrderDetails}