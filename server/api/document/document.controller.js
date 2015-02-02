'use strict';

var _ = require('lodash');

var Document = require('./document.model');
var DocumentHistory = require('../documentHistory/documentHistory.model');
var File = require('../file/file.model');
var fs = require('fs');

exports.find = function(req, res) {
  var query = {};


  if(req.query.hasOwnProperty('title')){
    query.title = new RegExp(req.query.title, 'i');
  }

  var queryRunner = Document
    .find(query);

  // 최근순 문서 요청인 경우
  if(req.query.hasOwnProperty('sort')){
    var sortQuery = {};
    sortQuery[req.query.sort] = req.query.asc || 1;
    sortQuery[req.query.sort] = sortQuery[req.query.sort];
    queryRunner
      .sort(sortQuery);
    console.log('sort query', sortQuery);
  }
  if(req.query.hasOwnProperty('recent')) {
    queryRunner
      .sort({ createdAt: -1 })
      .limit(10);
  }

  if(req.query.hasOwnProperty('page')){
    var page = req.query.page;
    var pageCount = 10;
    if(req.query.hasOwnProperty('pageCount')){
      pageCount = parseInt(req.query.pageCount);
    }

    queryRunner
      .skip((page - 1) * pageCount)
      .limit(pageCount);
  }

  queryRunner.exec(function (err, documents) {
    if(err) { return handleError(res, err); }
    return res.json(200, documents);
  });

};

exports.findByParent = function(req, res){
  var title = req.params.title;

  Document.findOne({title: title}, function(err, document){
    if(err){ return handleError(res, err); }
    if(document){
      Document.find({parent: document._id}, function(err, subDocuments){
        if(err){ return handleError(res, err); }
        return res.json(subDocuments);
      });
    }
  })
};

// Get a single document
exports.show = function(req, res) {
  Document
    .findOne({ title: req.params.title })
    .populate('parent')
    .exec(function (err, document) {
      if(err) { return handleError(res, err); }
      if(!document) { return res.send(404); }

      // read count 늘리기
      document.readCount = document.readCount + 1;
      document.save(function(){
        Document.find({parent: document._id}, function(err, subDocuments){
          if(err) { return handleError(res, err); }
          document.set('subDocuments', subDocuments);
          console.log(document);
          return res.json(document);
        });
      });
  });
};

function historyLoggingAndHandleDocument(document, statusCode, res){
  DocumentHistory.create({
    title: document.title,
    content: document.content,
    workingUserTwitterId: document.createdUserTwitterId,
    workingUser: document.createdUser
  }, function(){
    return res.json(statusCode, document);
  });
}

exports.create = function(req, res) {
  var document = req.body;
  Document.findOne({title: document.title}, function(err, existDocument){
    if(!existDocument){
      document.createdAt = new Date();
      document.updatedAt = new Date();
      document.createdUser = req.user._id;
      if(req.user.twitter !== undefined){
        document.createdUserTwitterId = req.user.twitter.screen_name;
      }
      Document.create(document, function(err) {
        if(err) { return handleError(res, err); }
        historyLoggingAndHandleDocument(document, 201, res);
      });
    }else{
      document.updatedAt = new Date();
      existDocument = _.merge(existDocument, document);
      existDocument.lastUpdatedUserTwitterId = req.user.twitter.screen_name;
      existDocument.save(existDocument, function(err) {
        if(err) { return handleError(res, err); }
        historyLoggingAndHandleDocument(existDocument, 200, res);
      });
    }
  });

};

// Updates an existing document in the DB.
exports.update = function(req, res) {
  Document.findOne({title: req.params.title}, function (err, document) {
    if (err) { return handleError(res, err); }
    if(!document) { return res.send(404); }
    var updated = _.merge(document, req.body);
    updated.lastUpdatedUserTwitterId = req.user.twitter.screen_name;
    updated.updatedAt = new Date();
    if(updated.parent && updated.parent._id !== undefined){
      updated.parent = updated.parent._id;
    }
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      historyLoggingAndHandleDocument(updated, 200, res);
    });
  });
};

// Deletes a document from the DB.
exports.destroy = function(req, res) {
  Document.findById(req.params.id, function (err, document) {
    if(err) { return handleError(res, err); }
    if(!document) { return res.send(404); }
    document.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

exports.random = function(req, res){
  Document.random(function(err, document){
    if(err){ return handleError(res, err); }
    return res.json(document);
  });
};

function handleError(res, err) {
  return res.send(500, err);
}


exports.findFileByDocumentId = function(req ,res){
  var fileId = req.params.fileId;

  File.findOne({_id: fileId}, function(err, file){
    if(err){ return handleError(res, err); }
    else{
      if(!file){
        return res.json(404, { message: '올바르지 않은 파일입니다.' });
      }else{
        fs.exists(file.path, function(exists){
          if(exists){
            fs.createReadStream(file.path).pipe(res);
          }else{
            return res.json(404, { message: '파일이 서버에 존재하지 않습니다.' });
          }
        });
      }
    }
  })
};

exports.uploadFile = function(req, res){
  var title = req.params.title;
  var uploadedFile = req.files.file;

  var file = new File({
    name: uploadedFile.name,
    originalName: uploadedFile.originalname,
    mimeType: uploadedFile.mimetype,
    path: uploadedFile.path,
    size: uploadedFile.size
  });

  file.save(function(err){
    if(err){ return handleError(res, err); }
    else{
      Document.findOne({title: title}, function(err, document){
        if(err){ return handleError(res, err); }
        else{
          if(!document){
            return handleError(res, new Error('존재하지 않는 문서에 파일을 추가하려하다니...!'));
          }else{
            document.files.push(file._id);
            document.save(function(err){
              if(err){ return handleError(res, err); }
              else{
                return res.json(200, file);
              }
            })
          }
        }
      })
    }
  });
};
