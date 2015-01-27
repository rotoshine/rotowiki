/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var DocumentHistory = require('./documentHistory.model');

exports.register = function(socket) {
  DocumentHistory.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  DocumentHistory.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('documentHistory:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('documentHistory:remove', doc);
}