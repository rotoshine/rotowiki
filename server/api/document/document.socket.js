/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Document = require('./document.model');

exports.register = function(socket) {
  Document.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Document.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('document:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('document:remove', doc);
}