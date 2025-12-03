// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const uploadRouter = require('./src/routes/uploadRouter');
const { sequelize } = require('./src/db/models');

app.use(express.json());
app.use('/api/files', uploadRouter);

// connect DB
(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    // optionally sync: await sequelize.sync({ alter: true });
  } catch (err) {
    console.error('DB connection failed', err);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server listening on ${PORT}`));
