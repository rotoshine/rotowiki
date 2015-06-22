/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Document = require('./document.model');

exports.register = function(socket) {
  Document.schema.pre('save', function (next) {
    if(this.isNew) {
      onCreate(socket, this);
    }else{
      onModify(socket, this);
    }
    next();
  });

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

exports.onRemove = onRemove;

var ONE_MINUTE = 1000 * 60;
function onModify(socket, doc){
  // 업데이트 된지 1분 이후의 것만 알리게 하기 위함
  var updatedTime = new Date() - doc.updatedAt;

  if(updatedTime && updatedTime >= ONE_MINUTE){
    socket.emit('document:update', doc);
  }
}
