'use strict';

angular.module('rotowikiApp')
  .service('markdownService', function () {
    return {
      scriptBurst: function(markdownText){
        return markdownText
          .replace(/(<[sS][cC][rR][iI][pP][tT].*>)/gm, '')
          .replace(/(\/<[sS][cC][rR][iI][pP][tT].*>)/gm, '');
      },
      toHTML: function(markdownText) {
        markdownText = this.scriptBurst(markdownText);
        markdownText = this.applyCustomHTMLSyntax(markdownText);
        markdownText = window.marked(markdownText);

        return markdownText;
      },
      applyCustomHTMLSyntax: function(markdownText){
        var regExpMapping = {
          '(```)([\\w]*)\\n([\\d\\D]*){1,}(```)': '<pre><code class="language-$2">$3</code></pre>',
          '(&amp;|&)\\[(.*?)\\]': '[$2](/document/$2)',
          '-\\[(.*?)\\]': '<strike>$1</strike>',
          '\\*\\[(.*?)\\|(.*?)\\]': '<a href="$2" target="_blank">$1<i class="fa fa-external-link"></i></a>'
        };

        for(var regExpString in regExpMapping){
          markdownText = markdownText.replace(new RegExp(regExpString, 'gm'), regExpMapping[regExpString]);
        }
        return markdownText;

      }
    }
  });
