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
      <style jsx>{`
        .ace-editor{
          height: 400px;
        }
        .edit-manual{
          position: fixed;
          right: -300px;
          top: 0;
          clear:both;
          z-index:1100;
          width:300px;
          height:100%;
          overflow-y:auto;
          transition: ease-in-out 0.3s all;
        }

        .edit-manual-button{
          position:fixed;
          right: 10px;
          bottom: 10px;
          z-index:1200;
          width:100px;
          height:100px;
          background-image: url('/assets/images/웨건.png');
          background-color: none;
          background-position:center;
          background-size: cover;
          border: 1px solid black;
          border-radius: 5px;
        }

        #parent-document-search-result{
          position:absolute;
          z-index:10;
          background-color:#FFFFFF;
          padding:6px;
          border-radius:5px;
          border:1px solid #487dce;
        }
        .selectable{
          cursor: pointer;
        }

        .document-list{
          border:1px solid #434ab6 ;
          margin-bottom:4px;
          border-radius:5px;
          padding:5px;
        }

        .document-list:hover{
          background-color:#434ab6 ;
          cursor: pointer;
          color: #eeeeee;
        }
        .document-list a, .document-list a:visited{
          text-decoration: none;
          color: #000000;
        }
        .markdown-view img{
          max-width: 100%;
        }
        .uploaded-file{
          border:1px solid #cccccc;
          position: relative;
          width:70px;
          height:70px;
          background-position: center;
          background-size: cover;
          cursor: pointer;
        }
        .document-edit-utils{
          margin-top:4px;
          margin-bottom:4px;
        }
        .uploaded-file .remove{
          position:absolute;
          right:5px;
          bottom:5px;
          width:25px;
          height:25px;
          border-radius:20px;
          border:none;
          background-color:#d9534f;
          color:#ffffff;
        }

        .comment-text{
          margin-top: 100px;
        }
      `}</style>
    </div >
  );
};

export default Document;
