const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Users = require('../models/users');
const multer = require('multer');
const router = express.Router();

const secret = 'your_jwt_secret_key'; // Секретный ключ для JWT, должен быть защищен и уникален

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

// Регистрация пользователя
router.post('/register', upload.single('avatar'), async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const avatar = req.file ? req.file.filename : 'default_avatar.png';

  // Проверка на существующий email
  const existingUser = await Users.findOne({ email }).populate('files');
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists.', success: false });
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
    const currentUser = await Users.findOne({ email }).populate('files');
    // Создание JWT
    const token = jwt.sign({ id: currentUser._id, email: currentUser.email }, secret, { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered successfully.', success: true, user: userDataSave, token });
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }
});

// Логин пользователя
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Поиск пользователя по email
  const user = await Users.findOne({ email }).populate('files');
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password.', success: false });
  }

  // Проверка пароля
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid email or password.', success: false });
  }

  // Создание JWT
  const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '1h' });

  res.status(200).json({ token, user, success: true });
});

module.exports = router;