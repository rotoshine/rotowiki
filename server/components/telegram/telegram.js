var request = require('request');
var localEnv = require('../../config/local.env');
var TELEGRAM_SEND_MESSAGE_API = 'https://api.telegram.org/bot' + localEnv.TELEGRAM_BOT_TOKEN + '/sendMessage';

exports.hasTelegramSetup = function(){
  return localEnv && localEnv.TELEGRAM_BOT_TOKEN && localEnv.TELEGRAM_NOTIFY_CHAT_ID;
};

exports.sendNewDocumentMessage = function(document, callback){
  var message = '로토위키에 새 문서가 등록되었습니다. "' + document.title + '" - ' + localEnv.DOMAIN + '/document-by-id/' + document.id;

  request(TELEGRAM_SEND_MESSAGE_API + '?chat_id=' + localEnv.TELEGRAM_NOTIFY_CHAT_ID + '&text=' + message, function(err, res, result){
    if(result){
      result = JSON.parse(result);
    }
    callback(err, result);
  });
};
