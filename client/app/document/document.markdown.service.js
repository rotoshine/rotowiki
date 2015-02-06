'use strict';

angular.module('rotowikiApp')
  .service('markdownService', function ($sce) {
    return {
      unescapeHTML: function(markdownHTML){
        // markdown.js가 강제로 <와 >를 html entity로 만드는 바람에 이런 짓을 함.
        markdownHTML =  markdownHTML
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/&quot;/gi, '"');

        // TODO 정규표현식으로 처리할 것.
        // code 엘리먼트 사이에 들어간 놈들은 다시 escape 처리할 것

        return markdownHTML;
      },
      toHTML: function(markdownText, escape) {
        markdownText = markdown.toHTML(markdownText);
        if (!escape) {
          markdownText = this.unescapeHTML(markdownText);
        }

        markdownText = this.applyCustomHTMLSyntax(markdownText);

        return markdownText;
      },
      applyCustomHTMLSyntax: function(markdownText){
        console.log(markdownText);
        var regExpMapping = {
          '(&amp;|&)\\[(.*?)\\]': '<a href="/document/$2">$2</a>',
          '-\\[(.*?)\\]': '<strike>$1</strike>',
          '\\*\\[(.*?)\\|(.*?)\\]': '<a href="$2" target="_blank">$1<i class="fa fa-external-link"></i></a>'
        };

        for(var regExpString in regExpMapping){
          console.log(new RegExp(regExpString, 'gm'));
          markdownText = markdownText.replace(new RegExp(regExpString, 'gm'), regExpMapping[regExpString]);
        }
        return markdownText;

      }
    }
  });
