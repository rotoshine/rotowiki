'use strict';

var _ = require('lodash');
var DocumentHistory = require('./documentHistory.model');

// Get list of documentHistorys
exports.index = function(req, res) {
  DocumentHistory.find(function (err, documentHistorys) {
    if(err) { return handleError(res, err); }
    return res.json(200, documentHistorys);
  });
};

// Get a single documentHistory
exports.show = function(req, res) {
  DocumentHistory.findById(req.params.id, function (err, documentHistory) {
    if(err) { return handleError(res, err); }
    if(!documentHistory) { return res.send(404); }
    return res.json(documentHistory);
  });
};

// Creates a new documentHistory in the DB.
exports.create = function(req, res) {
  DocumentHistory.create(req.body, function(err, documentHistory) {
    if(err) { return handleError(res, err); }
    return res.json(201, documentHistory);
  });
};

// Updates an existing documentHistory in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  DocumentHistory.findById(req.params.id, function (err, documentHistory) {
    if (err) { return handleError(res, err); }
    if(!documentHistory) { return res.send(404); }
    var updated = _.merge(documentHistory, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, documentHistory);
    });
  });
};

// Deletes a documentHistory from the DB.
exports.destroy = function(req, res) {
  DocumentHistory.findById(req.params.id, function (err, documentHistory) {
    if(err) { return handleError(res, err); }
    if(!documentHistory) { return res.send(404); }
    documentHistory.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}