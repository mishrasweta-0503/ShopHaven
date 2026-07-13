const db = require('../config/db');

const getAllProducts = async(req,res) => {
    try {
        const { category } = req.query;
        let products;
        if(category){
            const result = await db.query('select * from products where category = $1')
            products = result.rows;
        } else {
            const result = await db.query('select * from products')
            products = result.rows
        }
        return res.status(200).json({success:true, message : 'Results fetched',data:products});

        
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Server error retrieving products' });
    }
}

const getProductById = async(req,res) => {
    try {
        const {id} = req.params;
        const result = await db.query('select * from products where id = $1', [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product does not exist' });
        }
        const product = result.rows[0];
        return res.status(200).json({success:true, message : 'Product with the particular id fetched',data:product});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error retrieving product detail' });
    }
}
module.exports = {getAllProducts,getProductById}