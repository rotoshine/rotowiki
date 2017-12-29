import marked from 'marked';

function scriptBurst(markdownText) {
  return markdownText
    .replace(/(<[sS][cC][rR][iI][pP][tT].*>)/gm, '')
    .replace(/(\/<[sS][cC][rR][iI][pP][tT].*>)/gm, '');
}

const CUSTOM_SYNTAX_REGEX_LIST = [
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
    replace: '<a href="$2" target="_blank">$1<i class="fa fa-external-link"></i></a>'
  },
  {
    regExp: '\\^\\[(0-9)\\|(.*?)\\]', // ex) ^[3|내용]
    replace: '<button popover="$2" class="btn btn-info">$1</button>' // TODO tooltip 만들자.
  }
  //'(```)([\\w]*)\\n([\\d\\D]*){1,}(```)': '<pre><code class="language-$2">$3</code></pre>',
];

function applyCustomSyntax(markdown) {
  if (markdown !== undefined && markdown !== '') {
    let applyResult = markdown;

    CUSTOM_SYNTAX_REGEX_LIST.forEach((syntax) => {
      applyResult = applyResult.replace(new RegExp(syntax.regExp, 'gm'), syntax.replace);
    });

    return applyResult;
  }
}
export function toHTML(markdown) {
  if (!markdown || markdown === '') {
    return '';
  }
  const scriptRemoved = scriptBurst(markdown);
  const applyResult = applyCustomSyntax(scriptRemoved);

  return marked(applyResult);
}
