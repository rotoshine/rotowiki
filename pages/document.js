import React, { Component } from 'react';
import Layout from '../components/Layout';
import Document from '../components/Document';

export default class DocumentPage extends Component {
  static async getInitialProps({ req, query }) {    
    const encodedTitle = query.title;
    
    try {
      const url = `${req.protocol}://${req.get('Host')}`;
      const res = await fetch(`${url}/api/documents/${encodedTitle}`);
      const data = await res.json();    
      const { document } = data;

      return {
        title: decodeURI(encodedTitle),
        document
      };
    } catch (e) {
      console.error(e);
      return {};
    }
  }

  render() {
    const { title, document } = this.props;
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
