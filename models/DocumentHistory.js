const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = function (db) {
  const DocumentHistorySchema = new Schema({
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

  db.model('DocumentHistory', DocumentHistorySchema);
}
