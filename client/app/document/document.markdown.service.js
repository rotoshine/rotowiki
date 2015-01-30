'use strict';

angular.module('rotowikiApp')
  .service('markdownService', function ($sce) {
    return {
      unescapeHTML: function(html){
        // markdown.js가 강제로 <와 >를 html entity로 만드는 바람에 이런 짓을 함.
        // bracket 문자 치환 후 black list에 있는 element 제거
        return html
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/&quot;/gi, '"');
      },
      toHTML: function(html, escape){
        var html = markdown.toHTML(html);
        if(!escape){
          html = this.unescapeHTML(html);
        }
        return html;
      }
    }
  });
