const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  mimetype: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  filename: {
    type: String,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
},
  { timestamps: true });


module.exports = mongoose.model('Files', pdfSchema);