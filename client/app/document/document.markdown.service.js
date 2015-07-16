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
      createTableOfContents: function(markdownText){
        // TODO
      },
      applyComment: function(markdownText){
        var comments = [];
        if(markdownText !== undefined && markdownText !== ''){
          var commentRegex = new RegExp('\\^\\[(.*?)\\|(.*?)\\]');
          for(var commentIndex = 1; commentRegex.test(markdownText); commentIndex ++){
            var result = commentRegex.exec(markdownText);
            markdownText = markdownText
              .replace(commentRegex,
              '<span id="comment-text-' + commentIndex + '" class="document-comment">' +
              '<a class="comment-text" href="#comment-' + commentIndex + '" data-comment-index="' + commentIndex +
              '">$1[' + commentIndex + ']</a></span>');

            if(result.length === 3){
              comments.push('<a class="comment-content" href="#comment-text-' + commentIndex + '" ' +
                'data-comment-index="' + commentIndex + '">' +
                '<p id="comment-' + commentIndex + '">[' + commentIndex + '] ' + result[2] + '</p></a>');
            }
          }

          return {
            markdownText: markdownText,
            commentText: comments.join('')
          }
        }
        return {
          markdownText: markdownText,
          commentText: ''
        };
      },
      applyCustomHTMLSyntax: function(markdownText){
        if(markdownText !== undefined && markdownText !== ''){
          var regExps = [
            {
              regExp: '(&amp;|&)\\[(.*?)\\|(.*?)\\]', // ex) &[link title|document_title]
              replace: '<a href="/document/$3">$2</a>'
            },
            {
              regExp: '(&amp;|&)\\[(.*?)\\]', // ex) &[document_title]로
              replace: '<a href="/document/$2">$2</a>' // 문서에 (나 )가 들어가면 markdown치환을 이상하게 해서 그냥 a
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
              replace: '<button popover="$2" class="btn btn-info">$1</button>' // TODO tooltip 만들자.
            }
            //'(```)([\\w]*)\\n([\\d\\D]*){1,}(```)': '<pre><code class="language-$2">$3</code></pre>',
          ];

          for(var i = 0; i < regExps.length; i++){
            markdownText = markdownText.replace(new RegExp(regExps[i].regExp, 'gm'), regExps[i].replace);
          }
        }
        return markdownText;

      }
    };
  });
