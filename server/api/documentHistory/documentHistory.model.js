'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DocumentHistorySchema = new Schema({
  title: String,
  content: String,
  workingUser: {
    ref: 'User',
    type: Schema.Types.ObjectId
  },
  workingUserTwitterId: String,
  changeDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DocumentHistory', DocumentHistorySchema);
