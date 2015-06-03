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
        var regExps = [
          {
            regExp: '(&amp;|&)\\[(.*?)\\|(.*?)\\]', // ex) &[link title|document_title]
            replace: '[$2](/document/$3)'
          },
          {
            regExp: '(&amp;|&)\\[(.*?)\\]', // ex) &[document_title]
            replace: '[$2](/document/$2)'
          },
          {
            regExp: '-\\[(.*?)\\]', // ex) -[text]
            replace: '<strike>$1</strike>'
          },
          {
            regExp: '\\*\\[(.*?)\\|(.*?)\\]', // ex) *[text|external_link]
            replace:'<a href="$2" target="_blank">$1<i class="fa fa-external-link"></i></a>'
          },
          {
            regExp: '\\^\\[(0-9)\\|(.*?)\\]', // ex) ^[3|내용]
            replace: '' // TODO tooltip 만들자.
          }
          //'(```)([\\w]*)\\n([\\d\\D]*){1,}(```)': '<pre><code class="language-$2">$3</code></pre>',
        ];

        for(var i = 0; i < regExps.length; i++){
          markdownText = markdownText.replace(new RegExp(regExps[i].regExp, 'gm'), regExps[i].replace);
        }
        return markdownText;

      }
    };
  });
