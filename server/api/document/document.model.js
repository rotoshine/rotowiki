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
  createdUserTwitterId: String,
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
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

DocumentSchema
  .virtual('subDocuments')
  .get(function(){
    return this._subDocuments;
  })
  .set(function(subDocuments){
    this._subDocuments = subDocuments
  });

module.exports = mongoose.model('Document', DocumentSchema);
