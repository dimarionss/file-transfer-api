const express = require('express')
const path = require('path')
const mongoose = require('mongoose');
const usersRoutes = require('../routes/users');
const filesRoutes = require('../routes/files');
const authRoutes = require('../routes/auth');
require('dotenv').config();


const dbUser = process.env.DB_USERNAME
const dbPassword = process.env.DB_PASSWORD
const dbUrl = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.k10msl5.mongodb.net/`
const PORT = process.env.PORT || 5000

const app = express()
app.use(express.json())

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

app.use('/api', usersRoutes)
app.use('/api', filesRoutes)
app.use('/api', authRoutes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

mongoose.connect(dbUrl);
const database = mongoose.connection


/* structure
USER: (TABLE USERS)
[GET /users/:id] 
- registration 
- login (session storage)
- edit profile 
- change password
- edit image (cropper)

MY FILES (drag-and-drop): (TABLE FILES)
[GET /files/:id] 
- list files
*/

const start = () => {
  try {
    database.on('error', (error) => {
      console.log(error)
    })

    database.once('connected', () => {
      console.log('Database Connected');
    })
    app.listen(PORT, () => {
      return console.log(`SERVER STARTED ON PORT ${PORT}`)
    })
  } catch (e) {
    console.log(e)
  }
}

start()