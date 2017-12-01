const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = function (db) {
  const FileSchema = new Schema({
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

  db.model('File', FileSchema);
}
