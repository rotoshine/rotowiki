'use strict';

var Document = require('../../api/document/document.model');
var config = require('../../config/environment');
var querystring = require('querystring');
var marked = require('marked');

exports.render = function(title, res){
  title = querystring.unescape(title);

  Document
    .findOne({ title: title }, function(err, document){
      if(err){
        return res.send('올바르지 않은 페이지 요청입니다.' + err.message);
      }else if(document){
        if(document.content !== undefined && document.content !== ''){
          document.content = marked(document.content);
        }else{
          document.content = '문서 내용이 없습니다.';
        }

        return res.render('document.ejs', {
          document: document,
          wikiName: config.wikiName
        });
      }else{}
      return res.render('documentNotFound.ejs', {
        wikiName: config.wikiName,
        title: title
      });
    });
};
