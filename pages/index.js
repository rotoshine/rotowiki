import React, { Component } from 'react';
import Layout from '../components/Layout';
import { Row, Col, Jumbotron } from 'react-bootstrap';
import 'isomorphic-fetch';

import DocumentWidget from '../components/DocumentWidget';

export default class IndexPage extends Component {
  static async getInitialProps({ req }) {
    console.log(req);
    try {
      const url = `${req.protocol}://${req.get('Host')}`;
      const res = await fetch(`${url}/api/documents/random`);
      const data = await res.json();

      return {
        randomDocument: data.document
      };
    } catch (e) {
      console.error(e);
    }
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