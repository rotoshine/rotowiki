'use strict';

angular.module('rotowikiApp')
  .service('markdownService', function () {
    var removeTags = [
      'script'
    ];

    return {
      unescapeHTML: function(html){
        // markdown.js가 강제로 <와 >를 html entity로 만드는 바람에 이런 짓을 함.
        // bracket 문자 치환 후 black list에 있는 element 제거
        html = html
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>');

        console.log(html);
        /*for(var i = 0; i < removeTags.length; i++){
          var removeTag = removeTags[i];
          var tagOpenRegex = new RegExp('<' + removeTag, 'ig');
          var tagCloseRegex = new RegExp('<\/' + removeTag + '>', 'ig');
          html = html
            .replace(tagOpenRegex, '')
            .replace(tagCloseRegex, '');
        }*/
        return html;
      },
      toHTML: function(html, escape){
        var markdownHTML = markdown.toHTML(html);

        if(!escape){
          markdownHTML = this.unescapeHTML(html);
        }

        return html;
      }
    }
  });
