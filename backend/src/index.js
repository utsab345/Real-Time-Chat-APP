const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const authRoutes = require('../routes/auth.route');
const cookieParser = require('cookie-parser')
const messageRoutes = require('../models/message.model')

dotenv.config();
require('../lib/db')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser)

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}




app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
});
