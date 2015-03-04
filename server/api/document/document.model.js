'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var DocumentSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  content: String,
  createdUserTwitterId: String,
  lastUpdatedUserTwitterId: String,
  createdUser: {
    ref: 'User',
    type: Schema.Types.ObjectId
  },
  updateCount: {
    type: Number,
    default: 0
  },
  readCount: {
    type: Number,
    default: 0
  },
  parent: {
    required: false,
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
  },
  hashTag: String,
  files: [{
    ref: 'File',
    type: Schema.Types.ObjectId
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  likeUsers: [{
    type: Schema.Types.ObjectId
  }],
  postScripts: [{
    indexNumber: Number,
    content: String
  }]
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

DocumentSchema.statics.findByTitle = function(title, callback){
  this.findOne({title: title}, callback);
};

DocumentSchema.statics.random = function(callback){
  var that = this;
  this.count(function(err, count){
    if(err){
      return callback(err);
    }else{
      var rand = Math.floor(Math.random() * count);
      that.findOne().skip(rand).exec(callback);
    }
  });
};

DocumentSchema
  .virtual('subDocuments')
  .get(function(){
    return this._subDocuments;
  })
  .set(function(subDocuments){
    this._subDocuments = subDocuments
  });

module.exports = mongoose.model('Document', DocumentSchema);
