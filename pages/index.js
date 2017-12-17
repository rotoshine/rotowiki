import React from 'react';
import Layout from '../components/Layout';
import { Col, Jumbotron, Row } from 'react-bootstrap';
import 'isomorphic-fetch';

import DocumentWidget from '../components/DocumentWidget';


export default class IndexPage extends React.Component {
  static async getInitialProps({ req }) {
    const isClient = (typeof window === 'object')
    const host = isClient ? '' : `${req.protocol}://${req.get('Host')}`;

    const res = await fetch(`${host}/api/documents/random`);
    const data = await res.json();

    return {
      randomDocument: data.document
    };
  }

  render() {
    const { randomDocument } = this.props;

    return (
      <Layout>
        <Row>
          <Jumbotron className="hidden-xs">
            <h1>위키를 만들고 있습니다.</h1>
            <p className="lead">여러분의 잉여력을 기다립니다.</p>
          </Jumbotron>
        </Row>
        <Row>
          <Col xs={12}>
            <h1>무작위로 불러온 문서</h1>
            <DocumentWidget document={randomDocument} />
          </Col>
        </Row>
      </Layout>
    );
  }
}
