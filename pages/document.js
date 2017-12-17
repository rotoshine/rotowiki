import React, { Component } from 'react';
import Layout from '../components/Layout';
import Document from '../components/Document';
import 'isomorphic-fetch';

export default class DocumentPage extends Component {
  static async getInitialProps({ req, query }) {        
    const { title } = query;

    try {
      const url = `${req.protocol}://${req.get('Host')}`;
      const res = await fetch(`${url}/api/documents/${encodeURI(title)}`);            
      const data = await res.json();    
      const { document } = data;

      return {
        title,
        document
      };
    } catch (e) {
      console.error(e.message);
      return {};
    }
  }

  render() {
    const { title, document } = this.props;

    if (!document) {
      return (
        <div>로딩 중입니다..</div>
      );
    }
    const { content } = document;
    const meta = {
      title,
      description: content,
      url: `http://wiki.roto.codes/document${title}`,
      image: ''
    };

    return (
      <Layout title={`로토위키-${title}`} meta={meta}>
        <Document document={document} />
      </Layout>
    );
  }
}
