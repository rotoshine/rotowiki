import React, { Component } from 'react';

import Layout from '../components/Layout';

import Document from '../components/Document';

const DEFAULT_DOCUMENT_FIELD = '__v _id title content files likeCount parents readCount updatedAt';

export default class DocumentPage extends Component {
  static async getInitialProps({ req, query }) {
    const { db } = req;
    const title = decodeURI(query.title);
    try {
      const DocumentModel = db.model('Document');

      const fields = `${DEFAULT_DOCUMENT_FIELD} likeUsers`;
      const document = await DocumentModel
        .findOne({ title }, fields)
        .populate({
          path: 'parents',
          select: DEFAULT_DOCUMENT_FIELD,
          options: {
            sort: {
              title: 1
            }
          }
        });

      const subDocuments = await DocumentModel
        .find({ parents: { $in: [document._id] } })
        .sort('title');

      document.set('subDocuments', subDocuments);

      console.log('document:', document);
      return {
        title,
        document
      };
    } catch (e) {
      console.error(e);
      return {};
    }
  }

  render() {
    return (
      <Layout>
        <Document document={this.props.document} />
      </Layout>
    );
  }
}
