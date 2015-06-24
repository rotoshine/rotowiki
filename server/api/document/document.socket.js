/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Document = require('./document.model');

exports.register = function(socket) {
  Document.schema.pre('save', function (next) {
    if(this.isNew) {
      onCreate(socket, this);
    }
    next();
  });

  Document.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });


  socket.on('document:update', function(doc){
    console.log(JSON.parse(doc));
    socket.emit('document:update', doc);
  });
};

function onCreate(socket, doc, cb) {
  socket.emit('document:create', doc);
}

exports.onCreate = onCreate;

function onRemove(socket, doc, cb) {
  socket.emit('document:remove', doc);
}

exports.onRemove = onRemove;

function onModify(socket, doc){
  // 업데이트 된지 1분 이내의 것만 알리게 하기 위함
  var updatedTime = new Date() - doc.updatedAt;
  if(updatedTime && updatedTime >= ONE_MINUTE){
    socket.emit('document:update', doc);
  }
}
