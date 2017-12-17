const mongoose = require('mongoose');
const Document = mongoose.model('Document');
const File = require('../../models/File');
const fs = require('fs');
const { promisify } = require('util');

const DEFAULT_DOCUMENT_FIELD = '__v _id title content files likeCount parents readCount updatedAt';
const exists = promisify(fs.exists);

function handleError(res, err) {
  return res.status(500).send(err);
}

exports.findByTitle = async function (req, res) {
  try {
    console.log('request!!');
    const { title } = req.params;

    console.log('title parameter', decodeURI(title));
    const fields = `${DEFAULT_DOCUMENT_FIELD} likeUsers`;
    const document = await Document
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

    const subDocuments = await Document
      .find({ parents: { $in: [document._id] } })
      .sort('title');

    document.set('subDocuments', subDocuments);

    return res.json({
      document
    });
  } catch (e) {
    return res.json({ status: e.status, reason: e.mesasge });
  }
};

exports.findRandom = async function ( req, res) {
  try {    
    return res.json({
      document: await Document.random()
    });
  } catch (e) {
    return res.json({ status: e.status, reason: e.mesasge });
  }
};

exports.findFileByDocumentId = async function (req, res) {
  const { fileId } = req.params;

  try {
    const file = await File.findOne({ _id: fileId });

    if (!file) {
      return res.json(404, { message: '올바르지 않은 파일입니다.' });
    }

    if (await exists(file.path)) {
      res.header('content-type', file.mimeType);
      return fs.createReadStream(file.path).pipe(res);
    } else {
      return res.json(404, { message: '파일이 서버에 존재하지 않습니다.' });
    }
  } catch (e) {
    return handleError(res, e);
  }
};