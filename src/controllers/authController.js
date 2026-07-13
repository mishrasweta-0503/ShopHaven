//consists of actual logic functions that run when someone hits the route

const bcrypt = require('bcrypt');
const db = require('../config/db');

const registerUser = async (req, res) => {
  // Your logic steps will live inside this try/catch block
  try {
    
    // Step 1: Destructure email, password, first_name, last_name from req.body
    const {email,password,first_name,last_name} = req.body;
    
    // Step 2: Check if user already exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if(userCheck.rows.length > 0){
       return res.status(400).json({ error: "User already exists" }); 
    }
    
    // Step 3: Hash the plaintext password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Step 4: Insert the new user into your database
    // Hint: Use an 'INSERT INTO users ... RETURNING id, email, first_name, last_name' query
    const insertText = 'insert into users (email,password,first_name,last_name) values ($1,$2,$3,$4) RETURNING id, email, first_name, last_name;'
    const values = [email, hashedPassword, first_name, last_name]
    const result = await db.query(insertText, values);
    const newUser = result.rows[0];
    return res.status(201).json({ success: true, message: 'User created successfully',data:newUser }); 
    
    // Step 5: Send a successful 201 status response back to the client with the user data

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'User not created' });
  }
};

// Export the controller method so your router file can see it
module.exports = {
  registerUser,
};