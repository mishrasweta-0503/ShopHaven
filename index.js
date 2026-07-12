require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const db = require('./src/config/db');

app.get('/', (req, res) => {
  res.send('ecoomerce app is running!');
});

app.get('/test-db', async (req, res) => {
    try {
      // This SQL query asks Postgres for the current time
      const result = await db.query('SELECT NOW();');
      res.json({
        message: 'Database connected successfully!',
        timestamp: result.rows[0].now,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database connection failed!', details: err.message });
    }
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});