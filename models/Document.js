const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = function (db) {
  const DocumentSchema = new Schema({
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
    readCount: {
      type: Number,
      default: 0
    },
    // migration 이후 필드 삭제할 것.
    parent: {
      required: false,
      ref: 'Document',
      type: Schema.Types.ObjectId
    },
    parents: [{
      required: false,
      ref: 'Document',
      type: Schema.Types.ObjectId
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
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

  DocumentSchema.statics.findByTitle = async function (title, callback) {
    return this.findOne({ title })
  };

  DocumentSchema.statics.random = async function () {
    try {
      const count = await this.count();
      const rand = Math.floor(Math.random() * count);     
      return await this.findOne().skip(rand).exec();
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  DocumentSchema
    .virtual('subDocuments')
    .get(function () {
      return this._subDocuments;
    })
    .set(function (subDocuments) {
      this._subDocuments = subDocuments
    });

  DocumentSchema
    .virtual('subDocumentsCount')
    .get(function () {
      return this._subDocumentsCount;
    })
    .set(function (subDocumentsCount) {
      this._subDocumentsCount = subDocumentsCount;
    });

  db.model('Document', DocumentSchema);
};