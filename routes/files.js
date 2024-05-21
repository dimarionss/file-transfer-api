const express = require('express');
const multer = require('multer');
const authenticateToken = require('../middleware/authMiddleware');
const Files = require('../models/files');

const router = express.Router();

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/files/'); // Укажите путь, где будут храниться файлы
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Post Method для создания файла
router.post('/files', authenticateToken, upload.array('files', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded', success: false });
  }
  console.log(req.files)
  const fileDataArray = req.files.map(file => ({
    title: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    filename: file.filename,
    filepath: file.path,
    uploadedBy: req.body.uploadedBy  // userId
  }));

  try {
    const fileDataSave = await Files.insertMany(fileDataArray);
    res.status(200).json({ fileDataSave, success: true });
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }
});

// Get all Method для получения всех файлов
router.get('/files', authenticateToken, async (req, res) => {
  try {
    const files = await Files.find().populate('uploadedBy', 'firstname lastname email avatar');
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

// Get by ID Method для получения файла по ID
router.get('/files/:id', authenticateToken, async (req, res) => {
  try {
    const file = await Files.findById(req.params.id).populate('uploadedBy', 'firstname lastname email avatar');
    res.json({ file, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

// Get files by user ID Method
router.get('/files/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const files = await Files.find({ uploadedBy: userId }).populate('uploadedBy', 'firstname lastname email');
    res.json({ files, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});


// Update by ID Method для обновления файла по ID
router.patch('/files/:id', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    if (req.file) {
      updatedData.filename = req.file.filename;
      updatedData.filepath = req.file.path;
    }

    const options = { new: true };

    const result = await Files.findByIdAndUpdate(id, updatedData, options).populate('uploadedBy', 'firstname lastname email avatar');
    res.send(result);
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }
});

// Delete by ID Method для удаления файла по ID
router.delete('/files/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Files.findByIdAndDelete(id);
    res.send({ message: `File ${data.filename} has been deleted.`, success: true });
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }
});

module.exports = router;