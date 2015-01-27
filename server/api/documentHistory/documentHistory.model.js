'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DocumentHistorySchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('DocumentHistory', DocumentHistorySchema);