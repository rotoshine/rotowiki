'use strict';

var _ = require('lodash');

var Document = require('./document.model');
var DocumentHistory = require('../documentHistory/documentHistory.model');
var File = require('../file/file.model');
var fs = require('fs');
var express = require('express');


exports.find = function(req, res) {
  var query = {};


  if(req.query.hasOwnProperty('title')){
    query.title = new RegExp(req.query.title, 'i');
  }

  if(req.query.hasOwnProperty('hashtag')){
    query.hashtag = new RegExp(req.query.title, 'i');
  }

  if(req.query.hasOwnProperty('isToday') && !!req.query.isToday){
    var currentDate = new Date();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);

    query.createdAt = {
      '$gte': currentDate
    };
  }

  if(req.query.sort === 'likeCount'){
    query.likeCount = {
      '$gt': 0
    };
  }

  console.log(JSON.stringify(req.query) + ' ==> running query:', query);
  var queryRunner = Document
    .find(query);

  if(req.query.hasOwnProperty('sort')){
    var sortQuery = {};
    sortQuery[req.query.sort] = req.query.asc || 1;
    sortQuery[req.query.sort] = sortQuery[req.query.sort];
    queryRunner
      .sort(sortQuery);
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

  Document.findByTitle(title, function(err, document){
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
  var query = {};
  if(req.url.indexOf('by-id') > -1 && req.params.hasOwnProperty('documentId')){
    query = {
      _id: req.params.documentId
    }
  }else if(req.params.hasOwnProperty('title')){
    query = {
      title: req.params.title
    };
  }

  Document
    .findOne(query)
    .populate('parent')
    .exec(function (err, document) {
      if(err) { return handleError(res, err); }
      if(!document) { return res.send(404); }

      // read count 늘리기
      increaseReadCount(document.title, function(){
        Document.find({parent: document._id}, function(err, subDocuments){
          if(err) { return handleError(res, err); }

          document.set('subDocuments', subDocuments);

          return res.json(document);
        });
      });
  });
};

function increaseReadCount(title, callback){
  Document.update(
    {
      title: title
    },
    {
      $inc: { readCount: 1 }
    }, callback);
}

function historyLoggingAndHandleDocument(document, currentUser, statusCode, res){
  DocumentHistory.create({
    title: document.title,
    content: document.content,
    workingUserTwitterId: currentUser.twitter.screen_name,
    workingUser: currentUser._id
  }, function(){
    return res.json(statusCode, document);
  });
}

exports.create = function(req, res) {
  var document = req.body;
  Document.findByTitle(document.title, function(err, existDocument){
    if(!existDocument){
      document.createdAt = new Date();
      document.updatedAt = new Date();
      document.createdUser = req.user._id;
      if(req.user.twitter !== undefined){
        document.createdUserTwitterId = req.user.twitter.screen_name;
      }
      Document.create(document, function(err) {
        if(err) { return handleError(res, err); }

        historyLoggingAndHandleDocument(document, req.user, 201, res);
      });
    }else{
      document.updatedAt = new Date();
      existDocument = _.merge(existDocument, document);
      existDocument.lastUpdatedUserTwitterId = req.user.twitter.screen_name;
      existDocument.save(existDocument, function(err) {
        if(err) { return handleError(res, err); }
        historyLoggingAndHandleDocument(existDocument, req.user, 200, res);
      });
    }
  });

};

// Updates an existing document in the DB.
exports.update = function(req, res) {
  Document.findByTitle(req.params.title, function (err, document) {
    if (err) { return handleError(res, err); }
    if(!document) { return res.send(404); }
    var updated = _.merge(document, req.body);
    updated.lastUpdatedUserTwitterId = req.user.twitter.screen_name;
    updated.updatedAt = new Date();

    if(req.body.changedDocumentTitle){
      updated.title = req.body.changedDocumentTitle;
    }
    if(updated.parent && updated.parent._id !== undefined){
      updated.parent = updated.parent._id;
    }

    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      historyLoggingAndHandleDocument(updated, req.user, 200, res);
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

exports.like = function(req, res){
  var userId = req.user._id;
  Document
    .findOne({
      title: req.params.title,
      likeUsers: {
        $ne: userId
      }
    }, function(err, document){
      if(err) {
        return handleError(res, err);
      }else{
        if(document){
          document.likeCount = document.likeCount + 1;
          document.likeUsers.push(userId);
          document.save(function(err){
            if(err){
              return handleError(res, err);
            }else{
              return res.json(200, {message: 'like complete.', likeCount: document.likeCount });
            }
          });
        }else{
          return res.json(500, {message: 'already like document.'});
        }
      }
    });
};

exports.unlike = function(req, res){
  var userId = req.user._id;

  var query = {
    title: req.params.title,
    likeUsers: userId
  };
  Document
    .findOne(query, function(err, document){
      if(err) {
        return handleError(res, err);
      }else{
        if(document){
          document.likeCount = document.likeCount - 1;
          document.likeUsers = _.reject(req.user._id);

          document.save(function(err){
            if(err){
              return handleError(res, err);
            }else{
              return res.json(200, {message: 'unlike complete.', likeCount: document.likeCount });
            }
          });
        }else{
          return res.json(500, {message: 'not like document.'});
        }
      }
    });

};

exports.uploadFile = function(req, res){
  var title = req.params.title;
  var uploadedFile = req.files.file;

  fs.exists(uploadedFile.path, function(exists){
    if(exists){
      var file = new File({
        name: uploadedFile.name,
        originalName: uploadedFile.originalname,
        mimeType: uploadedFile.mimetype,
        path: uploadedFile.path,
        size: uploadedFile.size
      });

      // 업로드가 제대로 됐는지 확인.
      // 업로드된 파일이 없으면 용량 초과해서 지운 것.

      file.save(function(err) {
        if (err) {
          return handleError(res, err);
        }
        else {
          Document.findByTitle(title, function (err, document) {
            if (err) {
              return handleError(res, err);
            }
            else {
              if (!document) {
                return handleError(res, new Error('존재하지 않는 문서에 파일을 추가하려하다니...!'));
              } else {
                document.files.push(file._id);
                document.save(function (err) {
                  if (err) {
                    return handleError(res, err);
                  }
                  else {
                    console.log(title + ' 문서에 파일 추가됨.' + file.name);
                    return res.json(200, file);
                  }
                })
              }
            }
          })
        }
      });
    }else{
      res.json(500, {message: '업로드 에러 발생'});
    }
  });
};
