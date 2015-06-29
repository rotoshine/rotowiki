var request = require('request');
var localEnv = require('../../config/local.env');
var TELEGRAM_SEND_MESSAGE_API = 'https://api.telegram.org/bot' + localEnv.TELEGRAM_BOT_TOKEN + '/sendMessage';

exports.hasTelegramSetup = function(){
  return localEnv && localEnv.TELEGRAM_BOT_TOKEN && localEnv.TELEGRAM_NOTIFY_CHAT_ID;
};

exports.sendNewDocumentMessage = function(document, callback){
  var message = encodeURI('위키에 새 문서가 등록되었습니다. "' + document.title + '" - ' +
    localEnv.DOMAIN + '/document-by-id/' + document.id);
  var requestUrl = TELEGRAM_SEND_MESSAGE_API + '?chat_id=' + localEnv.TELEGRAM_NOTIFY_CHAT_ID + '&text=' + message;

  request(requestUrl, function(err, res, result){
    if(err){
      console.log(err);
    }
    return callback(err, result);
  });
};
