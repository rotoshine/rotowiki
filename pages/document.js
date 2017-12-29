import 'isomorphic-fetch';
import React, { Component } from 'react';
import Layout from '../components/Layout';
import Document from '../components/Document';

import { Well } from 'react-bootstrap';

export default class DocumentPage extends Component {
  static async getInitialProps({ req = {}, query }) {
    const { title } = query;
    try {
      const isClient = (typeof window === 'object')
      const host = isClient ? '' : `${req.protocol}://${req.get('Host')}`;

      const res = await fetch(`${host}/api/documents/${title}`);
      const data = await res.json();
      const { document } = data;

      // 대표 이미지 불러오기
      const imageRes = await fetch(`${host}/api/documents/by-id/${document._id}/files/represent`);
      const file = await imageRes.json();

      const metaImage = file.isValid ? `${host}/api/documents/by-id/${document._id}/files/${file._id}` : `${host}/static/image/profile.jpg`;

      return {
        title,
        document,
        metaImage,
        isFetchComplete: true
      };
    } catch (e) {
      console.error(e);
      return {
        hasError: true
      };
    }
  }

  render() {
    const { document, metaImage, isFetchComplete, hasError } = this.props;
    const title = decodeURIComponent(this.props.title);

    if (!document && isFetchComplete) {
      return (
        <Layout>
          {title} 이라는 이름의 문서는 존재하지 않습니다.
        </Layout>
      )
    }

    if (!document) {
      return (
        <div>로딩 중입니다..</div>
      );
    }

    if (hasError) {
      console.log('error...');
      return (
        <Layout title="로토위키">
          <Well>불운하게도, 에러가 발생했습니다. 개발자에게 연락주세요.</Well>
        </Layout>
      );
    }

    const { content } = document;
    const description = content.length < 50 ? content : `${content.substring(0, 50)}..`;
    const meta = {
      title,
      description,
      url: `http://wiki.roto.codes/document/${title}`,
      image: metaImage
    };

    return (
      <Layout title={`로토위키-${title}`} meta={meta}>
        <Document document={document} />
      </Layout>
    );
  }
}
