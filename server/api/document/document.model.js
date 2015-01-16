'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DocumentSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  content: String,
  createdUser: {
    ref: 'User',
    type: Schema.Types.ObjectId
  }
});

module.exports = mongoose.model('Document', DocumentSchema);
