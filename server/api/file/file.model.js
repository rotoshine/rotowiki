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
  path: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('File', FileSchema);
