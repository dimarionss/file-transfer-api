const express = require('express');
const Users = require('../models/users');
const bcrypt = require('bcryptjs');
const authenticateToken = require('../middleware/authMiddleware');
const multer = require('multer');
const router = express.Router();

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/'); // Укажите путь, где будут храниться аватары
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Post Method для создания пользователя
router.post('/users', upload.single('avatar'), async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  const avatar = req.file ? req.file.filename : 'default_avatar.png';


  // Проверка на существующий email
  const existingUser = await Users.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists.' });
  }

  // Хэширование пароля
  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = new Users({
    firstname,
    lastname,
    email,
    password: hashedPassword,
    avatar
  });

  try {
    const userDataSave = await userData.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all Method
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await Users.find().populate('files');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

// Get by ID Method
router.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await Users.findById(req.params.id).populate('files');
    res.json({ user, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

// Update by ID Method
router.patch('/users/:id', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    if (req.file) {
      updatedData.avatar = req.file ? req.file.filename : 'default_avatar.png';
      console.log(req.file)
    }

    const options = { new: true };

    const result = await Users.findByIdAndUpdate(id, updatedData, options).populate('files');
    res.send({ message: 'User updated successfully.', user: result, success: true });
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }
});

// Delete by ID Method
router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Users.findByIdAndDelete(id);
    res.send({ message: `User ${user.email} has been deleted.`, user, success: true });
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }
});

module.exports = router;