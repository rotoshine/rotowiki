import moment from 'moment';
moment.locale('ko');

import { Row, Col } from 'react-bootstrap';

import ParentsDocuments from './ParentsDocuments';
import SubDocuments from './SubDocuments';

import { toHTML } from '../helpers/markdownHelpers';

const Document = ({ document }) => {
  if (!document) {
    return (
      <div className="well">존재하지 않는 문서입니다.</div>
    );
  }

  const { title, content, parents, subDocuments, updatedAt } = document;
 
  const html = toHTML(content);

  return (
    <div className="container">
      <Row>
        <Col xs={12}>
          <ParentsDocuments parents={parents} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <div className="page-header pull-left">{title}</div>
          <div className="pull-right document-top-buttons">{moment(updatedAt).fromNow()}</div>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <div dangerouslySetInnerHTML={{ __html: html}} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <SubDocuments subDocuments={subDocuments} />
        </Col>
      </Row>
    </div >
  );
};

export default Document;
