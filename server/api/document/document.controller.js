'use strict';

var _ = require('lodash');
var Document = require('./document.model');

exports.find = function(req, res) {
  var query = {};

  var queryRunner = Document
    .find(query);

  // 최근순 문서 요청인 경우
  if(req.query.hasOwnProperty('recent')) {
    queryRunner
      .sort({ createdAt: -1 })
      .limit(10);

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
}

// Get a single document
exports.show = function(req, res) {
  Document.findOne({ title: req.params.title }, function (err, document) {
    if(err) { return handleError(res, err); }
    if(!document) { return res.send(404); }

    Document.find({parent: document._id}, function(err, subDocuments){
      if(err) { return handleError(res, err); }
      document.subDocuments = subDocuments;
      return res.json(document);
    });
  });
};


exports.create = function(req, res) {
  var document = req.body;
  Document.findOne({title: document.title}, function(err, existDocument){
    if(!existDocument){
      document.createdAt = new Date();
      document.createdUser = req.user._id;
      Document.create(document, function(err) {
        if(err) { return handleError(res, err); }
        return res.json(201, document);
      });
    }else{
      document.updatedAt = new Date();
      existDocument = _.merge(existDocument, document);
      Document.update(req.body, function(err, document) {
        if(err) { return handleError(res, err); }
        return res.json(201, document);
      });
    }
  });

};

// Updates an existing document in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Document.findById(req.params.id, function (err, document) {
    if (err) { return handleError(res, err); }
    if(!document) { return res.send(404); }
    var updated = _.merge(document, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, document);
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

function handleError(res, err) {
  return res.send(500, err);
}
