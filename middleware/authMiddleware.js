const jwt = require('jsonwebtoken');
const Users = require('../models/users');

const secret = 'your_jwt_secret_key'; // Секретный ключ для JWT, должен быть защищен и уникален

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secret, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = await Users.findById(user.id).select('-password'); // Исключаем пароль из данных пользователя
    next();
  });
};

module.exports = authenticateToken;