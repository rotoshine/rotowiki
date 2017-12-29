import React from 'react';
import { renderToString } from 'react-dom';
import { Well } from 'react-bootstrap';
import { Link } from '../routes';

import { toHTML } from '../helpers/markdownHelpers';

const DocumentWidget = ({ document }) => {
  if (!document) {
    return (
      <Well>
        음...흔치 않은 일이지만 문서가 하나도 없어서 불러올 게 없네요.
      </Well>
    );
  }

  const { content } = document;
  const html = content.length > 30 ? toHTML(content.slice(0, 30) + '..') : toHTML(content);

  return (
    <Well>
      <h2>{document.title}</h2>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <div className="text-right">
        <Link route="document" params={{ title: document.title }}>
          <a className="btn btn-default">
            <i className="fa fa-book" /> <span>자세히 읽기</span>
          </a>
        </Link>
      </div>
    </Well>
  );
};
export default DocumentWidget;