const db = require('../config/db');

const getAllUsers = async(req,res) => {
    try {
        const result = await db.query('select id, email, first_name, last_name from users')
        return res.status(200).json({ success: true, data: result.rows });
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Server error retrieving users' });
    }
}

const getUserById = async(req,res) => {
    try {
        const {id} = req.params;
        const result = await db.query('select id, email, first_name, last_name from users where id=$1',[id])
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User does not exist' });
        }
        const product = result.rows[0];
        return res.status(200).json({success:true, message : 'User with the particular id fetched',data:product});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error retrieving user detail' });
    }
}
const updateUser = async(req,res) => {
    try {
        const {id} = req.params;
        const { email, first_name, last_name } = req.body;
        const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id])
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User does not exist' }); 
        }
        const updateText = 'UPDATE users SET email = $1, first_name = $2, last_name = $3 WHERE id = $4 RETURNING id, email, first_name, last_name';
        const values = [email, first_name, last_name, id];
        const result = await db.query(updateText, values);
        const updatedUser = result.rows[0];
        return res.status(200).json({success: true,message: 'User updated successfully',data: updatedUser})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error updating user' });    
    }
}
module.exports = {getAllUsers,getUserById,updateUser}