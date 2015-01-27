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
  },
  parent: {
    ref: 'Document',
    type: Schema.Types.ObjectId
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', DocumentSchema);
