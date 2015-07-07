'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FileSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: Number,
  path: {
    type: String,
    required: true
  },
  document: {
    ref: 'Document',
    type: Schema.Types.ObjectId
  }
});

module.exports = mongoose.model('File', FileSchema);
