const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: false,
    trim: true
  },
  lastname: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true
}
);

usersSchema.virtual('files', {
  ref: 'Files',
  localField: '_id',
  foreignField: 'uploadedBy'
});

module.exports = mongoose.model('Users', usersSchema);