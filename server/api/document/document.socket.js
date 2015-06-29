/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Document = require('./document.model');

exports.register = function(socket) {
  Document.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });

  socket.on('document:create', function(doc){
    socket.emit('document:create', doc);
  });

  socket.on('document:update', function(doc){
    socket.emit('document:update', doc);
  });
};


function onRemove(socket, doc, cb) {
  socket.emit('document:remove', doc);
}

exports.onRemove = onRemove;
