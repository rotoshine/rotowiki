/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Document = require('./document.model');

exports.register = function(socket) {
  /*Document.schema.post('save', function (doc) {
      onCreate(socket, doc);
  });*/

  Document.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
};

function onCreate(socket, doc, cb) {
  socket.emit('document:create', doc);
}

exports.onCreate = onCreate;

function onRemove(socket, doc, cb) {
  socket.emit('document:remove', doc);
}
